#!/usr/bin/env node
// spec-v183 §2.1: the local stdio MCP server.
//
// Speaks the Model Context Protocol over stdin/stdout only — no HTTP, no SSE,
// no socket, no network egress of any kind. It imports the pure tool logic from
// ./tools.js (which imports ./catalog.js and the pure lib/*.js computes) and
// exposes the fixed three-tool surface. The server is stateless and
// side-effect-free: no filesystem writes, no persistence, no input logging, no
// telemetry. Identical { id, inputs } always yields a byte-identical result.
//
// The @modelcontextprotocol/sdk dependency lives in this subtree's own
// package.json; the website's root package.json keeps `dependencies: {}`.
// Deleting mcp/ leaves the site's build, lint, and tests green.

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { TOOL_DEFS, dispatch } from './tools.js';

const server = new Server(
  { name: 'sophiewell-calculators', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOL_DEFS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = dispatch(name, args || {});
  // The result object is the tool's payload; clients parse the JSON text. We
  // never throw across the protocol boundary — invalid input is already a
  // structured { valid: false, message } from dispatch().
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
