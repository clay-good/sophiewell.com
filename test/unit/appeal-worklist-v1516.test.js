// spec-v1516 tool 3: appeal worklist.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appealWorklist as w } from '../../lib/denial-next-step-v1516.js';

const claims = 'C-100, medicare, 2026-08-01, 1200\nC-101, ma, 2026-08-20, 5400\nC-102, medicaid, 2026-09-01, 800, 90\nC-103, ma, 2026-06-01, 300\nC-104, employer, 2026-09-10, 2500';

test('sorted by days left, then amount; missed deadlines listed apart', () => {
  const r = w({ claims, asOf: '2026-09-26' });
  assert.deepEqual(r.open.map((x) => x.ref), ['C-101', 'C-102', 'C-100', 'C-104']);
  assert.deepEqual(r.past, ['C-103']);
  assert.equal(r.open[0].due, '2026-10-24');
});

test('ties on days left sort by the larger amount first', () => {
  const r = w({ claims: 'A, ma, 2026-09-01, 100\nB, ma, 2026-09-01, 900', asOf: '2026-09-26' });
  assert.deepEqual(r.open.map((x) => x.ref), ['B', 'A']);
});

test('medicaid and other need a window; bad lines ask', () => {
  assert.equal(w({ claims: 'X, medicaid, 2026-09-01, 100', asOf: '2026-09-26' }).valid, false);
  assert.match(w({ claims: 'X, cigna, 2026-09-01, 100' }).message, /payer type/);
  assert.equal(w({}).valid, false);
});
