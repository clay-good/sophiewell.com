// spec-v1628 section 1: through the MCP server, a gated tool whose label lapsed refuses with LABEL_WITHHELD.
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('a lapsed label gives LABEL_WITHHELD with the current label links; a current one computes', async () => {
  const { computeCalculator } = await import('../../mcp/tools.js');
  const args = { id: 'digoxin', inputs: { 'dig-crcl': 60, 'dig-ind': 'hf' } };
  const before = process.env.SOPHIEWELL_NOW;
  try {
    process.env.SOPHIEWELL_NOW = '2031-01-01';
    const r = computeCalculator(args);
    assert.deepEqual([r.valid, r.code], [false, 'LABEL_WITHHELD']);
    assert.match(r.labelLinks[0], /^https:\/\/dailymed\.nlm\.nih\.gov\//);
    process.env.SOPHIEWELL_NOW = '2026-10-15';
    assert.notEqual(computeCalculator(args).code, 'LABEL_WITHHELD');
  } finally {
    if (before === undefined) delete process.env.SOPHIEWELL_NOW; else process.env.SOPHIEWELL_NOW = before;
  }
});
