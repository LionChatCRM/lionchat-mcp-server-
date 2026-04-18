#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { loadConfig } from './config.js';
import { LionChatClient } from './client.js';
import { registerTools } from './tools.js';

// AIDEV-NOTE: Read version from package.json to avoid hardcoding in multiple places
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8'));
const VERSION: string = pkg.version;

async function main() {
  try {
    // AIDEV-NOTE: Load configuration from env vars (LIONCHAT_BASE_URL, LIONCHAT_API_TOKEN, etc.)
    const config = loadConfig();

    // AIDEV-NOTE: Warn if base URL is not HTTPS (token would be sent in cleartext)
    if (
      !config.baseUrl.startsWith('https://') &&
      !config.baseUrl.includes('localhost') &&
      !config.baseUrl.includes('127.0.0.1')
    ) {
      console.error('WARNING: Base URL is not HTTPS. API token may be transmitted in cleartext.');
    }

    // AIDEV-NOTE: Create MCP server instance with name and version from package.json
    const server = new McpServer({
      name: 'lionchat-mcp-server',
      version: VERSION,
    });

    // AIDEV-NOTE: Create HTTP client that wraps fetch calls to LionChat API
    const client = new LionChatClient(config);

    // AIDEV-NOTE: Register tools from endpoints.json, filtered by config.categories if set
    const toolCount = registerTools(server, config, client);

    // AIDEV-NOTE: Use stderr for logs — stdout is reserved for MCP JSON-RPC protocol
    console.error(`LionChat MCP Server v${VERSION}`);
    console.error(`Base URL: ${config.baseUrl}`);
    console.error(`Account: ${config.accountId}`);
    console.error(`Tools registered: ${toolCount}`);
    if (config.categories) {
      console.error(`Categories filter: ${config.categories.join(', ')}`);
    }

    // AIDEV-NOTE: Connect via stdio transport (stdin/stdout JSON-RPC)
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
