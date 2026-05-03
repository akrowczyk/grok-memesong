#!/usr/bin/env node

/**
 * MemeSong MCP Server — Entry Point
 * 
 * Connects the MCP server to stdio transport for Claude Desktop.
 * 
 * Installation in claude_desktop_config.json:
 * {
 *   "mcpServers": {
 *     "memesong": {
 *       "command": "node",
 *       "args": ["/path/to/memesong-mcp/dist/index.js"]
 *     }
 *   }
 * }
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { server } from './server.js';

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error('MemeSong MCP server failed to start:', error);
    process.exit(1);
});
