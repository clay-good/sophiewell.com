// spec-v1554 tool 7: ARV26 Table 1 band snapshot (D4), the rifampicin adjustment, and the gates.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whoPediatricArvDose as r } from '../../lib/who-pediatric-arv-dose-v1554.js';

const band = (drug, w) => r({ drug, weight: String(w), age: '52', rif: 'no' }).band.match(/: (.+?) once daily/)[1];

test('Table 1 band snapshot (May 2026, corrigendum June 2026)', () => {
  const ws = [3, 5.9, 6, 9.9, 10, 14.9, 15, 19.9, 20, 24.9, 25, 34.9];
  assert.deepEqual(ws.map((w) => r({ drug: 'pald', weight: String(w), age: '52', rif: 'no' }).valid ? band('pald', w) : '-'),
    ['1 tablet', '1 tablet', '3 tablets', '3 tablets', '4 tablets', '4 tablets', '5 tablets', '5 tablets', '6 tablets', '6 tablets', '-', '-']);
  assert.deepEqual([4, 8, 12, 17, 22].map((w) => band('dtg10', w)), ['0.5 tablets', '1.5 tablets', '2 tablets', '2.5 tablets', '3 tablets']);
  assert.deepEqual([4, 8, 12, 17, 22].map((w) => band('dtg5', w)), ['1 tablet', '3 tablets', '4 tablets', '5 tablets', '6 tablets']);
  assert.deepEqual([4, 8, 12, 17, 22, 30].map((w) => band('abc3tc', w)), ['0.5 tablets', '1.5 tablets', '2 tablets', '2.5 tablets', '3 tablets', 'adult 600/300 mg tablet 1']);
  assert.equal(band('dtg50', 20), '1 tablet');
  assert.equal(r({ drug: 'dtg50', weight: '19.9', age: '52', rif: 'no' }).valid, false);
  assert.equal(r({ drug: 'tld', weight: '30', age: '400', rif: 'no' }).bandLabel, '1 tablet daily');
  assert.equal(r({ drug: 'tld', weight: '29', age: '400', rif: 'no' }).valid, false);
});

test('rifampicin, the quarter-tablet conflict, and gates', () => {
  assert.match(r({ drug: 'dtg10', weight: '12', age: '52', rif: 'yes' }).band, /twice daily/);
  assert.match(r({ drug: 'pald', weight: '12', age: '52', rif: 'yes' }).band, /12 hours later/);
  assert.ok(r({ drug: 'abc3tc', weight: '4', age: '8', rif: 'no' }).notes.some((n) => /quarter/.test(n)));
  assert.equal(r({ drug: 'dtg5', weight: '3', age: '3', rif: 'no' }).valid, false, 'under 4 weeks');
  assert.ok(r({ drug: 'dtg5', weight: '2.5', age: '6', rif: 'no' }).notes.some((n) => /3-5\.99 kg band/.test(n)));
  assert.equal(r({ drug: 'dtg5', weight: '10', age: '52' }).valid, false);
});
