// spec-v335: NICE classification (NBI International Colorectal Endoscopic) of a colorectal lesion
// (types 1 / 2 / 3). Worked-example tests: each type and its color/vessels/surface description, the
// neoplastic flag (false for 1, true for 2-3), the invasive/abnormal flag (type 3 only), numeric /
// string input, and the invalid-type guard. Definitions transcribed from Hewett 2012
// (Gastroenterology, types 1-2) + Hayashi 2013 (Gastrointest Endosc, type 3), cross-verified
// against endoscopy references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nice } from '../../lib/nice-v335.js';

test('type 3: deep submucosal invasion, flagged (the META example)', () => {
  const r = nice({ type: '3' });
  assert.equal(r.valid, true);
  assert.equal(r.type, '3');
  assert.equal(r.neoplastic, true);
  assert.equal(r.invasive, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /disrupted or missing vessels/);
  assert.match(r.band, /Deep submucosal invasive cancer/);
});

test('type 1 is non-neoplastic hyperplastic and not flagged', () => {
  const r = nice({ type: '1' });
  assert.equal(r.neoplastic, false);
  assert.equal(r.invasive, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /same or lighter than the background/);
  assert.match(r.band, /Hyperplastic/);
});

test('type 2 is a neoplastic adenoma but not invasive-flagged', () => {
  const r = nice({ type: '2' });
  assert.equal(r.neoplastic, true);
  assert.equal(r.invasive, false);
  assert.match(r.band, /brown vessels surrounding white structures/);
  assert.match(r.band, /Adenoma/);
});

test('numeric input is accepted the same as string input', () => {
  assert.equal(nice({ type: 1 }).type, '1');
  assert.equal(nice({ type: 3 }).type, '3');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(nice({}).valid, false);
  assert.equal(nice({ type: '0' }).valid, false);
  assert.equal(nice({ type: '4' }).valid, false);
});
