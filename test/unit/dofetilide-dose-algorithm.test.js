// spec-v1632 tool 10: the dofetilide initiation algorithm, on the Tikosyn label row.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dofetilideDoseAlgorithm as d, LABEL, STARTING, STEP_DOWN } from '../../lib/dofetilide-dose-algorithm-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d({ conduction: 'no', baselineQt: 400, crcl: 80, ...i }, now);

test('the label\'s table and step-down map', () => {
  assert.equal(labelRow(LABEL.setId, now).answers, true);
  assert.deepEqual(STARTING.map((s) => s.dose), [500, 250, 125, 0]);
  assert.deepEqual(STEP_DOWN, { 500: '250 mcg twice daily', 250: '125 mcg twice daily', 125: '125 mcg once a day' });
});

test('step 1: a baseline above 440 msec, or 500 with a conduction abnormality, is contraindicated', () => {
  assert.equal(run({ baselineQt: 440 }).flag, 'dose');
  assert.deepEqual([run({ baselineQt: 441 }).flag, run({ baselineQt: 441 }).step], ['contraindicated', 1]);
  assert.equal(run({ baselineQt: 500, conduction: 'yes' }).flag, 'dose');
  assert.equal(run({ baselineQt: 501, conduction: 'yes' }).flag, 'contraindicated');
});

test('step 3: the starting dose by clearance; exactly 60 is 250 mcg, exactly 40 is 250, below 20 is contraindicated', () => {
  assert.deepEqual([61, 60, 40, 39.9, 20].map((crcl) => run({ crcl }).startingDose), [500, 250, 250, 125, 125]);
  const low = run({ crcl: 19.9 });
  assert.deepEqual([low.flag, low.step], ['contraindicated', 3]);
});

test('step 5: more than 15% above baseline, or above 500 msec (550), steps the dose down once', () => {
  // 400 -> 460 is exactly 15%: not more than 15%.
  const same = run({ firstDoseQt: 460 });
  assert.deepEqual([same.step, same.percentChange, same.adjustedDose, same.currentDose], [5, 15, undefined, '500 mcg twice daily']);
  const up = run({ firstDoseQt: 461 });
  assert.deepEqual([up.adjustedDose, up.currentDose], ['250 mcg twice daily', '250 mcg twice daily']);
  assert.equal(run({ crcl: 50, firstDoseQt: 470 }).adjustedDose, '125 mcg twice daily');
  assert.equal(run({ crcl: 30, firstDoseQt: 470 }).adjustedDose, '125 mcg once a day');
  // Above 500 msec without a 15% rise: baseline 440 -> 501 is 13.9%.
  const lim = run({ baselineQt: 440, firstDoseQt: 501 });
  assert.equal(lim.adjustedDose, '250 mcg twice daily');
  assert.match(lim.notes.join(' '), /it is above 500 msec/);
  assert.equal(run({ baselineQt: 490, conduction: 'yes', firstDoseQt: 550 }).adjustedDose, undefined);
  assert.equal(run({ baselineQt: 490, conduction: 'yes', firstDoseQt: 551 }).adjustedDose, '250 mcg twice daily');
});

test('step 6: above 500 msec (550) after a later dose, the label says discontinue; otherwise no further change', () => {
  const stop = run({ firstDoseQt: 450, laterQt: 501 });
  assert.deepEqual([stop.flag, stop.step, stop.bandLabel], ['discontinue', 6, 'Discontinue']);
  const go = run({ firstDoseQt: 470, laterQt: 500 });
  assert.deepEqual([go.flag, go.currentDose], ['dose', '250 mcg twice daily']);
  assert.match(go.notes.join(' '), /no further down-titration/);
  assert.equal(run({ conduction: 'yes', laterQt: 550 }).flag, 'dose');
  assert.equal(run({ conduction: 'yes', laterQt: 551 }).flag, 'discontinue');
});

test('nothing is defaulted; the label withheld stops the algorithm', () => {
  assert.match(d({ baselineQt: 400, crcl: 60 }, now).message, /ventricular conduction abnormality/);
  assert.equal(run({ baselineQt: '' }).valid, false);
  assert.equal(run({ crcl: '' }).valid, false);
  assert.equal(run({ firstDoseQt: 5 }).valid, false);
  assert.match(run({}).note, /below 50 beats per minute were not studied/);
  const table = { ...LABEL_EDITIONS, [LABEL.setId]: { ...LABEL_EDITIONS[LABEL.setId], supersededOn: '2026-10-10' } };
  const r = d({ conduction: 'no', baselineQt: 400, crcl: 80 }, now, table);
  assert.deepEqual([r.withheld, r.startingDose], [true, undefined]);
});
