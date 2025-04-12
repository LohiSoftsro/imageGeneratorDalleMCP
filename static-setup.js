#!/usr/bin/env node

/**
 * DALL-E MCP Static Setup for Cursor
 * 
 * This setup creates a static MCP configuration that points to the local files
 * instead of running a server. This is more advanced and requires manual setup,
 * but doesn't need a running server.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Paths for cursor configuration
const homeCursorDir = path.join(os.homedir(), '.cursor');
const projectCursorDir = path.join(process.cwd(), '.cursor');

// Function to create directory if it doesn't exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Create project .cursor directory
ensureDir(projectCursorDir);

// Prompt for OpenAI API key
rl.question('Enter your OpenAI API key (required for DALL-E): ', (apiKey) => {
  if (!apiKey) {
    console.error('Error: OpenAI API key is required.');
    rl.close();
    process.exit(1);
  }

  // Create stdio MCP configuration
  const mcpConfig = {
    mcpServers: {
      "dalle-mcp-generator": {
        command: "node",
        args: [path.join(process.cwd(), "index.js")],
        env: {
          OPENAI_API_KEY: apiKey
        }
      }
    }
  };

  // Write project-level configuration
  const projectMcpPath = path.join(projectCursorDir, 'mcp.json');
  fs.writeFileSync(projectMcpPath, JSON.stringify(mcpConfig, null, 2));
  console.log(`Created project MCP configuration: ${projectMcpPath}`);

  // Ask if user wants global config
  rl.question('\nDo you want to create a global configuration for all projects? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      ensureDir(homeCursorDir);
      
      const globalMcpPath = path.join(homeCursorDir, 'mcp.json');
      
      // For global config, use absolute path
      const globalConfig = {
        mcpServers: {
          "dalle-mcp-generator": {
            command: "node",
            args: [path.resolve(process.cwd(), "index.js")],
            env: {
              OPENAI_API_KEY: apiKey
            }
          }
        }
      };
      
      fs.writeFileSync(globalMcpPath, JSON.stringify(globalConfig, null, 2));
      console.log(`Created global MCP configuration: ${globalMcpPath}`);
    }

    console.log('\nStatic MCP setup complete!');
    console.log('\nIMPORTANT: This setup uses the stdio transport method which is');
    console.log('directly managed by Cursor. No need to run a separate server.');
    console.log('\nYou can now use DALL-E image generation in Cursor right away!');
    console.log('Just ask the Cursor AI something like:');
    console.log('  "Generate an image of a sunset over mountains"');

    rl.close();
  });
}); 