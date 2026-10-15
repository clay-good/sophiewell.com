// spec-v1639 tool 6: the label's missed-dose rule, evaluated on the times entered.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { missedDoseLabelRule as md, PRODUCTS } from '../../lib/missed-dose-label-rule-v1639.js';

const row = (label, extra = {}) => ({ label, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-12', validThrough: '2027-10-12', ...extra });
const T = Object.fromEntries(PRODUCTS.map((p) => [p.setId, row(p.brand)]));
const NOW = new Date('2026-10-12T12:00:00Z');
const run = (o, t = T) => md(o, NOW, t);
const v = (o) => run(o).verdict;

test('twenty-three rows on sixteen labels', () => {
  assert.equal(PRODUCTS.length, 23); // 20, then the three pediatric Xarelto rows (2026-10-14)
  assert.equal(new Set(PRODUCTS.map((p) => p.setId)).size, 16);
});

test('anticoagulants: same day, and dabigatran\'s 6 hours before the next dose', () => {
  assert.equal(v({ product: 'apixaban-bid', dueAt: '2026-10-12T08:00', nowAt: '2026-10-12T15:00' }), 'take');
  assert.equal(v({ product: 'apixaban-bid', dueAt: '2026-10-12T20:00', nowAt: '2026-10-13T06:00' }), 'same-day-has-passed');
  assert.equal(v({ product: 'edoxaban-qd', dueAt: '2026-10-12T08:00', nowAt: '2026-10-12T23:00' }), 'take');
  const d = { product: 'dabigatran-capsules', dueAt: '2026-10-12T08:00', nextDoseAt: '2026-10-12T20:00' };
  assert.equal(v({ ...d, nowAt: '2026-10-12T14:00' }), 'take');
  assert.equal(v({ ...d, nowAt: '2026-10-12T14:01' }), 'skip');
  assert.match(run({ product: 'dabigatran-capsules', dueAt: '2026-10-12T08:00', nowAt: '2026-10-12T10:00' }).message, /next scheduled dose/);
  assert.equal(v({ product: 'rivaroxaban-2-5-bid', dueAt: '2026-10-12T08:00', nowAt: '2026-10-12T10:00' }), 'next-scheduled-dose');
  assert.match(run({ product: 'rivaroxaban-15-bid', dueAt: '2026-10-12T08:00', nowAt: '2026-10-12T10:00' }).note, /Two 15 mg tablets may be taken at once/);
});

test('weekly injections count from the missed dose: Ozempic 5 days, tirzepatide 4', () => {
  const o = { product: 'semaglutide-weekly-ozempic', dueAt: '2026-10-05T08:00' };
  assert.equal(v({ ...o, nowAt: '2026-10-10T08:00' }), 'take');
  assert.equal(v({ ...o, nowAt: '2026-10-10T08:01' }), 'skip');
  assert.match(run({ ...o, nowAt: '2026-10-10T08:01' }).note, /regular weekly day is 2026-10-12/);
  assert.equal(v({ product: 'tirzepatide-mounjaro', dueAt: '2026-10-05T08:00', nowAt: '2026-10-09T08:00' }), 'take');
  assert.equal(v({ product: 'tirzepatide-zepbound', dueAt: '2026-10-05T08:00', nowAt: '2026-10-09T09:00' }), 'skip');
});

test('Trulicity and Wegovy count toward the next dose; Wegovy leaves exactly 2 days open', () => {
  // The spec's example: 72 hours before Friday 8:00 is Tuesday 8:00; on Wednesday the label says skip.
  const t = { product: 'dulaglutide-weekly', dueAt: '2026-10-02T08:00', nextDoseAt: '2026-10-09T08:00' };
  assert.equal(v({ ...t, nowAt: '2026-10-06T08:00' }), 'take');
  assert.equal(v({ ...t, nowAt: '2026-10-07T08:00' }), 'skip');
  const w = { product: 'semaglutide-weekly-weight-management', dueAt: '2026-10-02T08:00', nextDoseAt: '2026-10-09T08:00' };
  assert.equal(v({ ...w, nowAt: '2026-10-07T07:59' }), 'take');
  assert.equal(v({ ...w, nowAt: '2026-10-07T08:01' }), 'skip');
  const e = run({ ...w, nowAt: '2026-10-07T08:00' });
  assert.deepEqual([e.verdict, e.abnormal], ['label-leaves-this-open', true]);
  assert.match(run({ product: 'semaglutide-weekly-weight-management', dueAt: '2026-10-02T08:00', nextDoseAt: '2026-10-16T08:00', nowAt: '2026-10-10T08:00' }).note, /reinitiate dosage escalation at a lower dosage/);
});

test('tablets, liraglutide and the bisphosphonates', () => {
  assert.equal(v({ product: 'semaglutide-tablets', dueAt: '2026-10-12T07:00', nowAt: '2026-10-12T12:00' }), 'skip');
  const l = { product: 'liraglutide-diabetes', dueAt: '2026-10-12T08:00', nowAt: '2026-10-12T20:00' };
  assert.equal(v({ ...l, lastDoseAt: '2026-10-11T08:00' }), 'next-scheduled-dose');
  assert.equal(v({ ...l, lastDoseAt: '2026-10-09T08:00' }), 'reinitiate');
  assert.match(run({ product: 'liraglutide-weight-management', dueAt: '2026-10-12T08:00', nowAt: '2026-10-12T20:00' }).message, /last dose was taken/);
  const a = run({ product: 'alendronate-weekly', dueAt: '2026-10-10', nowAt: '2026-10-12' });
  assert.equal(a.verdict, 'take-next-morning');
  assert.match(a.band, /2026-10-13 if remembered today/);
  const m = { product: 'risedronate-150-monthly', dueAt: '2026-10-01', nowAt: '2026-10-12' };
  assert.equal(v({ ...m, nextDoseAt: '2026-11-01' }), 'take-next-morning');
  assert.equal(v({ ...m, nextDoseAt: '2026-10-19' }), 'wait');
  assert.equal(v({ product: 'ibandronate-150-monthly', dueAt: '2026-10-01', nowAt: '2026-10-12', nextDoseAt: '2026-10-20' }), 'take-next-morning');
  const two = run({ product: 'risedronate-75-two-days-monthly', dueAt: '2026-10-01', nowAt: '2026-10-12', nextDoseAt: '2026-11-01', tabletsMissed: 'both-of-two' });
  assert.match(two.band, /2026-10-13 if remembered today\) and the other the next morning \(2026-10-14\)/);
  assert.match(run({ product: 'risedronate-75-two-days-monthly', dueAt: '2026-10-01', nowAt: '2026-10-12', nextDoseAt: '2026-11-01' }).message, /one or both/);
});

test('refusals and a withheld label', () => {
  assert.match(run({}).message, /^Choose the product/);
  assert.match(run({ product: 'apixaban-bid' }).message, /missed dose was due/);
  assert.match(run({ product: 'apixaban-bid', dueAt: '2026-10-12T08:00', nowAt: '2026-10-11T08:00' }).message, /after the time the dose was due/);
  const p = PRODUCTS.find((x) => x.value === 'apixaban-bid');
  const w = run({ product: 'apixaban-bid', dueAt: '2026-10-12T08:00', nowAt: '2026-10-12T15:00' }, { ...T, [p.setId]: row('Eliquis', { supersededOn: '2026-11-01' }) });
  assert.deepEqual([w.withheld, w.verdict], [true, undefined]);
});

// spec-v1639 tool 6: changing the weekly day, from section 2 of four labels (re-read October 14, 2026).
test('change of day: at least 3 days for tirzepatide and dulaglutide; Ozempic leaves exactly 48 hours open', () => {
  const now = new Date('2026-10-14T12:00:00Z');
  const c = (product, lastDoseAt, changeTo) => md({ product, lastDoseAt, changeTo }, now);
  assert.equal(c('tirzepatide-mounjaro', '2026-10-12T08:00', '2026-10-15T08:00').verdict, 'change-allowed');
  assert.equal(c('tirzepatide-zepbound', '2026-10-12T08:00', '2026-10-15T07:59').verdict, 'too-soon');
  assert.equal(c('dulaglutide-weekly', '2026-10-12', '2026-10-15').verdict, 'change-allowed');
  assert.equal(c('semaglutide-weekly-ozempic', '2026-10-12T08:00', '2026-10-14T08:00').verdict, 'label-leaves-this-open');
  assert.equal(c('semaglutide-weekly-ozempic', '2026-10-12T08:00', '2026-10-14T08:01').verdict, 'change-allowed');
  assert.match(c('semaglutide-weekly-ozempic', '2026-10-12T08:00', '2026-10-14T08:01').notes.join(' '), /section 2\.1: "The day of weekly administration can be changed/);
  assert.match(c('semaglutide-weekly-weight-management', '2026-10-12', '2026-10-16').message, /^The Wegovy label's section 2 states no rule for changing the dosing day/);
  assert.match(md({ product: 'tirzepatide-mounjaro', changeTo: '2026-10-16' }, now).message, /^Enter when the last dose was taken/);
});

// Xarelto section 2.5, pediatric patients (version 65, re-read October 14, 2026).
test('rivaroxaban, pediatric: once a day same day or skip; twice a day by morning or evening; three times a day skip', () => {
  const now = new Date('2026-10-14T12:00:00Z');
  const r = (product, extra) => md({ product, dueAt: '2026-10-14T08:00', nowAt: '2026-10-14T20:00', ...extra }, now);
  assert.equal(r('rivaroxaban-peds-qd').verdict, 'take');
  assert.equal(r('rivaroxaban-peds-qd', { nowAt: '2026-10-15T07:00' }).verdict, 'skip');
  assert.match(r('rivaroxaban-peds-bid').message, /^Choose whether the morning or the evening dose was missed/);
  assert.match(r('rivaroxaban-peds-bid', { doseSlot: 'morning' }).band, /may be taken together with the evening dose/);
  assert.equal(r('rivaroxaban-peds-bid', { doseSlot: 'evening', dueAt: '2026-10-14T19:00', nowAt: '2026-10-14T22:00' }).verdict, 'take');
  assert.equal(r('rivaroxaban-peds-bid', { doseSlot: 'evening', dueAt: '2026-10-14T19:00', nowAt: '2026-10-15T06:00' }).verdict, 'skip');
  assert.equal(r('rivaroxaban-peds-tid').verdict, 'skip');
});
