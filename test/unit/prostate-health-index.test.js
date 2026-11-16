// spec-v714: Prostate Health Index (phi).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { prostateHealthIndex } from '../../lib/prostate-health-index-v714.js';

test('worked example: total 4, free 0.5, p2PSA 12 -> phi 48 (~33%)', () => {
  const r = prostateHealthIndex({ totalPsa: '4', freePsa: '0.5', p2psa: '12' });
  // (12/0.5) * sqrt(4) = 24 * 2 = 48
  assert.equal(r.valid, true);
  assert.equal(r.phi, 48);
  assert.equal(r.tier, 'moderate-high');
  assert.equal(r.probability, 'about 33%');
  assert.match(r.band, /phi 48/);
});

test('formula is (p2PSA / free PSA) * sqrt(total PSA)', () => {
  const r = prostateHealthIndex({ totalPsa: '9', freePsa: '1', p2psa: '10' });
  assert.equal(r.phi, 30); // (10/1)*3
});

test('bands: <27 ~11%, 27-35.9 ~21%, 36-54.9 ~33%, >=55 ~50%', () => {
  assert.equal(prostateHealthIndex({ totalPsa: '4', freePsa: '1', p2psa: '10' }).tier, 'low');           // 20
  assert.equal(prostateHealthIndex({ totalPsa: '9', freePsa: '1', p2psa: '10' }).tier, 'moderate-low');  // 30
  assert.equal(prostateHealthIndex({ totalPsa: '4', freePsa: '0.5', p2psa: '12' }).tier, 'moderate-high'); // 48
  assert.equal(prostateHealthIndex({ totalPsa: '9', freePsa: '0.5', p2psa: '10' }).tier, 'high');        // 60
});

test('phi >= 36 is flagged', () => {
  assert.equal(prostateHealthIndex({ totalPsa: '9', freePsa: '1', p2psa: '10' }).abnormal, false); // 30
  assert.equal(prostateHealthIndex({ totalPsa: '4', freePsa: '0.5', p2psa: '12' }).abnormal, true); // 48
});

test('inputs are validated; free PSA cannot exceed total PSA', () => {
  assert.equal(prostateHealthIndex({}).valid, false);
  assert.equal(prostateHealthIndex({}).code, 'MISSING_INPUT');
  assert.equal(prostateHealthIndex({ totalPsa: '4', freePsa: '0.5' }).field, 'p2psa');
  const bad = prostateHealthIndex({ totalPsa: '4', freePsa: '5', p2psa: '12' });
  assert.equal(bad.valid, false);
  assert.equal(bad.code, 'INVALID_INPUT');
});

// spec-v1746: an entered value outside the range read as blank and was asked for again.
test('spec-v1746 a PSA value of -999999 is told its range; a blank is still asked for', () => {
  const bad = prostateHealthIndex({ totalPsa: '-999999', freePsa: '0.5', p2psa: '12' });
  assert.equal(bad.valid, false);
  assert.equal(bad.field, 'totalPsa');
  assert.match(bad.message, /total PSA in ng\/mL must be greater than 0/i);
  assert.match(prostateHealthIndex({ totalPsa: '4', freePsa: '0.5', p2psa: '-999999' }).message, /pg\/mL must be greater than 0/);
  assert.equal(prostateHealthIndex({ totalPsa: '', freePsa: '0.5', p2psa: '12' }).message, 'Enter total PSA (ng/mL).');
  assert.equal(prostateHealthIndex({ totalPsa: '4', freePsa: '0.5', p2psa: '12' }).valid, true);
});
