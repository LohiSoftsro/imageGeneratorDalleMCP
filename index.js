const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { downloadImage, optimizeImage } = require('./imageUtils');

// Load environment variables
dotenv.config();

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Configure middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Tool definitions for MCP
const mcpTools = [
  {
    name: "generate_image",
    description: "Generate an image using DALL-E 3 based on a text prompt",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "A detailed text description of the image you want to generate"
        },
        size: {
          type: "string",
          description: "Image size in pixels (width x height)",
          enum: ["1024x1024", "1792x1024", "1024x1792"],
          default: "1024x1024"
        },
        quality: {
          type: "string",
          description: "Image quality",
          enum: ["standard", "hd"],
          default: "standard"
        },
        n: {
          type: "integer",
          description: "Number of images to generate",
          default: 1,
          minimum: 1,
          maximum: 1
        }
      },
      required: ["prompt"]
    }
  },
  {
    name: "download_image",
    description: "Download an image from a URL to a specified path",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the image to download"
        },
        outputPath: {
          type: "string",
          description: "Path where to save the image"
        }
      },
      required: ["url", "outputPath"]
    }
  },
  {
    name: "optimize_image",
    description: "Create an optimized version of an image",
    parameters: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Path to the input image"
        },
        outputPath: {
          type: "string",
          description: "Path where to save the optimized image"
        },
        width: {
          type: "integer",
          description: "Target width (maintains aspect ratio if only width is specified)"
        },
        height: {
          type: "integer",
          description: "Target height (maintains aspect ratio if only height is specified)"
        },
        quality: {
          type: "integer",
          description: "JPEG/WebP quality (1-100)",
          minimum: 1,
          maximum: 100,
          default: 80
        }
      },
      required: ["inputPath", "outputPath"]
    }
  }
];

// MCP specifications endpoint
app.get('/mcp', (req, res) => {
  res.json({
    schemaVersion: 1,
    name: "DALL-E Image Generator",
    description: "Generate, download and optimize images using OpenAI's DALL-E 3",
    contact: "https://github.com/yourusername/dalle-mcp-server",
    auth: {
      type: "none"
    },
    tools: mcpTools
  });
});

// MCP SSE endpoint for Cursor integration
app.get('/mcp/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial SSE connection established event
  res.write(`data: ${JSON.stringify({ type: "connection_established" })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    console.log('SSE connection closed');
  });
});

// Tool endpoint for handling MCP tool executions
app.post('/mcp/tools', async (req, res) => {
  const { name, parameters, tool_call_id } = req.body;

  try {
    let result;

    // Route to the appropriate tool handler
    if (name === "generate_image") {
      result = await handleGenerateImage(parameters);
    } else if (name === "download_image") {
      result = await handleDownloadImage(parameters);
    } else if (name === "optimize_image") {
      result = await handleOptimizeImage(parameters);
    } else {
      return res.status(400).json({
        tool_call_id,
        status: "error",
        error: `Unknown tool: ${name}`
      });
    }

    // Return successful result
    res.json({
      tool_call_id,
      status: "success",
      result
    });
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    res.status(500).json({
      tool_call_id,
      status: "error",
      error: error.message
    });
  }
});

// Tool handlers
async function handleGenerateImage(parameters) {
  const { prompt, size = '1024x1024', n = 1, quality = 'standard' } = parameters;
  
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  console.log(`Generating image: "${prompt}"`);
  
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: n,
    size: size,
    quality: quality,
  });

  // Download and save images
  const images = [];
  for (let i = 0; i < response.data.length; i++) {
    const imageUrl = response.data[i].url;
    const imageName = `dalle_${Date.now()}_${i}.png`;
    const imagePath = path.join(imagesDir, imageName);
    
    try {
      // Actually download the image
      await downloadImage(imageUrl, imagePath);
      
      const publicPath = `/images/${imageName}`;
      images.push({
        url: imageUrl,
        saved_path: publicPath,
        revised_prompt: response.data[i].revised_prompt
      });
    } catch (downloadError) {
      console.error('Error downloading image:', downloadError);
      // Return the URL even if download failed
      images.push({
        url: imageUrl,
        saved_path: null,
        error: 'Failed to download image',
        revised_prompt: response.data[i].revised_prompt
      });
    }
  }

  return {
    images: images
  };
}

async function handleDownloadImage(parameters) {
  const { url, outputPath } = parameters;
  
  if (!url || !outputPath) {
    throw new Error('URL and output path are required');
  }

  console.log(`Downloading image: ${url} -> ${outputPath}`);
  
  // Actual image download
  const filePath = await downloadImage(url, outputPath);
  
  return {
    filePath: filePath
  };
}

async function handleOptimizeImage(parameters) {
  const { inputPath, outputPath, width, height, quality } = parameters;
  
  if (!inputPath || !outputPath) {
    throw new Error('Input and output paths are required');
  }

  console.log(`Optimizing image: ${inputPath} -> ${outputPath} (${width}x${height}, quality: ${quality})`);
  
  // Actual image optimization
  const filePath = await optimizeImage(inputPath, outputPath, { width, height, quality });
  
  return {
    filePath: filePath
  };
}

// Legacy endpoints for backward compatibility
app.post('/mcp/generate-image', async (req, res) => {
  try {
    const result = await handleGenerateImage(req.body);
    res.json({ 
      success: true, 
      ...result
    });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ 
      error: 'An error occurred during image generation', 
      details: error.message 
    });
  }
});

app.post('/mcp/mcp_image_downloader_download_image', async (req, res) => {
  try {
    const result = await handleDownloadImage(req.body);
    res.json({ 
      success: true, 
      ...result
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    res.status(500).json({ 
      error: 'An error occurred while downloading the image', 
      details: error.message 
    });
  }
});

app.post('/mcp/mcp_image_downloader_optimize_image', async (req, res) => {
  try {
    const result = await handleOptimizeImage(req.body);
    res.json({ 
      success: true, 
      ...result
    });
  } catch (error) {
    console.error('Error optimizing image:', error);
    res.status(500).json({ 
      error: 'An error occurred while optimizing the image', 
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`DALL-E MCP server running at http://localhost:${PORT}`);
  console.log(`MCP endpoint available at http://localhost:${PORT}/mcp`);
  console.log(`MCP SSE endpoint available at http://localhost:${PORT}/mcp/sse`);
}); 