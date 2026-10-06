// spec-v1554 tool 3: cotrimoxazole prophylaxis. Every weight band edge, the adult criteria and their blanks, and
// refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whoCotrimoxazole as c } from '../../lib/who-cotrimoxazole-v1554.js';

test('weight bands from WHO 2026 Table 6', () => {
  assert.equal(c({ group: 'exposed', weight: '2.9' }).valid, false);
  assert.match(c({ group: 'exposed', weight: '3' }).band, /3 to under 6 kg\): 2\.5 mL of suspension/);
  assert.match(c({ group: 'child', weight: '6' }).band, /6 to under 10 kg/);
  assert.match(c({ group: 'child', weight: '14.9' }).band, /10 to under 15 kg/);
  assert.match(c({ group: 'child', weight: '15' }).band, /10 mL of suspension, 4 dispersible/);
  assert.match(c({ group: 'child', weight: '25' }).band, /two 400\/80 mg tablets or one 800\/160 mg tablet/);
  assert.match(c({ group: 'child', weight: '35' }).band, /800\/160 mg once a day \(the adult dose\)/);
  assert.match(c({ group: 'exposed', weight: '5' }).notes[0], /4 to 6 weeks of age/);
});

test('adults: any one criterion indicates it; otherwise CD4 decides', () => {
  const base = { group: 'adult', highPrevalence: 'no', tb: 'no', advanced: 'no' };
  assert.equal(c({ ...base, cd4: '350' }).bandLabel, 'Indicated: 800/160 mg daily');
  assert.equal(c({ ...base, cd4: '351' }).bandLabel, 'Not indicated');
  assert.equal(c({ ...base, highPrevalence: 'yes' }).bandLabel, 'Indicated: 800/160 mg daily');
  assert.equal(c({ ...base, tb: 'yes' }).bandLabel, 'Indicated: 800/160 mg daily');
  assert.equal(c({ ...base, advanced: 'yes' }).bandLabel, 'Indicated: 800/160 mg daily');
  assert.match(c(base).message, /Enter the CD4 count/);
});

test('refusals', () => {
  assert.equal(c({}).valid, false);
  assert.equal(c({ group: 'child' }).valid, false);
  assert.equal(c({ group: 'adult', tb: 'no', advanced: 'no', cd4: '200' }).valid, false);
});
