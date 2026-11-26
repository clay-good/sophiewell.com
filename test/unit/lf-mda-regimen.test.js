// spec-v1562 tool 5: LF MDA regimen by area and person eligibility; loiasis never defaulted.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lfMdaRegimen as r } from '../../lib/lf-mda-regimen-v1562.js';

const p = { age: '30', height: '165', pregnant: 'no', ill: 'no', seizures: 'no' };

test('area regimens', () => {
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'no', status: 'routine' }).bandLabel, 'Eligible for DA');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'no', status: 'early' }).bandLabel, 'Eligible for IDA');
  assert.equal(r({ ...p, oncho: 'yes', loiasis: 'no' }).bandLabel, 'Eligible for IA');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'yes', ivermectinGiven: 'no' }).bandLabel, 'Eligible for albendazole');
  assert.equal(r({ ...p, oncho: 'no' }).valid, false, 'loiasis is never defaulted');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'yes' }).valid, false);
});

test('person eligibility', () => {
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'no', status: 'routine', pregnant: 'later' }).bandLabel, 'Not eligible');
  assert.equal(r({ ...p, oncho: 'yes', loiasis: 'no', height: '85' }).bandLabel, 'Not eligible');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'no', status: 'early', age: '3', height: '95' }).bandLabel, 'Eligible for DA');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'no', status: 'early', age: '1.5' }).bandLabel, 'Not eligible');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'yes', ivermectinGiven: 'no', pregnant: 'later' }).bandLabel, 'Eligible for albendazole');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'yes', ivermectinGiven: 'no', pregnant: 'first' }).bandLabel, 'Not eligible');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'yes', ivermectinGiven: 'no', seizures: 'yes' }).bandLabel, 'Not eligible');
});

// spec-v1813: the exclusion nobody answered, on EVERY branch that still says yes.
//
// "Severe illness: not entered. The severely ill are excluded." sat below four early returns, so the one
// reading that most needs it -- a person under 90 cm in an IDA area, who is told "Eligible for DA" rather
// than refused -- did not carry it. The rule is not about one branch: a verdict that is not "Not eligible"
// names every exclusion that was left unanswered.
test('an unanswered severe illness is named on every eligible verdict', () => {
  const unknown = { age: '30', height: '165', pregnant: 'no', seizures: 'no' };  // no `ill` at all
  const said = /Severe illness: not entered/;
  for (const [why, inputs] of [
    ['DA area', { ...unknown, oncho: 'no', loiasis: 'no', status: 'routine' }],
    ['IDA area', { ...unknown, oncho: 'no', loiasis: 'no', status: 'early' }],
    ['IDA area, under 90 cm, so DA instead', { ...unknown, oncho: 'no', loiasis: 'no', status: 'early', height: '82.5' }],
    ['IDA area, aged 2-4, so DA instead', { ...unknown, oncho: 'no', loiasis: 'no', status: 'early', age: '3' }],
    ['IA area', { ...unknown, oncho: 'yes', loiasis: 'no' }],
    ['IA area, height unknown', { ...unknown, oncho: 'yes', loiasis: 'no', height: '' }],
  ]) {
    const got = r(inputs);
    assert.notEqual(got.bandLabel, 'Not eligible', why);
    assert.ok(got.notes.some((n) => said.test(n)), `${why}: the unanswered exclusion is not named`);
  }
  // And where albendazole is given alone, illness is NOT an exclusion, so there is nothing to name.
  const alb = r({ ...unknown, oncho: 'no', loiasis: 'yes', ivermectinGiven: 'no' });
  assert.equal(alb.bandLabel, 'Eligible for albendazole');
  assert.ok(!alb.notes.some((n) => said.test(n)), 'illness does not exclude from albendazole alone');
  assert.equal(r({ ...unknown, ill: 'yes', oncho: 'no', loiasis: 'no', status: 'early' }).bandLabel, 'Not eligible');
});
