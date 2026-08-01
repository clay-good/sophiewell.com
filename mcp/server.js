#!/usr/bin/env node
// spec-v183 §2.1: the local stdio MCP server.
//
// Speaks the Model Context Protocol over stdin/stdout only — no HTTP, no SSE,
// no socket, no network egress of any kind. It imports the pure tool logic from
// ./tools.js (which imports ./catalog.js and the pure lib/*.js computes) and
// exposes the fixed four-tool surface. The server is stateless and
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

import { TOOL_DEFS, dispatch, toCallToolResult, SERVER_INSTRUCTIONS } from './tools.js';

// spec-v634 §1: `instructions` orients the model on the discover -> describe ->
// compute pipeline and the read-only / deterministic / citation posture.
const server = new Server(
  { name: 'sophiewell-calculators', version: '1.0.0' },
  { capabilities: { tools: {} }, instructions: SERVER_INSTRUCTIONS },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOL_DEFS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = dispatch(name, args || {});
  // spec-v634 §3: return both the text block (back-compat) and structuredContent
  // (the same payload typed) so agents need not re-parse a JSON string. We never
  // throw across the protocol boundary — invalid input is already a structured
  // { valid: false, message } from dispatch().
  return toCallToolResult(result);
});

const transport = new StdioServerTransport();
await server.connect(transport);
