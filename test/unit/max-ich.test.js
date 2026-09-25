// spec-v1453: max-ICH score (Sembill 2017), items as tabulated by Schmidt 2018 Table 1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maxIch } from '../../lib/max-ich-v1453.js';

const base = { nihss: '0', age: '50', location: 'nonlobar', volume: '5', ivh: 'no', oac: 'no' };
const s = (over) => maxIch({ ...base, ...over });

test('NIHSS bands and their edges: 0-6, 7-13, 14-20, 21 or more', () => {
  const cases = [['0', 0], ['6', 0], ['7', 1], ['13', 1], ['14', 2], ['20', 2], ['21', 3], ['42', 3]];
  for (const [n, pts] of cases) assert.equal(s({ nihss: n }).parts.nihss, pts, n);
});

test('age bands and their edges: 69 or less, 70-74, 75-79, 80 or more', () => {
  const cases = [['69', 0], ['70', 1], ['74', 1], ['75', 2], ['79', 2], ['80', 3], ['101', 3], ['69.9', 0], ['79.5', 2]];
  for (const [a, pts] of cases) assert.equal(s({ age: a }).parts.age, pts, a);
});

test('volume threshold depends on location: lobar 30 mL, nonlobar 10 mL', () => {
  assert.equal(s({ location: 'lobar', volume: '29.9' }).parts.volume, 0);
  assert.equal(s({ location: 'lobar', volume: '30' }).parts.volume, 1);
  assert.equal(s({ location: 'lobar', volume: '15' }).parts.volume, 0);
  assert.equal(s({ location: 'nonlobar', volume: '9.9' }).parts.volume, 0);
  assert.equal(s({ location: 'nonlobar', volume: '10' }).parts.volume, 1);
  assert.equal(s({ location: 'nonlobar', volume: '15' }).parts.volume, 1);
});

test('IVH and oral anticoagulation add one point each', () => {
  assert.equal(s({ ivh: 'yes' }).score, 1);
  assert.equal(s({ oac: 'yes' }).score, 1);
  assert.equal(s({ ivh: 'yes', oac: 'yes' }).score, 2);
});

test('totals run 0 to 9 and carry the published 5-year survival', () => {
  const zero = s({});
  assert.equal(zero.score, 0);
  assert.equal(zero.abnormal, false);
  assert.match(zero.band, /score 0 of 9: .* 5-year survival was 85% at this score/);
  const top = maxIch({ nihss: '30', age: '85', location: 'lobar', volume: '60', ivh: 'yes', oac: 'yes' });
  assert.equal(top.score, 9);
  assert.match(top.band, /0% at a score of 8 or more/);
  const five = maxIch({ nihss: '15', age: '76', location: 'nonlobar', volume: '12', ivh: 'no', oac: 'no' });
  assert.equal(five.score, 5);
  assert.equal(five.abnormal, true);
  assert.equal(five.band, 'max-ICH score 5 of 9: in maximally treated patients at the derivation center, 5-year survival was 32% at this score.');
  assert.equal(s({ ivh: 'yes' }).abnormal, false);
  assert.equal(s({ ivh: 'yes', oac: 'yes' }).abnormal, true);
});

test('every answer carries the point breakdown, the validation caveat and the no-treatment note', () => {
  const r = s({ nihss: '8' });
  assert.match(r.notes[0], /NIHSS 8 = 1; age 50 = 0; nonlobar hematoma of 5 mL = 0 \(the nonlobar threshold is 10 mL\)/);
  assert.ok(r.notes.some((n) => /AUC 0\.80 to 0\.86/.test(n)));
  assert.match(r.note, /does not decide on limiting care/);
});

test('a blank field is asked for, never read as zero or no', () => {
  assert.match(s({ nihss: '' }).message, /^Enter the NIHSS score/);
  assert.match(s({ nihss: '   ' }).message, /^Enter the NIHSS score/);
  assert.match(s({ age: '' }).message, /^Enter the age in years/);
  assert.match(s({ location: '' }).message, /^Choose whether the hematoma is lobar/);
  assert.match(s({ volume: '' }).message, /^Enter the hematoma volume in mL/);
  assert.match(s({ ivh: '' }).message, /^Choose whether there is intraventricular/);
  assert.match(s({ oac: '' }).message, /^Choose whether the patient was taking oral anticoagulation/);
  assert.equal(maxIch().valid, false);
  assert.equal(maxIch(null).valid, false);
});

test('impossible values are refused, not scored', () => {
  assert.match(s({ nihss: '43' }).message, /between 0 and 42/);
  assert.match(s({ nihss: '-1' }).message, /between 0 and 42/);
  assert.match(s({ nihss: '7.5' }).message, /whole number/);
  assert.match(s({ age: '200' }).message, /between 0 and 130 years/);
  assert.match(s({ volume: '-3' }).message, /between 0 and 2000 mL/);
  assert.match(s({ volume: '5000' }).message, /between 0 and 2000 mL/);
  assert.equal(s({ location: 'deep' }).valid, false);
  assert.equal(s({ ivh: 'maybe' }).valid, false);
});
