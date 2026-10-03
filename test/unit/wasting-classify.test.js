// spec-v1548 tool 2: WHO 2023 acute malnutrition by MUAC, WHZ and edema. MUAC 114/115/124/125, WHZ -3.01/-3/-2,
// edema alone, blank edema refused, and the age edges.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wastingClassify as w } from '../../lib/wasting-classify-v1548.js';

const run = (extra) => w({ ageMonths: '18', edema: 'none', ...extra });

test('MUAC edges: 114 red severe, 115 yellow moderate, 124 moderate, 125 green none', () => {
  assert.equal(run({ muac: '114' }).classification, 'Severe acute malnutrition');
  const at115 = run({ muac: '115' });
  assert.equal(at115.classification, 'Moderate acute malnutrition');
  assert.match(at115.notes.join(' '), /in the yellow band/);
  assert.equal(run({ muac: '124' }).classification, 'Moderate acute malnutrition');
  const at125 = run({ muac: '125' });
  assert.equal(at125.classification, 'No acute malnutrition');
  assert.match(at125.notes.join(' '), /green band/);
  assert.equal(run({ muac: '11.4', muacUnit: 'cm' }).classification, 'Severe acute malnutrition', 'cm is converted');
});

test('WHZ edges: -3.01 severe, -3 exactly moderate, -2 exactly none', () => {
  assert.equal(run({ whz: '-3.01' }).classification, 'Severe acute malnutrition');
  assert.equal(run({ whz: '-3' }).classification, 'Moderate acute malnutrition');
  assert.equal(run({ whz: '-2.01' }).classification, 'Moderate acute malnutrition');
  assert.equal(run({ whz: '-2' }).classification, 'No acute malnutrition');
});

test('edema of any grade is severe on its own; the worse measure decides and both are named', () => {
  const ed = w({ ageMonths: '30', edema: '+' });
  assert.equal(ed.classification, 'Severe acute malnutrition');
  assert.match(ed.band, /edema of both feet \(\+\)/);
  const mixed = run({ muac: '130', whz: '-3.2' });
  assert.equal(mixed.classification, 'Severe acute malnutrition');
  assert.match(mixed.notes.join(' '), /MUAC and weight-for-height disagree/);
  assert.match(mixed.notes.join(' '), /does not assess/);
});

test('blank edema, no measure, and ages outside 6-59 months are refused', () => {
  assert.match(w({ ageMonths: '18', muac: '120' }).message, /edema of both feet/);
  assert.match(run({}).message, /Enter the MUAC or the weight-for-height z-score/);
  assert.match(w({ ageMonths: '5', edema: 'none', muac: '120' }).message, /Under 6 months/);
  assert.equal(w({ ageMonths: '60', edema: 'none', muac: '120' }).valid, false);
  assert.equal(w({ edema: 'none', muac: '120' }).valid, false, 'no age');
  assert.match(run({ muac: '130' }).notes.join(' '), /weight-for-height z-score was not measured; MUAC alone was used/);
});
