#!/usr/bin/env node

/**
 * DALL-E MCP Server Installer for Cursor
 * 
 * Sets up the Cursor configuration for the DALL-E MCP server.
 * Usage: node install.js [port] [basepath]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Default settings
const defaultPort = 3000;
const defaultBasePath = '';

// Parse command line arguments
const port = process.argv[2] || defaultPort;
const basePath = process.argv[3] || defaultBasePath;

// Construct the MCP server URL
const serverUrl = `http://localhost:${port}${basePath}/mcp/sse`;

// Paths for cursor configuration
const homeCursorDir = path.join(os.homedir(), '.cursor');
const projectCursorDir = path.join(process.cwd(), '.cursor');

// Create .cursor directory in the current project
if (!fs.existsSync(projectCursorDir)) {
  fs.mkdirSync(projectCursorDir, { recursive: true });
  console.log(`Created directory: ${projectCursorDir}`);
}

// Create mcp.json configuration file
const mcpConfig = {
  mcpServers: {
    "dalle-image-generator": {
      url: serverUrl
    }
  }
};

// Write project-level configuration
const projectMcpPath = path.join(projectCursorDir, 'mcp.json');
fs.writeFileSync(projectMcpPath, JSON.stringify(mcpConfig, null, 2));
console.log(`Created project MCP configuration: ${projectMcpPath}`);

// Ask user if they want to create a global configuration
console.log('\nDo you want to create a global configuration for all projects? (y/N)');
process.stdin.once('data', (data) => {
  const answer = data.toString().trim().toLowerCase();
  
  if (answer === 'y' || answer === 'yes') {
    // Create global .cursor directory if it doesn't exist
    if (!fs.existsSync(homeCursorDir)) {
      fs.mkdirSync(homeCursorDir, { recursive: true });
      console.log(`Created directory: ${homeCursorDir}`);
    }
    
    // Write global configuration
    const globalMcpPath = path.join(homeCursorDir, 'mcp.json');
    fs.writeFileSync(globalMcpPath, JSON.stringify(mcpConfig, null, 2));
    console.log(`Created global MCP configuration: ${globalMcpPath}`);
  }
  
  // Setup complete
  console.log('\nInstallation complete!');
  console.log('\nTo start the server:');
  console.log(`  node run-server.js ${port} ${basePath}`);
  console.log('\nServer will be available at:');
  console.log(`  ${serverUrl}`);
  console.log('\nConfigured in Cursor. You can use DALL-E image generation in Cursor now!');
  
  process.exit(0);
}); 