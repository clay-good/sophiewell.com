// spec-v1635 tool 12: epoetin and darbepoetin in chemotherapy anemia, by the label rules.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esaChemoDoseAdjust, LABELS } from '../../lib/esa-chemo-dose-adjust-v1635.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const e = (i, t) => esaChemoDoseAdjust(i, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });
const on = { stage: 'on-therapy', hemoglobin: 9.5, weight: 70, transfusionLevel: 'below', transfusionsStillRequired: 'no', chemoCompleted: 'no' };
const got = (r) => [r.flag, r.newDose];

test('both label rows answer; each agent withholds only on its own label', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  const start = { schedule: 'epoetin-weekly', stage: 'not-started', hemoglobin: 9, monthsPlanned: 3 };
  assert.equal(e(start, dead(LABELS.epoetin.setId)).flag, 'withheld');
  assert.equal(e(start, dead(LABELS.darbepoetin.setId)).flag, 'starting-dose');
});

test('starting: hemoglobin under 10 g/dL and two more months, then the label starting dose', () => {
  assert.deepEqual(got(e({ schedule: 'epoetin-three-weekly-doses', stage: 'not-started', hemoglobin: 9.4, weight: 70, monthsPlanned: 3 })), ['starting-dose', 10500]);
  assert.deepEqual(got(e({ schedule: 'epoetin-weekly', stage: 'not-started', hemoglobin: 9.9, monthsPlanned: 2 })), ['starting-dose', 40000]);
  assert.deepEqual(got(e({ schedule: 'epoetin-pediatric-weekly', stage: 'not-started', hemoglobin: 9, weight: 30, monthsPlanned: 2 })), ['starting-dose', 18000]);
  assert.deepEqual(got(e({ schedule: 'darbepoetin-weekly', stage: 'not-started', hemoglobin: 9, weight: 80, monthsPlanned: 2 })), ['starting-dose', 180]);
  assert.deepEqual(got(e({ schedule: 'darbepoetin-every-3-weeks', stage: 'not-started', hemoglobin: 9, monthsPlanned: 2 })), ['starting-dose', 500]);
  // Exactly 10 g/dL is not "less than 10"; one month is under the minimum.
  assert.deepEqual(got(e({ schedule: 'epoetin-weekly', stage: 'not-started', hemoglobin: 10, monthsPlanned: 3 })), ['initiation-not-met', undefined]);
  assert.deepEqual(got(e({ schedule: 'epoetin-weekly', stage: 'not-started', hemoglobin: 9, monthsPlanned: 1 })), ['initiation-not-met', undefined]);
});

test('reduce: a rise over 1 g/dL in 2 weeks, or the level reached; 25% for epoetin, 40% for darbepoetin', () => {
  assert.deepEqual(got(e({ ...on, schedule: 'epoetin-weekly', currentDose: 40000, weeksOnTherapy: 3, hemoglobinTwoWeeksAgo: 8.2 })), ['reduce', 30000]);
  // Exactly 1 g/dL is not "greater than 1".
  assert.equal(e({ ...on, schedule: 'epoetin-weekly', currentDose: 40000, weeksOnTherapy: 3, hemoglobinTwoWeeksAgo: 8.5 }).flag, 'no-rule-met');
  assert.deepEqual(got(e({ ...on, schedule: 'darbepoetin-every-3-weeks', currentDose: 500, weeksOnTherapy: 3, transfusionLevel: 'reached' })), ['reduce', 300]);
  assert.deepEqual(got(e({ ...on, schedule: 'darbepoetin-weekly', currentDose: 157.5, weeksOnTherapy: 3, transfusionLevel: 'reached' })), ['reduce', 94.5]);
});

test('withhold above the level, with the restart dose', () => {
  const r = e({ ...on, schedule: 'epoetin-three-weekly-doses', currentDose: 10500, weeksOnTherapy: 3, transfusionLevel: 'exceeds' });
  assert.deepEqual([r.flag, r.action, r.newDose], ['withhold', 'withhold', 7875]);
  assert.match(r.band, /restart 25% below the previous dose/);
});

