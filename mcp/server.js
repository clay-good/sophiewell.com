#!/usr/bin/env node
// spec-v183 §2.1: the local stdio MCP server.
//
// Speaks the Model Context Protocol over stdin/stdout only — no HTTP, no SSE,
// no socket, no network egress of any kind. It imports the pure tool logic from
// ./tools.js (which imports ./catalog.js and the pure lib/*.js computes) and
// exposes the fixed tool surface, plus the two file tools of ./file-tools.js. The server is stateless and
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

import { delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOL_DEFS, dispatch, toCallToolResult, SERVER_INSTRUCTIONS } from './tools.js';
import { FILE_TOOL_DEFS, fileDispatch } from './file-tools.js';

// spec-v634 §1: `instructions` orients the model on the discover -> describe ->
// compute pipeline and the read-only / deterministic / citation posture.
const server = new Server(
  { name: 'sophiewell-calculators', version: '1.0.0' },
  { capabilities: { tools: {} }, instructions: SERVER_INSTRUCTIONS },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [...TOOL_DEFS, ...FILE_TOOL_DEFS] }));

// spec-v1625: the directories a file tool may read -- the client's MCP roots,
// or SOPHIEWELL_MCP_ROOTS (path-delimited) when the client shares none.
async function sharedRoots() {
  try {
    const { roots } = await server.listRoots();
    const dirs = (roots || []).filter((r) => String(r.uri).startsWith('file:')).map((r) => fileURLToPath(r.uri));
    if (dirs.length) return dirs;
  } catch { /* the client does not offer roots */ }
  return String(process.env.SOPHIEWELL_MCP_ROOTS || '').split(delimiter).filter(Boolean);
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const fileResult = FILE_TOOL_DEFS.some((t) => t.name === name)
    ? await fileDispatch(name, args || {}, { roots: await sharedRoots() })
    : null;
  const result = fileResult || dispatch(name, args || {});
  // spec-v634 §3: return both the text block (back-compat) and structuredContent
  // (the same payload typed) so agents need not re-parse a JSON string. We never
  // throw across the protocol boundary — invalid input is already a structured
  // { valid: false, message } from dispatch().
  return toCallToolResult(result);
});

const transport = new StdioServerTransport();
await server.connect(transport);
