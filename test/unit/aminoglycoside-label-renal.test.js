// spec-v1631 tool 5: conventional aminoglycoside dosing by each drug's label, on three label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aminoglycosideLabelRenal as ag, LABELS, TABLE4, AMIKACIN_DAILY_CAP } from '../../lib/aminoglycoside-label-renal-v1631.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const gent = { drug: 'gentamicin', severity: 'serious', basis: 'actual', weight: 60, creatinine: 2 };

test('the labels\' constants: interval factors, Table 4, the amikacin ceiling', () => {
  assert.deepEqual(Object.values(LABELS).map((l) => [l.factor, l.every]), [[8, 8], [6, 8], [9, 12]]);
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true);
  assert.equal(TABLE4.length, 12);
  assert.deepEqual(TABLE4.map((r) => r[2]), [100, 80, 65, 55, 50, 40, 35, 30, 25, 20, 15, 10]);
  assert.deepEqual(TABLE4.map((r) => r[0]), [1, 1.3, 1.6, 1.9, 2.2, 2.5, 3, 3.5, 4, 5.1, 6.6, 8]);
  assert.equal(AMIKACIN_DAILY_CAP, 1500);
});

test('the gentamicin label\'s example: 60 kg, creatinine 2: 60 mg every 16 hours, or 30 mg every 8', () => {
  const r = ag(gent, now);
  assert.deepEqual([r.usualSingleDose, r.prolongedIntervalHours, r.reducedDoseRoughGuide, r.table4Percent, r.table4Dose], [60, 16, 30, 50, 30]);
  assert.equal(r.bandLabel, 'Every 16 h');
  assert.match(r.notes.join(' '), /1 to 1\.7 mg\/kg at the end of each dialysis, which is 60 to 102 mg/);
  assert.match(r.notes.join(' '), /peaks above 12 mcg\/mL and troughs above 2 mcg\/mL/);
});

test('gentamicin Table 4 is read at the creatinine rounded to 0.1 and stops at 8', () => {
  const pct = (creatinine) => ag({ ...gent, creatinine }, now).table4Percent;
  assert.deepEqual([1, 1.04, 1.1, 1.3, 1.4, 2.2, 2.3, 3, 3.1, 4.1, 5.15, 6.7, 8].map(pct), [100, 100, 80, 80, 65, 50, 40, 35, 30, 20, 15, 10, 10]);
  const over = ag({ ...gent, creatinine: 9 }, now);
  assert.equal(over.table4Percent, undefined);
  assert.match(over.notes.join(' '), /above the label's Table 4, which stops at 8/);
});

test('life-threatening: up to 5 mg/kg/day in three or four doses; tobramycin adds its level caution', () => {
  const r = ag({ ...gent, severity: 'life', creatinine: 1 }, now);
  assert.deepEqual([r.usualDailyDose, r.usualSingleDose], [300, 100]);
  assert.match(r.notes.join(' '), /100 mg every 8 hours or 75 mg every 6 hours/);
  assert.equal(r.bandLabel, 'No change');
  assert.equal(r.reducedDoseRoughGuide, undefined);
  assert.match(ag({ ...gent, drug: 'tobramycin', severity: 'life' }, now).notes.join(' '), /not to exceed 5 mg\/kg\/day unless serum levels are monitored/);
});

test('obesity: tobramycin lean weight plus 40% of the excess; gentamicin the lean estimate; amikacin none', () => {
  const lean = { basis: 'lean', weight: 120, leanWeight: 70 };
  const t = ag({ ...gent, drug: 'tobramycin', ...lean, creatinine: 1.2 }, now);
  assert.deepEqual([t.dosingWeight, t.usualSingleDose, t.prolongedIntervalHours, t.reducedDoseRoughGuide], [90, 90, 7.2, 75]);
  assert.equal(t.bandLabel, '75 mg');
  assert.match(t.notes.join(' '), /nomogram printed as a picture/);
  assert.equal(ag({ ...gent, ...lean }, now).dosingWeight, 70);
  assert.match(ag({ drug: 'amikacin', ...lean, creatinine: 1 }, now).message, /no rule for obesity/);
  assert.match(ag({ ...gent, basis: 'lean', leanWeight: 70 , weight: 65 }, now).message, /not below the actual weight/);
  assert.match(ag({ ...gent, basis: 'lean' }, now).message, /lean weight estimate/);
});

test('the amikacin label\'s example: creatinine 2: 7.5 mg/kg every 18 hours; and its 1.5 g ceiling', () => {
  const r = ag({ drug: 'amikacin', basis: 'actual', weight: 60, creatinine: 2 }, now);
  assert.deepEqual([r.usualDailyDose, r.usualSingleDose, r.prolongedIntervalHours, r.reducedDoseRoughGuide], [900, 450, 18, 225]);
  assert.match(r.notes.join(' '), /above 35 mcg\/mL and troughs above 10 mcg\/mL/);
  const heavy = ag({ drug: 'amikacin', severity: 'life', basis: 'actual', weight: 120, creatinine: 1.2 }, now);
  assert.deepEqual([heavy.usualDailyDose, heavy.usualSingleDose, heavy.reducedDoseRoughGuide], [1500, 750, 625]);
  assert.match(heavy.notes.join(' '), /1\.5 g\/day ceiling.*the severity entered changes nothing/);
});

test('nothing is defaulted; out-of-range values are refused', () => {
  assert.match(ag({}, now).message, /Choose the drug/);
  assert.match(ag({ ...gent, severity: '' }, now).message, /Choose the severity/);
  assert.match(ag({ ...gent, basis: '' }, now).message, /Choose the weight to dose on/);
  assert.equal(ag({ ...gent, weight: '' }, now).valid, false);
  assert.equal(ag({ ...gent, creatinine: '' }, now).valid, false);
  assert.equal(ag({ ...gent, creatinine: 0 }, now).valid, false);
  assert.equal(ag({ ...gent, weight: 20 }, now).valid, false);
  assert.equal(ag({ drug: 'amikacin', basis: 'actual', weight: 60, creatinine: 2 }, now).valid, true);
});

test('fail closed: a superseded or lapsed label withholds that drug\'s figures only', () => {
  const id = LABELS.gentamicin.setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  const r = ag(gent, now, table);
  assert.deepEqual([r.valid, r.withheld, r.usualSingleDose], [true, true, undefined]);
  assert.match(r.notes.join(' '), /withheld: the label's text has changed/);
  assert.match(r.labelUrl, /setid=449c9a41/);
  assert.equal(ag({ ...gent, drug: 'tobramycin' }, now, table).withheld, undefined);
  assert.equal(ag(gent, new Date('2028-01-01T00:00:00Z')).withheld, true);
});
