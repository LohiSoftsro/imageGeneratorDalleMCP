#!/usr/bin/env node

/**
 * DALL-E MCP Server Runner
 * 
 * Simple script to run the DALL-E MCP server for Cursor integration.
 * Usage: node run-server.js [port] [mcp-path]
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Parse command line arguments
const port = process.argv[2] || '3000';
const mcpBasePath = process.argv[3] || '';

// Server script path (relative to this script)
const serverScript = path.join(__dirname, 'index.js');

// Check if the server script exists
if (!fs.existsSync(serverScript)) {
  console.error(`Server script not found at ${serverScript}`);
  process.exit(1);
}

// Environment variables for the server
const env = { ...process.env };

// Set PORT environment variable
env.PORT = port;

// Set MCP_BASE_PATH if provided
if (mcpBasePath) {
  env.MCP_BASE_PATH = mcpBasePath;
  console.log(`Using MCP base path: ${mcpBasePath}`);
}

// Start the server
console.log(`Starting DALL-E MCP server on port ${port}...`);
const server = spawn('node', [serverScript], {
  env,
  stdio: 'inherit' // Inherit stdio streams
});

// Handle server process events
server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// Handle signals to gracefully shut down
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`\nReceived ${signal}. Shutting down server...`);
    server.kill(signal);
  });
});

// Forward exit to the parent process
server.on('exit', (code, signal) => {
  if (signal) {
    console.log(`Server was killed with signal: ${signal}`);
    process.exit(0);
  } else {
    console.log(`Server exited with code: ${code}`);
    process.exit(code);
  }
}); 