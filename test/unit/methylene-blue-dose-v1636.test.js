// spec-v1636 backfill 3: the PROVAYBLUE label dose beside the methemoglobin reading.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { methyleneBlueDose, LABEL, KIDNEY } from '../../lib/methylene-blue-dose-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-12T12:00:00Z');
const d = (i, t) => methyleneBlueDose(i, now, t);

test('the label row answers, and a superseded label shows no dose', () => {
  assert.equal(labelRow(LABEL.setId, now).answers, true);
  const dead = { ...LABEL_EDITIONS, [LABEL.setId]: { ...LABEL_EDITIONS[LABEL.setId], supersededOn: '2026-10-10' } };
  const r = d({ weight: 70 }, dead);
  assert.deepEqual([r.flag, r.doseMg], ['withheld', undefined]);
});

test('1 mg/kg, and mL at 5 mg/mL', () => {
  for (const [kg, mg, ml] of [[70, 70, 14], [12.5, 12.5, 2.5], [3.2, 3.2, 0.6]]) {
    const r = d({ weight: kg, kidney: 'egfr-60-or-above' });
    assert.deepEqual([r.doseMg, r.doseMl, r.flag], [mg, ml, 'dose'], `${kg} kg`);
  }
  assert.match(d({ weight: 70, kidney: 'egfr-60-or-above' }).doseNote, /one repeat of 1 mg\/kg one hour after/);
});

test('eGFR 15 to 59 is a single dose; under 15 the label states nothing', () => {
  const r = d({ weight: 70, kidney: 'egfr-15-to-59' });
  assert.match(r.doseNote, /a single dose of 1 mg\/kg/);
  assert.doesNotMatch(r.doseNote, /one repeat/);
  assert.deepEqual([d({ weight: 70, kidney: 'egfr-under-15' }).flag, d({ weight: 70, kidney: 'egfr-under-15' }).doseMg], ['label-states-none', undefined]);
});

test('kidney function not entered shows both statements and chooses neither', () => {
  const r = d({ weight: 70 });
  assert.equal(r.flag, 'kidney-not-entered');
  assert.match(r.doseNote, /a single dose of 1 mg\/kg.*one repeat of 1 mg\/kg/);
});

test('G6PD deficiency: the contraindication, no dose', () => {
  const r = d({ weight: 70, g6pd: true });
  assert.deepEqual([r.flag, r.doseMg], ['contraindicated', undefined]);
});

test('refusals', () => {
  assert.match(d({}).message, /^Enter the weight/);
  assert.match(d({ weight: 70, kidney: 'normal' }).message, /^Choose the kidney function/);
  assert.equal(KIDNEY[0].value, '');
});
