// spec-v336: JNET classification (Japan NBI Expert Team) of a colorectal lesion (1 / 2A / 2B / 3).
// Worked-example tests: each type and its vessel/surface description, the neoplastic flag (false for
// 1, true for 2A-3), the invasive/abnormal flag (type 3 only), case-insensitive input, and the
// invalid-type guard. Definitions transcribed from Sano 2016 (Dig Endosc), cross-verified against
// the JNET validation / diagnostic-yield studies (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jnet } from '../../lib/jnet-v336.js';

test('type 2B: irregular vessels/surface, high-grade/shallow (the META example)', () => {
  const r = jnet({ type: '2B' });
  assert.equal(r.valid, true);
  assert.equal(r.type, '2B');
  assert.equal(r.neoplastic, true);
  assert.equal(r.invasive, false);
  assert.match(r.band, /variable-caliber vessels in irregular distribution/);
  assert.match(r.band, /High-grade intramucosal neoplasia/);
});

test('type 1 is non-neoplastic; type 3 is the flagged deep-invasion type', () => {
  const one = jnet({ type: '1' });
  assert.equal(one.neoplastic, false);
  assert.equal(one.abnormal, false);
  assert.match(one.band, /invisible vessels/);
  const three = jnet({ type: '3' });
  assert.equal(three.invasive, true);
  assert.equal(three.abnormal, true);
  assert.match(three.band, /Deep submucosal invasive cancer/);
});

test('type 2A is a low-grade neoplastic adenoma, not invasive-flagged', () => {
  const r = jnet({ type: '2A' });
  assert.equal(r.neoplastic, true);
  assert.equal(r.invasive, false);
  assert.match(r.band, /Low-grade intramucosal neoplasia/);
});

test('input is case-insensitive for the 2A/2B subtypes', () => {
  assert.equal(jnet({ type: '2a' }).type, '2A');
  assert.equal(jnet({ type: '2b' }).type, '2B');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(jnet({}).valid, false);
  assert.equal(jnet({ type: '2' }).valid, false);
  assert.equal(jnet({ type: '4' }).valid, false);
});
