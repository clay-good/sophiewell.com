// spec-v1631 tool 7: phenytoin dose from two steady-state levels (Michaelis-Menten).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phenytoinMmDose as mm, LABEL } from '../../lib/phenytoin-mm-dose-v1631.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
// A simulated patient: Vmax 500 mg/day of phenytoin acid, Km 4 mcg/mL.
const level = (sodiumDose) => Number(((4 * sodiumDose * 0.92) / (500 - sodiumDose * 0.92)).toFixed(4));
const base = { dose1: 300, form1: 'sodium', level1: level(300), dose2: 400, form2: 'sodium', level2: level(400), target: 15 };

test('two pairs recover the Km and Vmax that made them', () => {
  const r = mm(base, now);
  assert.ok(Math.abs(r.km - 4) < 0.01 && Math.abs(r.vmax - 500) < 0.5, `${r.km} ${r.vmax}`);
  // Dose for 15 mcg/mL: 500 x 15 / 19 = 394.7 mg/day of acid, 429.1 as the sodium salt.
  assert.ok(Math.abs(r.doseForTarget - 394.7) < 0.3 && Math.abs(r.doseForTargetSodium - 429.1) < 0.3);
  assert.equal(labelRow(LABEL.setId, now).answers, true);
  assert.equal(LABEL.saltToAcid, 0.92);
});

test('a free-acid dose and a sodium-salt dose are put on one basis', () => {
  // 368 mg of acid is 400 mg of the sodium salt.
  const mixed = mm({ ...base, dose2: 368, form2: 'acid' }, now);
  assert.ok(Math.abs(mixed.km - 4) < 0.01 && Math.abs(mixed.vmax - 500) < 0.5);
  assert.match(mixed.notes[0], /sodium salt × 0\.92 = phenytoin acid/);
});

test('the predicted level climbs steeply, and a dose at or past Vmax has no steady state', () => {
  const r = mm(base, now);
  const at = (d) => r.table.find((x) => x.sodiumDose === d).level;
  assert.ok(Math.abs(at(300) - level(300)) < 0.01 && Math.abs(at(400) - level(400)) < 0.02);
  assert.ok(at(500) > 3 * at(400));
  assert.equal(at(600), null);
  assert.match(r.notes.join(' '), /From 600 mg\/day the dose exceeds the estimated maximum rate of metabolism/);
  assert.ok(Math.abs(mm({ ...base, testDose: 450, testForm: 'sodium' }, now).testLevel - level(450)) < 0.05);
  assert.match(mm({ ...base, testDose: 600, testForm: 'sodium' }, now).message, /exceeds the estimated maximum rate of metabolism/);
  assert.match(mm({ ...base, testDose: 450 }, now).message, /form of the dose to test/);
});

test('pairs that cannot both be steady-state levels are refused', () => {
  assert.match(mm({ ...base, level1: 12, level2: 10 }, now).message, /higher dose did not give the higher level/);
  // A level that rises less than in proportion to the dose implies a negative Km.
  assert.match(mm({ ...base, level1: 10, level2: 12 }, now).message, /negative Km or maximum rate/);
  assert.match(mm({ ...base, dose2: 300 }, now).message, /one point, not a curve/);
  assert.match(mm({ ...base, form1: '' }, now).message, /product form/);
  assert.match(mm({ ...base, target: '' }, now).message, /target level/);
});

test('the label\'s range is quoted, and the target stays the reader\'s', () => {
  const r = mm(base, now);
  assert.match(r.notes.join(' '), /10 to 20 mcg\/mL \(unbound 1 to 2 mcg\/mL\); the target is yours/);
  assert.equal(r.abnormal, undefined);
});

test('fail closed: with the label withheld, one form still works and mixed forms are refused', () => {
  const superseded = { ...LABEL_EDITIONS, [LABEL.setId]: { ...LABEL_EDITIONS[LABEL.setId], supersededOn: '2026-11-01' } };
  for (const [when, table] of [[new Date('2029-01-01T00:00:00Z'), undefined], [now, superseded]]) {
    const same = mm(base, when, table);
    assert.deepEqual([same.valid, same.withheld, same.doseForTargetSodium, same.table], [true, true, undefined, undefined]);
    assert.doesNotMatch(same.notes.join(' '), /0\.92|10 to 20/);
    const mixed = mm({ ...base, dose2: 368, form2: 'acid' }, when, table);
    assert.deepEqual([mixed.valid, mixed.withheld], [false, true]);
    assert.ok(mixed.message.length <= 280, String(mixed.message.length));
  }
});
