// spec-v1639 tool 4: depot injection due dates and windows, label and CDC side by side.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { depotInjectionWindow as dw, PRODUCTS } from '../../lib/depot-injection-window-v1639.js';

const T = Object.fromEntries(PRODUCTS.map((p) => [p.setId, { label: p.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-12', validThrough: '2027-10-12' }]));
const NOW = new Date('2026-10-12T12:00:00Z');
const run = (o) => dw(o, NOW, T);

test('Depo-Provera: 13 weeks on the label, 15 weeks from CDC, shown apart', () => {
  const r = run({ product: 'dmpa-im-150', lastInjection: '2026-07-01' });
  assert.deepEqual([r.dueDate, r.flag], ['2026-09-30', 'dates']);
  assert.match(r.note, /through October 14, 2026/);
  // 14 weeks: past the label's 13, inside CDC's 15.
  const l = run({ product: 'dmpa-im-150', lastInjection: '2026-07-01', plannedDate: '2026-10-07' });
  assert.deepEqual([l.flag, l.abnormal], ['after-the-label-date', true]);
  assert.match(l.note, /more than 13 weeks after the last injection, so its pregnancy sentence applies/);
  assert.match(l.note, /within 15 weeks of the last injection: no additional contraceptive protection is required/);
  // Exactly 13 weeks is not "greater than 13 weeks"; exactly 15 is not "more than 15".
  assert.equal(run({ product: 'dmpa-im-150', lastInjection: '2026-07-01', plannedDate: '2026-09-30' }).flag, 'inside');
  assert.match(run({ product: 'dmpa-im-150', lastInjection: '2026-07-01', plannedDate: '2026-10-14' }).note, /within 15 weeks/);
  assert.match(run({ product: 'dmpa-im-150', lastInjection: '2026-07-01', plannedDate: '2026-10-15' }).note, /more than 15 weeks from the last injection; 7 days from it is October 22, 2026/);
});

test('depo-subQ provera 104: 12 to 14 weeks', () => {
  const r = run({ product: 'dmpa-sc-104', lastInjection: '2026-07-01', plannedDate: '2026-10-08' });
  assert.deepEqual([r.earliestDate, r.latestDate, r.flag], ['2026-09-23', '2026-10-07', 'after-the-label-date']);
  assert.equal(run({ product: 'dmpa-sc-104', lastInjection: '2026-07-01', plannedDate: '2026-10-07' }).flag, 'inside');
  assert.equal(run({ product: 'dmpa-sc-104', lastInjection: '2026-07-01', plannedDate: '2026-09-01' }).flag, 'before-the-label-date');
});

test('Vivitrol: both dates, no window', () => {
  const r = run({ product: 'naltrexone-er-380', lastInjection: '2026-01-31', plannedDate: '2026-03-05' });
  assert.deepEqual([r.dueDate, r.oneMonthDate, r.abnormal], ['2026-02-28', '2026-02-28', false]);
  assert.match(r.note, /states no window around either date and no missed-dose rule/);
  assert.equal(run({ product: 'naltrexone-er-380', lastInjection: '2026-03-10' }).oneMonthDate, '2026-04-10');
});

test('Sublocade: the 26-day line is for maintenance, not the second injection', () => {
  assert.match(run({ product: 'sublocade-monthly', lastInjection: '2026-09-01' }).message, /second or a maintenance injection/);
  const s = run({ product: 'sublocade-monthly', lastInjection: '2026-09-01', sublocadeNext: 'second-sublocade-injection', plannedDate: '2026-09-10' });
  assert.deepEqual([s.earliestDate, s.latestDate, s.flag], ['2026-09-08', '2026-10-01', 'inside']);
  const m = run({ product: 'sublocade-monthly', lastInjection: '2026-09-01', sublocadeNext: 'third-or-later-sublocade-injection', plannedDate: '2026-09-20' });
  assert.deepEqual([m.earliestDate, m.flag], ['2026-09-27', 'before-the-label-date']);
  assert.match(m.note, /7 days short of the label's 26 days/);
  assert.match(run({ product: 'sublocade-monthly', lastInjection: '2026-09-01', sublocadeNext: 'third-or-later-sublocade-injection', plannedDate: '2026-10-20' }).note, /November 15, 2026 or after/);
});

test('Brixadi: weekly 2 days either side, monthly 1 week either side of 28 days', () => {
  const w = run({ product: 'brixadi-weekly', lastInjection: '2026-10-01', plannedDate: '2026-10-11' });
  assert.deepEqual([w.dueDate, w.earliestDate, w.latestDate, w.flag], ['2026-10-08', '2026-10-06', '2026-10-10', 'after-the-label-date']);
  const m = run({ product: 'brixadi-monthly', lastInjection: '2026-10-01', plannedDate: '2026-11-05' });
  assert.deepEqual([m.dueDate, m.earliestDate, m.latestDate, m.flag], ['2026-10-29', '2026-10-22', '2026-11-05', 'inside']);
});

test('a withheld label shows no label date; CDC still answers for medroxyprogesterone', () => {
  const t = { ...T, [PRODUCTS[0].setId]: { ...T[PRODUCTS[0].setId], supersededOn: '2026-11-01' } };
  const r = dw({ product: 'dmpa-im-150', lastInjection: '2026-07-01' }, NOW, t);
  assert.deepEqual([r.withheld, r.dueDate], [true, undefined]);
  assert.match(r.note, /Depo-Provera CI label lines are withheld/);
  assert.match(r.note, /CDC 2024/);
});

test('refusals', () => {
  assert.equal(run({}).message, 'Choose the product.');
  assert.match(run({ product: 'brixadi-weekly' }).message, /last injection/);
  assert.match(run({ product: 'brixadi-weekly', lastInjection: '2026-10-01', plannedDate: '2026-10-01' }).message, /after the last injection/);
});
