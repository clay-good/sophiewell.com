// spec-v147 2.2: SDAI - Simplified Disease Activity Index (Smolen 2003). CDAI
// inputs + CRP (mg/dL), 0-86; bands remission <=3.3, low <=11, moderate <=26,
// high >26.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sdaiRa } from '../../lib/rheum-v147.js';

test('tile example: 6+8+3+2+1.5 = 20.5 -> moderate', () => {
  const r = sdaiRa({ sjc: 6, tjc: 8, pga: 3, ega: 2, crp: 1.5 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 20.5);
  assert.equal(r.bandLabel, 'Moderate activity');
  assert.equal(r.abnormal, true);
});

test('remission boundary: 3.3 remission, 3.4 low', () => {
  assert.equal(sdaiRa({ sjc: 0, tjc: 0, pga: 0, ega: 0, crp: 3.3 }).bandLabel, 'Remission');
  assert.equal(sdaiRa({ sjc: 0, tjc: 0, pga: 0, ega: 0, crp: 3.4 }).bandLabel, 'Low activity');
});

test('low->moderate boundary: 11 low, 11.1 moderate', () => {
  assert.equal(sdaiRa({ sjc: 5, tjc: 5, pga: 0, ega: 0, crp: 1 }).bandLabel, 'Low activity');
  assert.equal(sdaiRa({ sjc: 5, tjc: 5, pga: 0, ega: 0, crp: 1.1 }).bandLabel, 'Moderate activity');
});

test('moderate->high boundary: 26 moderate, 26.1 high', () => {
  assert.equal(sdaiRa({ sjc: 12, tjc: 12, pga: 1, ega: 0, crp: 1 }).bandLabel, 'Moderate activity');
  assert.equal(sdaiRa({ sjc: 12, tjc: 12, pga: 1, ega: 0, crp: 1.1 }).bandLabel, 'High activity');
});

test('CRP addend included; zero CRP equals CDAI sum', () => {
  assert.equal(sdaiRa({ sjc: 6, tjc: 8, pga: 3, ega: 2, crp: 0 }).score, 19);
});

test('blank CRP -> complete-the-fields', () => {
  const r = sdaiRa({ sjc: 6, tjc: 8, pga: 3, ega: 2 });
  assert.equal(r.valid, false);
  assert.match(r.message, /CRP/);
});
