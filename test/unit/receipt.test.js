// spec-v1625 step 1: receipts. Same input, same hash; a changed data edition
// changes the check; shareable names; no file content in a receipt.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { Sha256, sha256Hex, sha256Blob } from '../../lib/sha256.js';
import { canonicalize, resultHash, buildReceipt, shareable, isReceipt, compareReceipts, RECEIPT_VERSION } from '../../lib/receipt.js';

test('SHA-256 matches node:crypto on every block boundary, whole or in pieces', async () => {
  for (const n of [0, 1, 55, 56, 63, 64, 65, 119, 120, 127, 128, 1000, 70001]) {
    const b = randomBytes(n);
    const want = createHash('sha256').update(b).digest('hex');
    assert.equal(sha256Hex(b), want, `${n} bytes`);
    const h = new Sha256();
    for (let i = 0; i < n; i += 13) h.update(b.subarray(i, i + 13));
    assert.equal(h.hex(), want, `${n} bytes in 13-byte pieces`);
  }
  assert.equal(sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const big = randomBytes(3 * 1024 * 1024 + 5);
  assert.equal(await sha256Blob(new Blob([big]), 1024 * 1024), createHash('sha256').update(big).digest('hex'));
});

test('canonical form: keys sorted, order kept, undefined dropped', () => {
  assert.equal(canonicalize({ b: 1, a: [3, { d: undefined, c: 'x' }], e: -0 }), '{"a":[3,{"c":"x"}],"b":1,"e":0}');
  assert.equal(resultHash({ x: 1, y: 2 }), resultHash({ y: 2, x: 1 }));
  assert.notEqual(resultHash([1, 2]), resultHash([2, 1]));
});

const files = [{ name: 'smith_era.835', size: 10, sha256: 'a'.repeat(64), kind: 'x12-835', evidence: ['ST01 is 835.'] }];

test('buildReceipt: same inputs give the same hash; ranAt is outside it', () => {
  const r1 = buildReceipt({ files, tool: 'x12-835-reader', commit: 'abc', result: { claims: 2 }, ranAt: '2026-09-29T00:00:00Z' });
  const r2 = buildReceipt({ files, tool: 'x12-835-reader', commit: 'abc', result: { claims: 2 }, ranAt: '2026-09-30T00:00:00Z' });
  assert.equal(r1.receiptVersion, RECEIPT_VERSION);
  assert.equal(r1.resultHash, r2.resultHash);
  assert.ok(isReceipt(r1));
  assert.deepEqual(compareReceipts(r1, r2), { reproduced: true, differences: [] });
});

test('a changed data edition is named before the result', () => {
  const data = (ed) => [{ id: 'mpfs', sourceEdition: ed, coverage: 'full', status: 'current' }];
  const a = buildReceipt({ files, tool: 't', commit: 'c', data: data('RVU26C'), result: { cents: 100 } });
  const b = buildReceipt({ files, tool: 't', commit: 'c', data: data('RVU26D'), result: { cents: 101 } });
  const c = compareReceipts(a, b);
  assert.equal(c.reproduced, false);
  assert.deepEqual(c.differences, ['The mpfs data differs: RVU26C then, RVU26D now.', 'The result differs.']);
});

test('shareable replaces every name with its kind and position', () => {
  const r = buildReceipt({ files: [...files, { ...files[0], name: 'jones.835' }], tool: 't', result: {} });
  const s = shareable(r, (k) => (k === 'x12-835' ? 'Remittance (835) file' : k));
  assert.deepEqual(s.files.map((f) => f.name), ['Remittance (835) file 1 of 2', 'Remittance (835) file 2 of 2']);
  assert.ok(!JSON.stringify(s).includes('smith'));
  assert.equal(r.files[0].name, 'smith_era.835', 'the original is not changed');
});

test('privateOptions keeps settings and records free text only by its hash', async () => {
  const { privateOptions } = await import('../../lib/receipt-worker.js');
  const stays = 'Jane Doe 2026-01-05 2026-01-09\nJohn Roe 2026-02-01 2026-02-03';
  const o = privateOptions({ year: '2026', asOf: '2026-09-29', gapDays: '30', stays });
  assert.deepEqual(Object.keys(o), ['year', 'asOf', 'gapDays', 'stays']);
  assert.equal(o.year, '2026');
  assert.equal(o.stays.sha256, sha256Hex(stays));
  assert.ok(!JSON.stringify(o).includes('Jane'));
});

test('matchReceiptFiles orders dropped files as the receipt names them, or names the missing', async () => {
  const { matchReceiptFiles } = await import('../../lib/receipt.js');
  const r = { files: [{ name: 'A 1 of 2', sha256: 'aa' }, { name: 'A 2 of 2', sha256: 'bb' }] };
  assert.deepEqual(matchReceiptFiles(r, [{ sha256: 'bb', n: 2 }, { sha256: 'aa', n: 1 }, { sha256: 'cc' }]).ordered.map((d) => d.n), [1, 2]);
  assert.deepEqual(matchReceiptFiles(r, [{ sha256: 'aa' }]), { ordered: null, missing: ['A 2 of 2'] });
});
