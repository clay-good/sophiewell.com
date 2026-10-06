// spec-v1550 tool 3: WHO deworming dose and frequency. The 12/24-month edges, each prevalence band, the
// pregnancy conditions, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dewormingDoseWho as w } from '../../lib/deworming-dose-who-v1550.js';

test('children: half-dose albendazole under 24 months; frequency by prevalence', () => {
  assert.equal(w({ group: 'child', age: '11.9', prevalence: 'gt50' }).valid, false);
  assert.equal(w({ group: 'child', age: '12', prevalence: 'gt50' }).bandLabel, 'Albendazole 200 mg or mebendazole 500 mg');
  assert.equal(w({ group: 'child', age: '23.9', prevalence: 'gt50' }).bandLabel, 'Albendazole 200 mg or mebendazole 500 mg');
  const big = w({ group: 'child', age: '24', prevalence: 'gt50' });
  assert.equal(big.bandLabel, 'Albendazole 400 mg or mebendazole 500 mg');
  assert.match(big.notes[0], /Twice a year/);
  assert.match(w({ group: 'child', age: '60', prevalence: '20to50' }).notes[0], /Once a year/);
  const low = w({ group: 'child', age: '60', prevalence: 'lt20' });
  assert.equal(low.bandLabel, 'Not recommended');
  assert.match(low.notes[0], /Albendazole 400 mg or mebendazole 500 mg, a single dose\.$/);
  assert.match(w({ group: 'child', age: '60', prevalence: 'unknown' }).notes[0], /not known, so no frequency is given/);
});

test('non-pregnant girls and women: full dose by prevalence', () => {
  assert.equal(w({ group: 'woman', prevalence: '20to50' }).bandLabel, 'Albendazole 400 mg or mebendazole 500 mg');
});

test('pregnancy: never in the first trimester; later only where both thresholds hold', () => {
  assert.equal(w({ group: 'pregnant', trimester: 'first' }).bandLabel, 'Not now');
  assert.equal(w({ group: 'pregnant', trimester: 'later', criteria: 'no' }).bandLabel, 'Not recommended');
  assert.equal(w({ group: 'pregnant', trimester: 'later', criteria: 'yes' }).bandLabel, 'Single dose');
  assert.equal(w({ group: 'pregnant', trimester: 'later' }).valid, false);
});

test('refusals', () => {
  assert.equal(w({}).valid, false);
  assert.equal(w({ group: 'child', age: '30' }).valid, false);
  assert.equal(w({ group: 'child', prevalence: 'gt50' }).valid, false);
  assert.equal(w().valid, false);
});
