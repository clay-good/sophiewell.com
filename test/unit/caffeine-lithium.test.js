// spec-v1631 tools 12 and 14: caffeine citrate dosing and a lithium level, on fail-closed label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { caffeineCitrateDose as cc, LABEL as CAFFEINE } from '../../lib/caffeine-citrate-dose-v1631.js';
import { lithiumLevelCheck as li, LABEL as LITHIUM } from '../../lib/lithium-level-check-v1631.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const late = new Date('2029-01-01T00:00:00Z');

test('both labels are watched and answer today', () => {
  assert.equal(labelRow(CAFFEINE.setId, now).answers, true);
  assert.equal(labelRow(LITHIUM.setId, now).answers, true);
});

test('caffeine citrate: 20 mg/kg (1 mL/kg) once, then 5 mg/kg (0.25 mL/kg) daily; the base is half', () => {
  const r = cc({ weight: 1.2, weightUnit: 'kg' }, now);
  assert.deepEqual([r.loadingMg, r.loadingBaseMg, r.loadingMl, r.maintenanceMg, r.maintenanceBaseMg, r.maintenanceMl], [24, 12, 1.2, 6, 3, 0.3]);
  assert.equal(cc({ weight: 1200, weightUnit: 'g' }, now).loadingMl, 1.2);
  assert.match(r.notes.join(' '), /over 30 minutes, one time.*beginning 24 hours after the loading dose/);
  assert.match(r.notes.join(' '), /therapeutic range could not be determined/);
});

test('caffeine citrate: a level is flagged above 50 mg/L and no range is invented', () => {
  assert.deepEqual([cc({ weight: 1.2, weightUnit: 'kg', level: 50 }, now).abnormal, cc({ weight: 1.2, weightUnit: 'kg', level: 50.1 }, now).abnormal], [false, true]);
  const r = cc({ weight: 1.2, weightUnit: 'kg', level: 30 }, now);
  assert.doesNotMatch(`${r.band} ${r.notes.join(' ')}`, /therapeutic range of|target range/);
  assert.match(cc({ weight: 1.2 }, now).message, /weight unit/);
  assert.match(cc({ weight: 60, weightUnit: 'kg' }, now).message, /apnea of prematurity/);
});

test('lithium: 0.8 to 1.2 mEq/L acute, 0.8 to 1 maintenance, 1.5 or more toxic', () => {
  const at = (phase, level) => li({ phase, level, hoursSinceDose: 12 }, now).levelAgainst;
  assert.deepEqual([at('acute', 0.7), at('acute', 0.8), at('acute', 1.2), at('acute', 1.3), at('acute', 1.5)], ['below', 'within', 'within', 'above', 'toxic']);
  assert.deepEqual([at('maintenance', 1), at('maintenance', 1.1), at('maintenance', 1.49), at('maintenance', 1.5)], ['within', 'above', 'above', 'toxic']);
  assert.equal(li({ phase: 'maintenance', level: 0.9, hoursSinceDose: 12 }, now).abnormal, false);
  assert.match(li({ phase: 'maintenance', level: 0.9, hoursSinceDose: 12 }, now).note, /not a finding of safety/);
});

test('lithium: a sample not drawn at 12 hours is not comparable to the range', () => {
  assert.equal(li({ phase: 'acute', level: 1, hoursSinceDose: 12 }, now).timedAsLabel, true);
  const early = li({ phase: 'acute', level: 1, hoursSinceDose: 4 }, now);
  assert.equal(early.timedAsLabel, false);
  assert.match(early.band, /not a 12-hour sample, so not comparable to the range/);
});

test('lithium: the label\'s renal statements, and the proportional dose with its assumptions', () => {
  assert.deepEqual([li({ phase: 'acute', level: 1, hoursSinceDose: 12, creatinineClearance: 29 }, now).renal, li({ phase: 'acute', level: 1, hoursSinceDose: 12, creatinineClearance: 30 }, now).renal, li({ phase: 'acute', level: 1, hoursSinceDose: 12, creatinineClearance: 90 }, now).renal], ['severe', 'mild to moderate', 'normal']);
  const r = li({ phase: 'acute', level: 0.6, hoursSinceDose: 12, dailyDose: 900, target: 0.9 }, now);
  assert.equal(r.proportionalDose, 1350);
  assert.match(r.notes.join(' '), /assumes linear kinetics, steady state, a 12-hour sample and unchanged kidney function/);
  assert.match(li({ phase: 'acute', level: 0.6, hoursSinceDose: 12, dailyDose: 900 }, now).message, /both the current daily dose and the target/);
  assert.match(li({ phase: 'acute', level: 0.6, hoursSinceDose: 12, dailyDose: 900, target: 2 }, now).message, /target level/);
});

test('fail closed: a withheld label shows no dose and no range', () => {
  const c = cc({ weight: 1.2, weightUnit: 'kg' }, late);
  assert.deepEqual([c.valid, c.withheld, c.loadingMg], [true, true, undefined]);
  assert.doesNotMatch(`${c.band} ${c.notes.join(' ')}`, /24 mg|20 mg\/kg/);
  const superseded = { ...LABEL_EDITIONS, [LITHIUM.setId]: { ...LABEL_EDITIONS[LITHIUM.setId], supersededOn: '2026-11-01' } };
  const l = li({ phase: 'acute', level: 1.6, hoursSinceDose: 12 }, now, superseded);
  assert.deepEqual([l.valid, l.withheld, l.levelAgainst], [true, true, undefined]);
  assert.doesNotMatch(`${l.band} ${l.notes.join(' ')}`, /0\.8 to 1\.2|toxic/);
  assert.equal(cc({ weight: 1.2, weightUnit: 'kg' }, now, superseded).loadingMg, 24);
});
