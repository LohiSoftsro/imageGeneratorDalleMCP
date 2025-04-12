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

// MCP endpoints
app.post('/mcp/generate-image', async (req, res) => {
  try {
    const { prompt, size = '1024x1024', n = 1, quality = 'standard' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
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

    res.json({ 
      success: true, 
      images: images,
      usage: {
        prompt_tokens: 0,
        total_tokens: 0
      }
    });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ 
      error: 'An error occurred during image generation', 
      details: error.message 
    });
  }
});

// Cursor MCP tool operations
app.post('/mcp/mcp_image_downloader_download_image', async (req, res) => {
  try {
    const { url, outputPath } = req.body;
    
    if (!url || !outputPath) {
      return res.status(400).json({ error: 'URL and output path are required' });
    }

    console.log(`Downloading image: ${url} -> ${outputPath}`);
    
    // Actual image download
    const filePath = await downloadImage(url, outputPath);
    
    res.json({ 
      success: true, 
      filePath: filePath 
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
    const { inputPath, outputPath, width, height, quality } = req.body;
    
    if (!inputPath || !outputPath) {
      return res.status(400).json({ error: 'Input and output paths are required' });
    }

    console.log(`Optimizing image: ${inputPath} -> ${outputPath} (${width}x${height}, quality: ${quality})`);
    
    // Actual image optimization
    const filePath = await optimizeImage(inputPath, outputPath, { width, height, quality });
    
    res.json({ 
      success: true, 
      filePath: filePath 
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
}); 