# DALL-E 3 MCP Server for Cursor

This project provides an OpenAI DALL-E 3 image generator MCP (Model Context Protocol) server for the Cursor IDE. It allows the creation and management of DALL-E 3 generated images directly from the Cursor development environment.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context and tools to LLMs. It acts as a plugin system for Cursor, allowing you to extend the AI Agent's capabilities by connecting it to various data sources and tools through standardized interfaces.

This server implements MCP protocol to provide DALL-E 3 image generation capabilities directly in Cursor.

## Features

- Generate DALL-E 3 images based on prompts
- Create images in various sizes and qualities
- Automatically download and store images
- Optimize images (resize, compress)
- Simple web interface for testing
- MCP-compatible endpoints for Cursor integration

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dalle-mcp-server.git
cd dalle-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on the example:
```bash
cp .env.example .env
```

4. Get a valid OpenAI API key from the [OpenAI Platform](https://platform.openai.com/api-keys) and add it to your `.env` file.

## Usage

### Starting the Server

For development mode (with auto-restart):
```bash
npm run dev
```

Or normal mode:
```bash
npm start
```

The server will be available at http://localhost:3000.

### Building for Production

To build and run the server for production:

```bash
# Install dependencies
npm install

# Set the environment variables
cp .env.example .env
# Edit .env with your OpenAI API key

# Start the server
npm start
```

For a more robust production setup, consider using a process manager like PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start the server with PM2
pm2 start index.js --name dalle-mcp-server

# To ensure it starts on system reboot
pm2 startup
pm2 save
```

### Web Interface

The server provides a simple web interface at http://localhost:3000 where you can test the image generation.

## MCP Protocol Implementation

This server implements the MCP protocol using the SSE (Server-Sent Events) transport method. The following MCP endpoints are available:

- `GET /mcp`: Returns the MCP server specification
- `GET /mcp/sse`: SSE endpoint for real-time communication with Cursor
- `POST /mcp/tools`: Endpoint for executing MCP tools

### Available MCP Tools

The server provides the following tools that can be used directly from Cursor:

1. **generate_image**: Generate images using DALL-E 3
   - Parameters: prompt, size (optional), quality (optional), n (optional)

2. **download_image**: Download an image from a URL
   - Parameters: url, outputPath

3. **optimize_image**: Resize and optimize an image
   - Parameters: inputPath, outputPath, width (optional), height (optional), quality (optional)

## Integration with Cursor IDE

To integrate this MCP server with Cursor, follow these steps:

1. Start your MCP server (ensure it's running at http://localhost:3000)
2. Open Cursor IDE
3. Click on Settings (gear icon) in the bottom left
4. Go to Extensions > MCP Server
5. Add a new MCP server with the URL: `http://localhost:3000/mcp/sse`
6. Save the settings

### Testing MCP Integration in Cursor

Once the MCP server is integrated with Cursor, you can use the image generation capabilities directly in Cursor's AI chat by asking to generate an image. For example:

1. Open the AI chat in Cursor
2. Type a request such as: "Generate an image of a mountain landscape at sunset"
3. Cursor will recognize this as an image generation request and use the MCP tool

You can also explicitly request to use a specific tool:

```
Can you generate an image using the DALL-E generator? I want a picture of a futuristic city skyline.
```

### MCP Configuration File

Alternatively, you can create an MCP configuration file in your project or home directory:

For project-specific configuration:
```json
// .cursor/mcp.json
{
  "mcpServers": {
    "dalle-image-generator": {
      "url": "http://localhost:3000/mcp/sse"
    }
  }
}
```

For global configuration:
```json
// ~/.cursor/mcp.json
{
  "mcpServers": {
    "dalle-image-generator": {
      "url": "http://localhost:3000/mcp/sse"
    }
  }
}
```

## Troubleshooting

- Make sure your OpenAI API key is valid and has access to DALL-E
- Check that the MCP server is running and accessible at http://localhost:3000
- Verify the SSE endpoint is correctly configured in Cursor
- Check server logs for error messages
- Restart Cursor after configuring the MCP server
- If you're getting CORS errors, make sure the CORS settings in the server allow requests from Cursor

## Development

### Project Structure

- `index.js`: Main server file with Express routes and MCP endpoints
- `imageUtils.js`: Image downloading and optimization utilities
- `public/`: Static files and the web interface
- `.env`: Environment variables
- `package.json`: Project dependencies and scripts

### Adding New MCP Tools

To add new tools to the MCP server:

1. Add the tool definition to the `mcpTools` array in `index.js`
2. Create a handler function for the tool
3. Add the tool routing in the `app.post('/mcp/tools')` endpoint

## License

ISC

---

© 2023 - Created for Cursor IDE integration 