// spec-v1560 tool 4: enteric fever regimen (WHO AWaRe). Each resistance and severity branch, the child bands, and
// refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entericFeverRegimen as e } from '../../lib/enteric-fever-regimen-v1560.js';

test('low resistance: ciprofloxacin, child bands from 3 kg, adult dose from 30 kg', () => {
  assert.match(e({ severity: 'mild', resistance: 'low', ageGroup: 'adult' }).band, /Ciprofloxacin 500 mg/);
  assert.match(e({ severity: 'mild', resistance: 'low', ageGroup: 'child', weight: '9.9' }).band, /Ciprofloxacin 100 mg/);
  assert.match(e({ severity: 'mild', resistance: 'low', ageGroup: 'child', weight: '20' }).band, /Ciprofloxacin 300 mg/);
  assert.match(e({ severity: 'mild', resistance: 'low', ageGroup: 'child', weight: '30' }).band, /500 mg .*adult dose/);
  assert.equal(e({ severity: 'severe', resistance: 'low', ageGroup: 'adult' }).bandLabel, 'Ciprofloxacin, 10 days');
});

test('high resistance: azithromycin when mild, ceftriaxone when severe', () => {
  assert.match(e({ severity: 'mild', resistance: 'high', ageGroup: 'adult' }).band, /1 g by mouth on day 1, then 500 mg/);
  assert.match(e({ severity: 'mild', resistance: 'high', ageGroup: 'child', weight: '15' }).band, /Azithromycin 300 mg .*20 mg\/kg/);
  assert.match(e({ severity: 'severe', resistance: 'high', ageGroup: 'child', weight: '15' }).band, /Ceftriaxone 1,200 mg IV/);
  assert.match(e({ severity: 'severe', resistance: 'high', ageGroup: 'adult' }).notes[0], /10 days, provided/);
});

test('refusals', () => {
  assert.equal(e({ resistance: 'low', ageGroup: 'adult' }).valid, false);
  assert.equal(e({ severity: 'mild', ageGroup: 'adult' }).valid, false);
  assert.equal(e({ severity: 'mild', resistance: 'low', ageGroup: 'child' }).valid, false);
});
