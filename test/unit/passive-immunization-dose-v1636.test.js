// spec-v1636 tool 12: hepatitis B, varicella and tetanus immune globulin doses, from the labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { passiveImmunizationDose, LABELS } from '../../lib/passive-immunization-dose-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-12T12:00:00Z');
const p = (i, t) => passiveImmunizationDose(i, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });

test('all four label rows answer; hepatitis B withholds if either of its labels is superseded', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(p({ product: 'hbig-newborn' }, dead(LABELS.nabihb.setId)).flag, 'withheld');
  assert.equal(p({ product: 'hbig-newborn' }, dead(LABELS.hyperhepb.setId)).flag, 'withheld');
  assert.equal(p({ product: 'varizig', weight: 15 }, dead(LABELS.nabihb.setId)).flag, 'dose');
});

test('hepatitis B immune globulin: 0.06 mL/kg after exposure; 0.5 mL for the newborn', () => {
  assert.equal(p({ product: 'hbig-after-exposure', weight: 70 }).volumeMl, 4.2);
  assert.match(p({ product: 'hbig-after-exposure', weight: 70 }).notes.join(' '), /more than 7 days after exposure is unclear/);
  const nb = p({ product: 'hbig-newborn' });
  assert.equal(nb.volumeMl, 0.5);
  assert.match(nb.band, /preferably within 12 hours of birth/);
});

test('VARIZIG: every row of the label table', () => {
  const rows = [[1.8, 62.5, 0.5, 0.6], [2.0, 62.5, 0.5, 0.6], [2.1, 125, 1, 1.2], [10, 125, 1, 1.2], [10.1, 250, 2, 2.4], [20, 250, 2, 2.4], [25, 375, 3, 3.6], [40, 500, 4, 4.8], [40.1, 625, 5, 6], [90, 625, 5, 6]];
  for (const [kg, units, vials, ml] of rows) {
    const r = p({ product: 'varizig', weight: kg });
    assert.deepEqual([r.units, r.vials, r.volumeMl], [units, vials, ml], `${kg} kg`);
  }
  assert.match(p({ product: 'varizig', weight: 25 }).notes.join(' '), /3\.6 mL is more than 3 mL, so it is divided between at least 2 sites/);
  assert.match(p({ product: 'varizig', weight: 1.8 }).band, /0\.5 vial, 0\.6 mL/);
});

test('VARIZIG: a weight between the one-decimal rows returns both, and the text and table are both quoted at 40 kg', () => {
  const gap = p({ product: 'varizig', weight: 10.05 });
  assert.deepEqual([gap.flag, gap.units, gap.abnormal], ['between-rows', undefined, true]);
  assert.match(gap.band, /2\.1 to 10\.0 kg: 125 international units .* and 10\.1 to 20\.0 kg: 250 international units/);
  assert.match(p({ product: 'varizig', weight: 40.05 }).notes[0], /"for all patients greater than 40 kilograms", while its table starts that row at 40\.1 kg/);
});

test('tetanus immune globulin: 250 units from 7 years; under 7 both of the label\'s options', () => {
  assert.deepEqual((({ flag, units }) => [flag, units])(p({ product: 'tetanus-immune-globulin', age: 7 })), ['dose', 250]);
  const kid = p({ product: 'tetanus-immune-globulin', age: 4, weight: 16 });
  assert.deepEqual([kid.flag, kid.unitsByWeight, kid.units, kid.abnormal], ['label-gives-two-doses', 64, 250, true]);
  assert.match(kid.band, /4\.0 units\/kg × 16 kg = 64 units \(0\.26 mL\); or the entire 250-unit syringe/);
});

test('nothing is defaulted', () => {
  assert.match(p({}).message, /^Choose the product and situation/);
  assert.match(p({ product: 'hbig-after-exposure' }).message, /^Enter the weight/);
  assert.match(p({ product: 'varizig' }).message, /^Enter the weight/);
  assert.match(p({ product: 'tetanus-immune-globulin' }).message, /^Enter the age/);
  assert.match(p({ product: 'tetanus-immune-globulin', age: 4 }).message, /^Enter the weight.*Under 7 years/);
  assert.equal(passiveImmunizationDose(null, now).valid, false);
});
