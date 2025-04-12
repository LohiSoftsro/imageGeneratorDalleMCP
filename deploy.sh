#!/bin/bash

# Build script for DALL-E MCP Server deployment

# Exit on error
set -e

echo "Building DALL-E MCP Server for deployment..."

# Install dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
  echo "IMPORTANT: Please edit the .env file to add your OpenAI API key."
fi

# Create necessary directories
mkdir -p public/images

# Build the project
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo "PM2 not found. Installing globally..."
  npm install -g pm2
fi

# Start or restart the server with PM2
if pm2 list | grep -q "dalle-mcp-server"; then
  echo "Restarting existing PM2 process..."
  pm2 restart dalle-mcp-server
else
  echo "Starting new PM2 process..."
  pm2 start index.js --name dalle-mcp-server
fi

# Set up PM2 to start on system boot
echo "Setting up PM2 to start on system boot..."
pm2 save
pm2 startup

echo ""
echo "Deployment completed successfully!"
echo "The DALL-E MCP Server is now running at http://localhost:3000"
echo "MCP endpoint available at http://localhost:3000/mcp"
echo "MCP SSE endpoint for Cursor integration at http://localhost:3000/mcp/sse"
echo ""
echo "To configure Cursor:"
echo "1. Open Cursor IDE"
echo "2. Go to Settings > Extensions > MCP Server"
echo "3. Add an MCP server with the URL: http://localhost:3000/mcp/sse"
echo ""
echo "Alternatively, you can create a .cursor/mcp.json file in your project:"
echo '{
  "mcpServers": {
    "dalle-image-generator": {
      "url": "http://localhost:3000/mcp/sse"
    }
  }
}' 