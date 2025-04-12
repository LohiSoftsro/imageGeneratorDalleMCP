# DALL-E 3 MCP Server for Cursor

This project provides an OpenAI DALL-E 3 image generator MCP (Model Code Proxy) server for the Cursor IDE. It allows the creation and management of DALL-E 3 generated images directly from the Cursor development environment.

## Features

- Generate DALL-E 3 images based on prompts
- Create images in various sizes and qualities
- Automatically download and store images
- Optimize images (resize, compress)
- Simple web interface for testing
- MCP-compatible endpoints for Cursor

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

### MCP Endpoints

The server provides the following MCP endpoints:

- `POST /mcp/generate-image`: Generate DALL-E 3 image
- `POST /mcp/mcp_image_downloader_download_image`: Download image from URL
- `POST /mcp/mcp_image_downloader_optimize_image`: Optimize image

## Integration with Cursor IDE

To integrate with Cursor IDE, follow these steps:

1. Start your server, ensure it's running at http://localhost:3000
2. Open Cursor IDE
3. Go to Settings > Extensions > MCP Server
4. Enter the MCP Server URL: `http://localhost:3000/mcp`
5. Save the settings

After integration, you can access DALL-E image generation directly from Cursor using commands like:

```
/generate-image "A beautiful sunset over mountains"
```

or by using the MCP tools in Cursor's command palette.

### Cursor Extension Commands

Once integrated, you can use commands like:

1. **Generate Image**: Creates a new DALL-E 3 image from a prompt
2. **Download Image**: Downloads an image from a URL to a local path
3. **Optimize Image**: Resizes and optimizes an existing image

### Troubleshooting Cursor Integration

If the integration doesn't work:

1. Ensure your server is running (check http://localhost:3000 in a browser)
2. Verify you've entered the correct MCP URL in Cursor settings
3. Check that your OpenAI API key is valid and has access to DALL-E
4. Restart Cursor after setting up the MCP server

## Development

### Project Structure

- `index.js`: Main server file with Express routes and MCP endpoints
- `imageUtils.js`: Image downloading and optimization utilities
- `public/`: Static files and the web interface
- `.env`: Environment variables
- `package.json`: Project dependencies and scripts

### Adding New Features

To add new image operations or features:

1. Add new functions to `imageUtils.js`
2. Create new endpoints in `index.js`
3. Update the web interface if needed

## Troubleshooting

- Make sure your OpenAI API key is valid
- Check server logs for error messages
- Verify the server is running and accessible on the specified port
- If image optimization fails, ensure the sharp library is properly installed

## License

ISC

---

© 2023 - Created for Cursor IDE integration 