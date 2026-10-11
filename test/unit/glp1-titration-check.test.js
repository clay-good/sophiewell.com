// spec-v1632 tool 9: GLP-1 dose escalation against eight label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glp1TitrationCheck as d, PRODUCTS } from '../../lib/glp1-titration-check-v1632.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d({ asOf: '2026-10-11', ...i }, now);
const ago = (n) => new Date(Date.UTC(2026, 9, 11 - n)).toISOString().slice(0, 10);
const steps = (v) => PRODUCTS.find((p) => p.value === v).steps.map(([x]) => x);

test('the eight labels answer, and each schedule is the label\'s', () => {
  for (const p of PRODUCTS) assert.equal(labelRow(p.setId, now).answers, true, p.text);
  assert.equal(new Set(PRODUCTS.map((p) => p.setId)).size, 8);
  assert.deepEqual(steps('ozempic'), [0.25, 0.5, 1, 2]);
  assert.deepEqual(steps('ozempic-ckd'), [0.25, 0.5, 1]);
  assert.deepEqual(steps('wegovy-cv'), [0.25, 0.5, 1, 1.7, 2.4]);
  assert.deepEqual(steps('wegovy-weight-adult'), [0.25, 0.5, 1, 1.7, 2.4, 7.2]);
  assert.deepEqual(steps('wegovy-tablets'), [1.5, 4, 9, 25]);
  assert.deepEqual(steps('rybelsus'), [3, 7, 14]);
  assert.deepEqual(steps('ozempic-tablets'), [1.5, 4, 9]);
  assert.deepEqual(steps('mounjaro'), [2.5, 5, 7.5, 10, 12.5, 15]);
  assert.deepEqual(steps('mounjaro-pediatric'), [2.5, 5, 7.5, 10]);
  assert.deepEqual(steps('zepbound-osa'), [2.5, 5, 7.5, 10, 12.5, 15]);
  assert.deepEqual(steps('victoza'), [0.6, 1.2, 1.8]);
  assert.deepEqual(steps('saxenda'), [0.6, 1.2, 1.8, 2.4, 3]);
  assert.deepEqual(steps('trulicity'), [0.75, 1.5, 3, 4.5]);
  assert.deepEqual(steps('trulicity-pediatric'), [0.75, 1.5]);
});

test('weekly products step after 4 weeks: day 27 is not yet, day 28 is permitted', () => {
  const early = run({ product: 'ozempic', currentDose: 0.25, startDate: ago(27) });
  assert.deepEqual([early.flag, early.nextDose, early.earliestDate, early.daysUntil], ['not-yet', 0.5, ago(-1), 1]);
  const due = run({ product: 'ozempic', currentDose: 0.25, startDate: ago(28) });
  assert.deepEqual([due.flag, due.nextDose, due.earliestDate, due.daysUntil], ['next-step-permitted', 0.5, '2026-10-11', 0]);
  assert.match(due.band, /The Ozempic label permits 0\.5 mg once weekly from 2026-10-11/);
  assert.equal(run({ product: 'mounjaro', currentDose: 12.5, startDate: ago(30) }).nextDose, 15);
  assert.equal(run({ product: 'trulicity', currentDose: 1.5, startDate: ago(30) }).nextDose, 3);
});

test('Wegovy 7.2 mg is listed for adult weight reduction only, after 4 weeks at 2.4 mg', () => {
  assert.equal(run({ product: 'wegovy-weight-adult', currentDose: 2.4, startDate: ago(27) }).flag, 'not-yet');
  const r = run({ product: 'wegovy-weight-adult', currentDose: 2.4, startDate: ago(28) });
  assert.deepEqual([r.flag, r.nextDose], ['next-step-permitted', 7.2]);
  const cv = run({ product: 'wegovy-cv', currentDose: 7.2, startDate: ago(10) });
  assert.deepEqual([cv.onLabel, cv.flag], [false, 'above-label-maximum']);
  assert.match(cv.notes.join(' '), /same label lists 7\.2 mg for: Wegovy injection: weight reduction, adults/);
  assert.equal(run({ product: 'wegovy-cv', currentDose: 2.4, startDate: ago(40) }).flag, 'top-of-schedule');
  const odd = run({ product: 'wegovy-mash', currentDose: 2, startDate: ago(10) });
  assert.deepEqual([odd.onLabel, odd.flag, odd.abnormal], [false, 'not-on-label', true]);
  assert.match(odd.notes[0], /does not call it wrong/);
});

test('tablets step after 30 days; Rybelsus and Ozempic tablets keep their own steps', () => {
  assert.equal(run({ product: 'wegovy-tablets', currentDose: 1.5, startDate: ago(29) }).flag, 'not-yet');
  assert.deepEqual([run({ product: 'wegovy-tablets', currentDose: 9, startDate: ago(30) }).nextDose], [25]);
  const r = run({ product: 'rybelsus', currentDose: 4, startDate: ago(5) });
  assert.equal(r.flag, 'not-on-label');
  assert.match(r.notes.join(' '), /same label lists 4 mg for: Ozempic tablets/);
  assert.match(run({ product: 'rybelsus', currentDose: 7, startDate: ago(30) }).notes.join(' '), /not substitutable/);
});

test('daily liraglutide steps weekly; the pediatric tirzepatide maximum is 10 mg', () => {
  assert.equal(run({ product: 'victoza', currentDose: 0.6, startDate: ago(6) }).flag, 'not-yet');
  assert.equal(run({ product: 'victoza', currentDose: 0.6, startDate: ago(7) }).nextDose, 1.2);
  assert.equal(run({ product: 'saxenda', currentDose: 2.4, startDate: ago(7) }).nextDose, 3);
  assert.match(run({ product: 'saxenda', currentDose: 3, startDate: ago(7) }).notes.join(' '), /16 weeks/);
  const ped = run({ product: 'mounjaro-pediatric', currentDose: 15, startDate: ago(7) });
  assert.equal(ped.flag, 'above-label-maximum');
  assert.match(ped.band, /above 10 mg/);
});

test('a blank as-of date uses today and says so; nothing is defaulted otherwise', () => {
  const r = d({ product: 'ozempic', currentDose: 1, startDate: '2026-10-01' }, now);
  assert.equal(r.daysAtDose, 10);
  assert.match(r.notes.join(' '), /checked as of 2026-10-11 \(today\)/);
  assert.match(d({}, now).message, /^Choose the product/);
  assert.match(run({ product: 'ozempic', startDate: ago(3) }).message, /^Enter the current dose/);
  assert.match(run({ product: 'ozempic', currentDose: 1 }).message, /^Enter the date the current dose began/);
  assert.match(run({ product: 'ozempic', currentDose: 1, startDate: '2026-13-40' }).message, /^Enter the date/);
  assert.match(run({ product: 'ozempic', currentDose: 1, startDate: ago(-2) }).message, /Check the two dates/);
  assert.match(run({ product: 'ozempic', currentDose: 1, startDate: ago(3), asOf: 'soon' }).message, /^Enter today/);
});

test('a superseded or expired label row withholds the schedule', () => {
  const p = PRODUCTS[0];
  const T = { [p.setId]: { label: 'Ozempic', splVersion: 20, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11', supersededOn: '2026-10-12' } };
  const r = d({ product: 'ozempic', currentDose: 0.5, startDate: '2026-10-01' }, new Date('2026-10-20T00:00:00Z'), T);
  assert.equal(r.withheld, true);
  assert.equal(r.nextDose, undefined);
  assert.doesNotMatch(r.band, /permits/);
});
