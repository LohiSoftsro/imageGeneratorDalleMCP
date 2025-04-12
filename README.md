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

## Quick Start

### Installation

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

4. Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Setup Options

You have two ways to integrate with Cursor:

#### Option 1: Static Setup (Recommended)

This option uses the stdio transport method, which is directly managed by Cursor without needing a running server:

```bash
npm run setup
```

This will:
- Ask for your OpenAI API key
- Create the required MCP configuration files
- Set up everything for direct usage in Cursor, no server needed

#### Option 2: Server-based Setup

If you prefer to run a separate server:

```bash
# Configure for Cursor
npm run install-mcp

# Start the server
node run-server.js
```

## Building for Distribution

To build a standalone distribution:

```bash
npm run build
```

This creates a `build` directory with everything needed to run the server. To use the build:

```bash
cd build
npm start
# or
node run-server.js
```

## MCP Protocol Implementation

This server implements the MCP protocol using both transport methods:

1. **SSE Transport**: For server-based integration
   - `GET /mcp`: Returns the MCP server specification
   - `GET /mcp/sse`: SSE endpoint for real-time communication with Cursor
   - `POST /mcp/tools`: Endpoint for executing MCP tools

2. **stdio Transport**: For direct integration without a server
   - Cursor manages the process directly
   - No need to keep a server running

### Available MCP Tools

The server provides the following tools that can be used directly from Cursor:

1. **generate_image**: Generate images using DALL-E 3
   - Parameters: prompt, size (optional), quality (optional), n (optional)

2. **download_image**: Download an image from a URL
   - Parameters: url, outputPath

3. **optimize_image**: Resize and optimize an image
   - Parameters: inputPath, outputPath, width (optional), height (optional), quality (optional)

## Using in Cursor

Once configured using either method, you can use DALL-E directly in Cursor:

1. Open Cursor IDE
2. In the AI chat, ask to generate an image like:
   ```
   Generate an image of a mountain landscape at sunset
   ```

3. Cursor will use the MCP tools to generate the image

## Advanced Configuration

### Server-based Config

#### Custom Port

You can specify a custom port by:
- Setting the `PORT` environment variable in .env
- Passing it as a parameter to run-server.js: `node run-server.js 3001`

#### Custom Base Path

If you're running behind a proxy, you can specify a base path:
- Passing it as a second parameter: `node run-server.js 3000 /api`
- This makes endpoints available at `/api/mcp/...` instead of `/mcp/...`

### Manual Cursor Configuration

#### For stdio Transport (No Server)

```json
{
  "mcpServers": {
    "dalle-mcp-generator": {
      "command": "node",
      "args": ["/path/to/index.js"],
      "env": {
        "OPENAI_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

#### For SSE Transport (With Server)

```json
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
- For server mode: Verify the server is running and accessible at the specified URL
- For stdio mode: Ensure the path to index.js in the configuration is correct
- Check Cursor's logs for MCP-related errors
- If port 3000 is already in use, the server will automatically try port 3001

## License

ISC

---

© 2023 - Created for Cursor IDE integration 