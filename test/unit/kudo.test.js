// spec-v334: Kudo pit-pattern classification of a colorectal lesion (I / II / IIIS / IIIL / IV / V).
// Worked-example tests: each type and its pit-appearance + histology description, the neoplastic
// flag (false for I-II, true for IIIS-V), the invasive/abnormal flag (type V only), case-insensitive
// input, and the invalid-type guard. Definitions transcribed from Kudo 1996 (Gastrointest Endosc),
// cross-verified against the Kudo pit-pattern meta-analysis (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kudo } from '../../lib/kudo-v334.js';

test('type V: non-structured pits, invasive concern flagged (the META example)', () => {
  const r = kudo({ type: 'V' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'V');
  assert.equal(r.neoplastic, true);
  assert.equal(r.invasive, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /non-structured \(irregular or amorphous\) pits/);
  assert.match(r.band, /invasive carcinoma/);
});

test('types I and II are non-neoplastic and not flagged', () => {
  assert.equal(kudo({ type: 'I' }).neoplastic, false);
  assert.equal(kudo({ type: 'II' }).neoplastic, false);
  assert.equal(kudo({ type: 'I' }).abnormal, false);
  assert.match(kudo({ type: 'I' }).band, /roundish pits/);
  assert.match(kudo({ type: 'II' }).band, /stellar or papillary pits/);
});

test('types IIIS/IIIL/IV are neoplastic adenomas but not invasive-flagged', () => {
  for (const t of ['IIIS', 'IIIL', 'IV']) {
    const r = kudo({ type: t });
    assert.equal(r.neoplastic, true, t);
    assert.equal(r.invasive, false, t);
    assert.equal(r.abnormal, false, t);
  }
  assert.match(kudo({ type: 'IIIS' }).band, /highest malignant potential/);
  assert.match(kudo({ type: 'IV' }).band, /branch-like or gyrus-like pits/);
});

test('input is case-insensitive', () => {
  assert.equal(kudo({ type: 'iiis' }).type, 'IIIS');
  assert.equal(kudo({ type: 'v' }).type, 'V');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(kudo({}).valid, false);
  assert.equal(kudo({ type: 'VI' }).valid, false);
  assert.equal(kudo({ type: 'III' }).valid, false);
});
