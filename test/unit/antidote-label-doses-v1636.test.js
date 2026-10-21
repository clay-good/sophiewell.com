// spec-v1636 tools 1 and 2: oral acetylcysteine and fomepizole, each from its label.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nacOralRegimen, LABEL as NAC } from '../../lib/nac-oral-regimen-v1636.js';
import { fomepizoleSchedule, LABEL as FOM } from '../../lib/fomepizole-schedule-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const nac = (i, t) => nacOralRegimen({ strength: '20-percent', ...i }, now, t);
const fom = (i, t) => fomepizoleSchedule({ weight: 70, dialysis: 'off-dialysis', ...i }, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });

test('both label rows answer, and a superseded one withholds the figures', () => {
  for (const l of [NAC, FOM]) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(nac({ weight: 75 }, dead(NAC.setId)).loadGrams, undefined);
  assert.equal(fom({ dosesGiven: 0 }, dead(FOM.setId)).doseMg, undefined);
});

test('acetylcysteine: every row of the label table', () => {
  const rows = [[20, 4, 2], [29, 4, 2], [30, 6, 3], [45, 7, 3.5], [55, 8, 4], [65, 10, 5], [75, 11, 5.5], [85, 13, 6.5], [95, 14, 7], [109, 15, 7.5]];
  for (const [kg, load, maint] of rows) {
    const r = nac({ weight: kg });
    assert.deepEqual([r.flag, r.loadGrams, r.maintenanceGrams, r.courseGrams], ['table-row', load, maint, load + 17 * maint], `${kg} kg`);
  }
  // The row's volumes are the label's, including its rounding (3.5 g is printed as 18 mL of 20%).
  assert.match(nac({ weight: 45 }).notes[1], /3\.5 g .* = 18 mL of 20% solution with 52 mL of diluent, 70 mL of 5% solution/);
  assert.match(nac({ weight: 75 }).notes[0], /11 g \(146\.7 mg\/kg at 75 kg\) = 55 mL of 20% solution with 165 mL of diluent, 220 mL/);
  // The band dose is above the per-kilogram figure, and the result says so.
  assert.match(nac({ weight: 75 }).notes.join(' '), /per-kilogram calculation would give 10\.5 g, and the label row gives 11 g/);
});

test('acetylcysteine: calculated under 20 kg, both rows between bands, no row above 109 kg', () => {
  const child = nac({ weight: 15 });
  assert.deepEqual([child.flag, child.loadGrams, child.maintenanceGrams, child.courseGrams], ['calculated-under-20-kg', 2.1, 1.05, 19.95]);
  assert.match(child.notes[1], /1\.05 g .* = 5\.25 mL of 20% solution with 15\.75 mL of diluent, 21 mL of 5% solution/);
  const gap = nac({ weight: 29.5 });
  assert.deepEqual([gap.flag, gap.abnormal, gap.loadGrams], ['between-rows', true, undefined]);
  assert.match(gap.notes[0], /^Row 20 to 29 kg/); assert.match(gap.notes[1], /^Row 30 to 39 kg/);
  for (const kg of [109.5, 110, 140]) {
    const big = nac({ weight: kg });
    assert.deepEqual([big.flag, big.abnormal, big.loadGrams], ['above-table', true, undefined], `${kg}`);
    assert.match(big.band, /not a label row/);
  }
});

