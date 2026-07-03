// spec-v206 2.2: Marshall CT classification worked examples. Six categories
// derived from cisterns, midline shift, and mass-lesion presence/evacuation.
// Definitions spec-v97 cross-verified (Radiopaedia + TBI reviews of Marshall 1991).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { marshallCt as marshall } from '../../lib/tbi-stroke-v206.js';

test('Diffuse Injury I - no visible pathology', () => {
  const r = marshall({ massLesion: 'none', pathology: false });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'I');
  assert.equal(r.abnormal, false);
});

test('Diffuse Injury II - cisterns present, no shift', () => {
  const r = marshall({ massLesion: 'none', pathology: true, cisternsAbnormal: false, shiftOver5: false });
  assert.equal(r.category, 'II');
});

test('Diffuse Injury III - cisterns compressed/absent, shift <= 5', () => {
  const r = marshall({ massLesion: 'none', pathology: true, cisternsAbnormal: true, shiftOver5: false });
  assert.equal(r.category, 'III');
  assert.equal(r.abnormal, true);
});

test('Diffuse Injury IV - shift > 5 mm (worked example)', () => {
  const r = marshall({ massLesion: 'none', pathology: true, shiftOver5: true });
  assert.equal(r.category, 'IV');
  assert.match(r.band, /shift/);
});

test('Mass lesions -> V (evacuated) and VI (non-evacuated)', () => {
  assert.equal(marshall({ massLesion: 'evacuated' }).category, 'V');
  assert.equal(marshall({ massLesion: 'non-evacuated' }).category, 'VI');
});

test('shift dominates cisterns for the diffuse category (IV > III)', () => {
  const r = marshall({ massLesion: 'none', pathology: true, cisternsAbnormal: true, shiftOver5: true });
  assert.equal(r.category, 'IV');
});

test('no mass-lesion selection -> complete-the-fields', () => {
  const r = marshall({});
  assert.equal(r.valid, false);
});
