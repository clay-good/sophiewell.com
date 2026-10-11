// spec-v1632 tool 16: ketorolac dose and duration limits, on two label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ketorolacLimitCheck as d, LABELS, DOSES, MAX_DAYS } from '../../lib/ketorolac-limit-check-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d({ age: 40, weight: 70, renal: 'no', daysSoFar: 1, ...i }, now);

test('the labels\' doses and limits', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.deepEqual([DOSES['parenteral-multiple'].max, DOSES.oral.max, MAX_DAYS], [[120, 60], [40, 40], 5]);
});

test('single doses: IM 60 or 30 mg, IV 30 or 15 mg, the lower one at 65, renally impaired, or under 50 kg', () => {
  assert.equal(run({ route: 'im-single' }).labelDose, 'one dose of 60 mg');
  assert.equal(run({ route: 'im-single', age: 65 }).labelDose, 'one dose of 30 mg');
  assert.equal(run({ route: 'im-single', age: 64 }).labelDose, 'one dose of 60 mg');
  assert.equal(run({ route: 'iv-single' }).labelDose, 'one dose of 30 mg');
  assert.equal(run({ route: 'iv-single', weight: 49.9 }).labelDose, 'one dose of 15 mg');
  assert.equal(run({ route: 'iv-single', weight: 50 }).labelDose, 'one dose of 30 mg');
  assert.equal(run({ route: 'iv-single', renal: 'impaired' }).labelDose, 'one dose of 15 mg');
  assert.equal(run({ route: 'iv-single' }).dailyMax, undefined);
});

test('multiple doses: the daily ceiling against what was given in the last 24 hours', () => {
  const r = run({ route: 'parenteral-multiple', mg24h: 90 });
  assert.deepEqual([r.labelDose, r.dailyMax, r.mgRemaining, r.flag], ['30 mg every 6 hours', 120, 30, 'dose']);
  const low = run({ route: 'parenteral-multiple', weight: 45, mg24h: 60 });
  assert.deepEqual([low.labelDose, low.dailyMax, low.mgRemaining, low.flag], ['15 mg every 6 hours', 60, 0, 'limit-reached']);
  assert.match(run({ route: 'parenteral-multiple' }).message, /total ketorolac given in the last 24 hours/);
  assert.equal(run({ route: 'parenteral-multiple', mg24h: 0 }).mgRemaining, 120);
});

test('tablets: 20 mg once then 10 mg, or 10 mg once then 10 mg, not above 40 mg/day; continuation only', () => {
  const r = run({ route: 'oral', mg24h: 20 });
  assert.deepEqual([r.dailyMax, r.mgRemaining], [40, 20]);
  assert.match(r.labelDose, /^20 mg once, then 10 mg/);
  assert.match(run({ route: 'oral', age: 70, mg24h: 0 }).labelDose, /^10 mg once, then 10 mg/);
  assert.match(r.notes.join(' '), /only for continuation after IV or IM dosing/);
});

test('five days by any route; advanced renal impairment is a contraindication', () => {
  assert.deepEqual([run({ route: 'iv-single', daysSoFar: 4 }).daysRemaining, run({ route: 'iv-single', daysSoFar: 4 }).flag], [1, 'dose']);
  const over = run({ route: 'oral', mg24h: 10, daysSoFar: 5 });
  assert.deepEqual([over.daysRemaining, over.flag, over.bandLabel], [0, 'limit-reached', 'Limit reached']);
  const adv = run({ route: 'im-single', renal: 'advanced' });
  assert.deepEqual([adv.flag, adv.labelDose], ['contraindicated', undefined]);
});

test('nothing is defaulted; adults only; a superseded label withholds that product only', () => {
  assert.match(d({}, now).message, /Choose the route and regimen/);
  assert.match(run({ route: 'iv-single', renal: '' }).message, /renally impaired/);
  assert.equal(run({ route: 'iv-single', age: 16 }).valid, false);
  assert.equal(run({ route: 'iv-single', daysSoFar: '' }).valid, false);
  const id = LABELS.tablets.setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  assert.equal(d({ age: 40, weight: 70, renal: 'no', daysSoFar: 1, route: 'oral', mg24h: 0 }, now, table).withheld, true);
  assert.equal(d({ age: 40, weight: 70, renal: 'no', daysSoFar: 1, route: 'iv-single' }, now, table).withheld, undefined);
});
