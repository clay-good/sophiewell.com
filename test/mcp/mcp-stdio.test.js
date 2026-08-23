import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

function readJsonLine(stream) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const onData = (chunk) => {
      buffer += chunk;
      const newline = buffer.indexOf('\n');
      if (newline < 0) return;
      cleanup();
      try { resolve(JSON.parse(buffer.slice(0, newline))); } catch (error) { reject(error); }
    };
    const onError = (error) => { cleanup(); reject(error); };
    const cleanup = () => {
      stream.off('data', onData);
      stream.off('error', onError);
    };
    stream.on('data', onData);
    stream.on('error', onError);
  });
}

test('the installed MCP server completes a real stdio handshake and lists tools', async () => {
  const child = spawn(process.execPath, ['mcp/server.js'], { stdio: ['pipe', 'pipe', 'pipe'] });
  try {
    child.stdin.write(`${JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'ci-smoke', version: '1.0.0' },
      },
    })}\n`);
    const initialized = await readJsonLine(child.stdout);
    assert.equal(initialized.id, 1);
    assert.equal(initialized.result.serverInfo.name, 'sophiewell-calculators');

    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`);
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })}\n`);
    const listed = await readJsonLine(child.stdout);
    assert.equal(listed.id, 2);
    assert.ok(listed.result.tools.some((tool) => tool.name === 'compute_calculator'));
  } finally {
    child.kill('SIGTERM');
    await once(child, 'exit');
  }
});