test('acetylcysteine: the 10% solution reaches the same 5% and is marked as arithmetic', () => {
  const r = nac({ weight: 45, strength: '10-percent' });
  assert.match(r.notes[0], /7 g .* = 70 mL of 10% solution with 70 mL of diluent, 140 mL of 5% solution \(arithmetic/);
});

test('acetylcysteine: 18 doses, the last 68 hours after the loading dose', () => {
  const r = nac({ weight: 75, loadTime: '2026-10-11T22:00' });
  assert.equal(r.doseTimes.length, 18);
  assert.deepEqual([r.doseTimes[0], r.doseTimes[1], r.doseTimes[17]], ['2026-10-11 22:00', '2026-10-12 02:00', '2026-10-14 18:00']);
  assert.equal(nac({ weight: 75 }).doseTimes, undefined);
  assert.match(nac({ weight: 75 }).notes.join(' '), /vomits any oral dose within 1 hour/);
});

test('acetylcysteine: nothing is defaulted', () => {
  assert.match(nacOralRegimen({}, now).message, /^Enter the weight/);
  assert.match(nacOralRegimen({ weight: 70 }, now).message, /^Choose the solution strength/);
  assert.match(nac({ weight: 70, loadTime: 'tomorrow' }).message, /^Enter the time of the loading dose/);
  assert.equal(nacOralRegimen(null, now).valid, false);
});

test('fomepizole: 15 mg/kg, four doses at 10 mg/kg, then 15 mg/kg, every 12 hours', () => {
  assert.deepEqual((({ flag, doseMg, at }) => [flag, doseMg, at])(fom({ dosesGiven: 0 })), ['loading-dose', 1050, null]);
  const last = '2026-10-11T08:00';
  const dose = (dosesGiven) => (({ doseMg, at, doseNumber }) => [doseNumber, doseMg, at])(fom({ dosesGiven, lastDoseTime: last }));
  assert.deepEqual([dose(1), dose(4), dose(5), dose(9)], [[2, 700, '2026-10-11 20:00'], [5, 700, '2026-10-11 20:00'], [6, 1050, '2026-10-11 20:00'], [10, 1050, '2026-10-11 20:00']]);
});

test('fomepizole: every 4 hours during hemodialysis', () => {
  const r = fom({ dosesGiven: 2, dialysis: 'during-dialysis', lastDoseTime: '2026-10-11T08:00' });
  assert.deepEqual([r.flag, r.doseMg, r.at], ['next-dose-dialysis', 700, '2026-10-11 12:00']);
});

test('fomepizole: at the start of dialysis, 6 hours since the last dose is the line', () => {
  const start = (dialysisTime) => (({ flag, doseMg, at }) => [flag, doseMg, at])(fom({ dosesGiven: 2, dialysis: 'dialysis-begins', lastDoseTime: '2026-10-11T08:00', dialysisTime }));
  // 4 hours from the last dose (12:00) is before dialysis began at 13:59, so no time is given (spec-v1664).
  assert.deepEqual(start('2026-10-11T13:59'), ['no-dose-at-start', 0, null]);
  assert.deepEqual(start('2026-10-11T11:00'), ['no-dose-at-start', 0, '2026-10-11 12:00']);
  assert.deepEqual(start('2026-10-11T14:00'), ['dose-at-start', 700, '2026-10-11 14:00']);
});

test('fomepizole: at the end of dialysis, under 1 hour none, 1 to 3 hours half, over 3 hours the full dose', () => {
  const end = (dialysisTime) => (({ flag, doseMg, scheduledDoseMg }) => [flag, doseMg, scheduledDoseMg])(fom({ dosesGiven: 2, dialysis: 'dialysis-ends', lastDoseTime: '2026-10-11T08:00', dialysisTime }));
  assert.deepEqual(end('2026-10-11T08:59'), ['no-dose-at-end', 0, 700]);
  assert.deepEqual(end('2026-10-11T09:00'), ['half-dose-at-end', 350, 700]);
  assert.deepEqual(end('2026-10-11T11:00'), ['half-dose-at-end', 350, 700]);
  assert.deepEqual(end('2026-10-11T11:01'), ['dose-at-end', 700, 700]);
  const half = fom({ dosesGiven: 2, dialysis: 'dialysis-ends', lastDoseTime: '2026-10-11T08:00', dialysisTime: '2026-10-11T10:00' });
  assert.match(half.notes.join(' '), /does not say whether this half dose counts/);
});

test('fomepizole: nothing is defaulted, and the times it needs are asked for', () => {
  assert.match(fomepizoleSchedule({}, now).message, /^Enter the weight/);
  assert.match(fomepizoleSchedule({ weight: 70 }, now).message, /^Enter the number of doses given/);
  assert.match(fomepizoleSchedule({ weight: 70, dosesGiven: 1 }, now).message, /^Choose the hemodialysis state/);
  assert.match(fom({ dosesGiven: 1 }).message, /^Enter the time of the last dose/);
  assert.match(fom({ dosesGiven: 1, dialysis: 'dialysis-ends', lastDoseTime: '2026-10-11T08:00' }).message, /^Enter the time hemodialysis ended/);
  assert.match(fom({ dosesGiven: 1, dialysis: 'dialysis-begins', lastDoseTime: '2026-10-11T08:00', dialysisTime: '2026-10-11T07:00' }).message, /before the last dose/);
  assert.match(fom({ dosesGiven: 1.5, lastDoseTime: '2026-10-11T08:00' }).message, /whole number/);
  assert.match(fom({ dosesGiven: 0 }).notes.join(' '), /undetectable or below 20 mg\/dL/);
  assert.equal(fomepizoleSchedule(null, now).valid, false);
});
