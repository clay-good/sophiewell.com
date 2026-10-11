// spec-v1631 tool 8: fosphenytoin and IV phenytoin loading, on fail-closed label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fosphenytoinLoadRate as f, DRUGS } from '../../lib/fosphenytoin-load-rate-v1631.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const pht = { drug: 'phenytoin', population: 'adult', indication: 'status', route: 'iv', weight: 70, weightUnit: 'kg', mgPerKg: 15 };
const fos = { drug: 'fosphenytoin', population: 'adult', indication: 'status', route: 'iv', weight: 70, weightUnit: 'kg', mgPerKg: 20 };

test('the phenytoin label\'s own check: 15 mg/kg in a 70 kg patient is 1,050 mg, about 20 minutes at 50 mg/minute', () => {
  const r = f(pht, now);
  assert.deepEqual([r.dose, r.productMl, r.maxRate, r.shortestMinutes, r.doseAgainst, r.abnormal], [1050, 21, 50, 21, 'within', false]);
  for (const d of Object.values(DRUGS)) assert.equal(labelRow(d.setId, now).answers, true, d.name);
});

test('the label ranges: Cerebyx Tables 1 and 2, and the phenytoin label\'s single loading range', () => {
  const r = DRUGS.fosphenytoin.range;
  assert.deepEqual([r.status.adult, r.status.pediatric, r['non-emergent'].adult, r['non-emergent'].pediatric], [[15, 20], [15, 20], [10, 20], [10, 15]]);
  assert.deepEqual([DRUGS.phenytoin.range.status.adult, DRUGS.phenytoin.range.status.pediatric], [[10, 15], [15, 20]]);
  assert.deepEqual(DRUGS.phenytoin.range.status, DRUGS.phenytoin.range['non-emergent']);
  assert.equal(f({ ...fos, mgPerKg: 12 }, now).doseAgainst, 'below');
  assert.equal(f({ ...fos, indication: 'non-emergent', mgPerKg: 12 }, now).doseAgainst, 'within');
  assert.deepEqual([f({ ...fos, mgPerKg: 21 }, now).doseAgainst, f({ ...fos, mgPerKg: 21 }, now).abnormal], ['above', true]);
  assert.equal(f({ ...pht, mgPerKg: 16 }, now).doseAgainst, 'above');
});

test('fosphenytoin: 50 mg PE/mL, 150 mg PE/minute, 2 mg PE/kg/minute in children, and the level 2 hours after the infusion', () => {
  const adult = f({ ...fos, bagVolume: 100 }, now);
  assert.deepEqual([adult.dose, adult.productMl, adult.maxRate, adult.shortestMinutes, adult.concentrationAgainst, adult.levelAfterHours], [1400, 28, 150, 9.333, 'within', 2]);
  const child = f({ ...fos, population: 'pediatric', weight: 20, mgPerKg: 15 }, now);
  assert.deepEqual([child.dose, child.maxRate, child.shortestMinutes], [300, 40, 7.5]);
  // A 90 kg adolescent: 2 x 90 = 180, so the 150 mg PE/minute cap is the slower one.
  assert.equal(f({ ...fos, population: 'pediatric', weight: 90, mgPerKg: 15 }, now).maxRate, 150);
  assert.equal(f({ ...fos, bagVolume: 40 }, now).concentrationAgainst, 'above');
  assert.equal(f({ ...fos, bagVolume: 1000 }, now).concentrationAgainst, 'below');
});

test('phenytoin: 3 mg/kg/minute or 50 in children, and no less than 5 mg/mL in the bag', () => {
  const child = f({ ...pht, population: 'pediatric', weight: 10, mgPerKg: 18 }, now);
  assert.deepEqual([child.dose, child.maxRate, child.shortestMinutes], [180, 30, 6]);
  assert.equal(f({ ...pht, bagVolume: 250 }, now).concentrationAgainst, 'below');
  assert.equal(f({ ...pht, bagVolume: 210 }, now).concentrationAgainst, 'at or above');
  assert.match(f({ ...pht, route: 'im' }, now).message, /intravenous load only/);
});

test('IM fosphenytoin: no rate, a level at 4 hours, and the label\'s sentence for status epilepticus and children', () => {
  const adult = f({ ...fos, indication: 'non-emergent', route: 'im', mgPerKg: 15 }, now);
  assert.deepEqual([adult.shortestMinutes, adult.levelAfterHours, adult.abnormal], [undefined, 4, false]);
  const status = f({ ...fos, route: 'im' }, now);
  assert.equal(status.abnormal, true);
  assert.match(status.notes.join(' '), /should ordinarily not be used in the treatment of status epilepticus/);
  assert.equal(f({ ...fos, indication: 'non-emergent', population: 'pediatric', weight: 20, route: 'im', mgPerKg: 12 }, now).abnormal, true);
});

test('fail closed: a withheld label keeps the dose arithmetic and shows no range or rate', () => {
  const id = DRUGS.fosphenytoin.setId;
  const superseded = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-11-01' } };
  for (const [when, table] of [[new Date('2029-01-01T00:00:00Z'), undefined], [now, superseded]]) {
    const r = f(fos, when, table);
    assert.deepEqual([r.valid, r.withheld, r.dose, r.maxRate, r.doseAgainst], [true, true, 1400, undefined, undefined]);
    assert.doesNotMatch(r.notes.join(' '), /150 mg PE\/minute|15 to 20/);
  }
  assert.equal(f(pht, now, superseded).doseAgainst, 'within');
});

test('every choice is required', () => {
  for (const k of Object.keys(fos)) {
    const r = f({ ...fos, [k]: '' }, now);
    assert.equal(r.valid, false, k);
    assert.ok(r.message.length <= 280, k);
  }
});
