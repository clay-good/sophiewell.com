// spec-v711: AUSDRISK (Australian Type 2 Diabetes Risk Assessment Tool).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ausdrisk } from '../../lib/ausdrisk-v711.js';

test('worked example: 55-64 male + family hx + waist 105 -> 16 (high)', () => {
  const r = ausdrisk({ agePoints: '6', sex: 'male', familyHistory: true, waist: '105' });
  // age 6 + male 3 + family 3 + waist (non-Asian male 102-110) 4 = 16
  assert.equal(r.valid, true);
  assert.equal(r.score, 16);
  assert.equal(r.tier, 'high');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /AUSDRISK 16 of 35/);
});

test('lowest inputs -> low risk', () => {
  const r = ausdrisk({ agePoints: '0', sex: 'female', waist: '70' });
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low');
});

test('waist bands (non-Asian male): <102=0, 102-110=4, >110=7', () => {
  const base = { agePoints: '0', sex: 'male', waist: '100' };
  // male adds 3 regardless; isolate waist by subtracting
  assert.equal(ausdrisk({ ...base, waist: '101' }).waistPoints, 0);
  assert.equal(ausdrisk({ ...base, waist: '102' }).waistPoints, 4);
  assert.equal(ausdrisk({ ...base, waist: '110' }).waistPoints, 4);
  assert.equal(ausdrisk({ ...base, waist: '111' }).waistPoints, 7);
});

test('waist bands use the lower Asian/indigenous thresholds when flagged (male: <90/90-100/>100)', () => {
  const base = { agePoints: '0', sex: 'male', asianOrIndigenousWaist: true };
  assert.equal(ausdrisk({ ...base, waist: '89' }).waistPoints, 0);
  assert.equal(ausdrisk({ ...base, waist: '90' }).waistPoints, 4);
  assert.equal(ausdrisk({ ...base, waist: '100' }).waistPoints, 4);
  assert.equal(ausdrisk({ ...base, waist: '101' }).waistPoints, 7);
});

test('waist bands (female, standard): <88=0, 88-100=4, >100=7', () => {
  const base = { agePoints: '0', sex: 'female' };
  assert.equal(ausdrisk({ ...base, waist: '87' }).waistPoints, 0);
  assert.equal(ausdrisk({ ...base, waist: '88' }).waistPoints, 4);
  assert.equal(ausdrisk({ ...base, waist: '101' }).waistPoints, 7);
});

test('risk tiers: <=5 low, 6-14 intermediate, >=15 high', () => {
  assert.equal(ausdrisk({ agePoints: '4', sex: 'female', waist: '70' }).tier, 'low');            // 4
  assert.equal(ausdrisk({ agePoints: '6', sex: 'female', waist: '70' }).tier, 'intermediate');   // 6
  assert.equal(ausdrisk({ agePoints: '8', sex: 'male', everHighGlucose: true, waist: '70' }).tier, 'high'); // 8+3+6=17
});

test('inputs are validated', () => {
  assert.equal(ausdrisk({}).valid, false);
  assert.equal(ausdrisk({}).code, 'MISSING_INPUT');
  assert.equal(ausdrisk({ agePoints: '6', sex: 'male' }).field, 'waist');
  assert.equal(ausdrisk({ agePoints: '3', sex: 'male', waist: '90' }).field, 'agePoints'); // 3 not a valid age band
});
