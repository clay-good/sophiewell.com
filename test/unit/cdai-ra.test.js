// spec-v147 2.1: CDAI - Clinical Disease Activity Index (Aletaha 2005). Linear
// sum SJC28 + TJC28 + patient global + physician global, 0-76; bands remission
// <=2.8, low <=10, moderate <=22, high >22.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cdaiRa } from '../../lib/rheum-v147.js';

test('tile example: 6+8+3+2 = 19 -> moderate', () => {
  const r = cdaiRa({ sjc: 6, tjc: 8, pga: 3, ega: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 19);
  assert.equal(r.bandLabel, 'Moderate activity');
  assert.equal(r.abnormal, true);
});

test('remission boundary: 2.8 remission, 2.9 low', () => {
  assert.equal(cdaiRa({ sjc: 0, tjc: 0, pga: 1.4, ega: 1.4 }).bandLabel, 'Remission');
  assert.equal(cdaiRa({ sjc: 0, tjc: 0, pga: 1.5, ega: 1.4 }).bandLabel, 'Low activity');
});

test('low->moderate boundary: 10 low, 10.1 moderate', () => {
  assert.equal(cdaiRa({ sjc: 5, tjc: 5, pga: 0, ega: 0 }).bandLabel, 'Low activity');
  const over = cdaiRa({ sjc: 5, tjc: 5, pga: 0, ega: 0.1 });
  assert.equal(over.score, 10.1);
  assert.equal(over.bandLabel, 'Moderate activity');
});

test('moderate->high boundary: 22 moderate, 22.1 high', () => {
  assert.equal(cdaiRa({ sjc: 11, tjc: 11, pga: 0, ega: 0 }).bandLabel, 'Moderate activity');
  assert.equal(cdaiRa({ sjc: 11, tjc: 11, pga: 0, ega: 0.1 }).bandLabel, 'High activity');
});

test('ceiling 76', () => {
  assert.equal(cdaiRa({ sjc: 28, tjc: 28, pga: 10, ega: 10 }).score, 76);
});

test('blank input -> complete-the-fields, never a partial total', () => {
  const r = cdaiRa({ sjc: 6, tjc: 8, pga: 3 });
  assert.equal(r.valid, false);
  assert.match(r.message, /physician global/);
});
