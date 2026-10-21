// Regression tests for the third part of the spec-v700 to v958 review (spec-v1676) on 2026-10-20, each with the
// input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { awol } from '../../lib/awol-v777.js';
import { furstRatio } from '../../lib/furst-ratio-v794.js';
import { prostateHealthIndex } from '../../lib/prostate-health-index-v714.js';
import { walchGlenoid } from '../../lib/walch-glenoid-v740.js';
import { reimersMigrationPercentage } from '../../lib/reimers-migration-percentage-v703.js';
import { piLlMismatch } from '../../lib/pi-ll-mismatch-v705.js';
import { catonDeschamps } from '../../lib/caton-deschamps-v704.js';

test('AWOL: a blank illness rating is named, not read as "not ill"', () => {
  const r = awol({ age80: true });
  assert.equal(r.bandLabel, 'AWOL 1 of 4, illness not rated');
  assert.match(r.band, /would reach the 2/);
});

test('values at a cut are judged unrounded and printed on that side', () => {
  const f = furstRatio({ urineSodium: 70.04, urinePotassium: 70, serumSodium: 140 });
  assert.equal(f.tier, 'restriction-unlikely');
  assert.equal(f.bandLabel, 'Furst ratio 1.0003');
  assert.equal(furstRatio({ urineSodium: 50, urinePotassium: 40, serumSodium: 140 }).bandLabel, 'Furst ratio 0.64');
  assert.equal(prostateHealthIndex({ totalPsa: 4, freePsa: 1, p2psa: 17.98 }).bandLabel, 'phi 35.96');
  assert.equal(reimersMigrationPercentage({ lateralWidth: 33.4, totalWidth: 100 }).bandLabel.startsWith('Reimers MP 33.4%'), true);
  assert.match(piLlMismatch({ pelvicIncidence: 59.6, lumbarLordosis: 50 }).bandLabel, /^PI-LL 9\.6°/);
  assert.match(catonDeschamps({ distanceA: 1.2004, lengthB: 1 }).bandLabel, /^Caton-Deschamps 1\.2004/);
});

test('PHI outside a total PSA of 2 to 10 says the bands do not apply as printed', () => {
  assert.match(prostateHealthIndex({ totalPsa: 12, freePsa: 2, p2psa: 20 }).band, /do not apply as printed/);
});

test('Walch: an impossible version is refused, and B1 names the subluxation route to B3', () => {
  assert.equal(walchGlenoid({ subluxation: 'posterior', retroversion: 500, concavity: 'single', erosion: 'minor' }).valid, false);
  assert.match(walchGlenoid({ subluxation: 'posterior', retroversion: 10, concavity: 'single', erosion: 'minor' }).detail, /70% or more posterior subluxation/);
});