test('increase: after 4 weeks (epoetin) or 6 weeks (weekly darbepoetin), a rise under 1 g/dL and hemoglobin below 10', () => {
  const slow = { hemoglobinTwoWeeksAgo: 9.2, hemoglobinAtStart: 9.0 };
  assert.deepEqual(got(e({ ...on, ...slow, schedule: 'epoetin-weekly', currentDose: 40000, weeksOnTherapy: 4 })), ['increase', 60000]);
  assert.equal(e({ ...on, ...slow, schedule: 'epoetin-weekly', currentDose: 40000, weeksOnTherapy: 3 }).flag, 'no-rule-met');
  assert.deepEqual(got(e({ ...on, ...slow, schedule: 'epoetin-three-weekly-doses', currentDose: 10500, weeksOnTherapy: 4 })), ['increase', 21000]);
  // Pediatric: 900 Units/kg, capped at the label maximum of 60,000 Units.
  assert.deepEqual(got(e({ ...on, ...slow, schedule: 'epoetin-pediatric-weekly', weight: 30, currentDose: 18000, weeksOnTherapy: 4 })), ['increase', 27000]);
  assert.deepEqual(got(e({ ...on, ...slow, schedule: 'epoetin-pediatric-weekly', weight: 80, currentDose: 48000, weeksOnTherapy: 4 })), ['increase', 60000]);
  assert.equal(e({ ...on, ...slow, schedule: 'darbepoetin-weekly', currentDose: 157.5, weeksOnTherapy: 5 }).flag, 'no-rule-met');
  assert.deepEqual(got(e({ ...on, ...slow, schedule: 'darbepoetin-weekly', currentDose: 157.5, weeksOnTherapy: 6 })), ['increase', 315]);
  // The every-3-week schedule has no increase.
  assert.deepEqual(got(e({ ...on, ...slow, schedule: 'darbepoetin-every-3-weeks', currentDose: 500, weeksOnTherapy: 6 })), ['no-increase-on-this-schedule', null]);
  // A hemoglobin of 10 or more, or a rise of 1 or more, is not the increase rule.
  assert.equal(e({ ...on, hemoglobin: 10, hemoglobinTwoWeeksAgo: 9.8, hemoglobinAtStart: 9.6, schedule: 'epoetin-weekly', currentDose: 40000, weeksOnTherapy: 5 }).flag, 'no-rule-met');
});

test('discontinue: transfusions still required at 8 weeks, or the course completed', () => {
  assert.equal(e({ ...on, schedule: 'epoetin-weekly', currentDose: 40000, weeksOnTherapy: 8, transfusionsStillRequired: 'yes' }).flag, 'discontinue-week-8');
  assert.notEqual(e({ ...on, schedule: 'epoetin-weekly', currentDose: 40000, weeksOnTherapy: 7, transfusionsStillRequired: 'yes' }).action, 'discontinue');
  assert.equal(e({ ...on, schedule: 'darbepoetin-weekly', currentDose: 157.5, weeksOnTherapy: 3, chemoCompleted: 'yes' }).flag, 'discontinue-course-complete');
  // "No response" has no number in the label, so it is stated and not decided.
  assert.match(e({ ...on, schedule: 'epoetin-weekly', currentDose: 40000, weeksOnTherapy: 9, hemoglobinTwoWeeksAgo: 9.4, hemoglobinAtStart: 8.2 }).notes.join(' '), /puts no number on response/);
});

test('an untested rule is not "no rule met"', () => {
  const r = e({ ...on, schedule: 'epoetin-weekly', currentDose: 40000, weeksOnTherapy: 5 });
  assert.deepEqual([r.flag, r.abnormal], ['no-rule-met-incomplete', true]);
  assert.match(r.band, /2-week rise.*rise since the ESA was started/);
  const full = e({ ...on, schedule: 'epoetin-weekly', currentDose: 40000, weeksOnTherapy: 3, hemoglobinTwoWeeksAgo: 9.2 });
  assert.deepEqual([full.flag, full.abnormal], ['no-rule-met', false]);
});

test('nothing is defaulted', () => {
  assert.match(e({}).message, /^Choose the agent and schedule/);
  assert.match(e({ schedule: 'epoetin-weekly' }).message, /^Choose the stage/);
  assert.match(e({ schedule: 'epoetin-weekly', stage: 'not-started' }).message, /^Enter the hemoglobin now/);
  assert.match(e({ schedule: 'darbepoetin-weekly', stage: 'not-started', hemoglobin: 9 }).message, /^Enter the weight/);
  assert.match(e({ schedule: 'epoetin-weekly', stage: 'not-started', hemoglobin: 9 }).message, /^Enter the months of chemotherapy/);
  assert.match(e({ schedule: 'epoetin-weekly', stage: 'on-therapy', hemoglobin: 9 }).message, /^Enter the current dose/);
  const base = { schedule: 'epoetin-weekly', stage: 'on-therapy', hemoglobin: 9, currentDose: 40000, weeksOnTherapy: 2 };
  assert.match(e(base).message, /^Choose where the hemoglobin stands/);
  assert.match(e({ ...base, transfusionLevel: 'below' }).message, /^Choose whether red cell transfusions/);
  assert.match(e({ ...base, transfusionLevel: 'below', transfusionsStillRequired: 'no' }).message, /^Choose whether the chemotherapy course/);
  assert.equal(esaChemoDoseAdjust(null, now).valid, false);
});
