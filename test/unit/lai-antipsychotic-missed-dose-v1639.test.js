// spec-v1639 tool 5 (the week-based products): the label's missed-dose row.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { laiAntipsychoticMissedDose as lm, PRODUCTS } from '../../lib/lai-antipsychotic-missed-dose-v1639.js';

const row = (label, extra = {}) => ({ label, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-12', validThrough: '2027-10-12', ...extra });
const T = Object.fromEntries(PRODUCTS.map((p) => [p.setId, row(p.brand)]));
const NOW = new Date('2026-10-12T12:00:00Z');
const run = (o, t = T) => lm(o, NOW, t);
const f = (product, days) => { const d = new Date(Date.UTC(2026, 0, 1) + days * 86400000).toISOString().slice(0, 10); return run({ product, lastInjection: '2026-01-01', today: d }).flag; };

test('Aristada Table 3: the four last-dose rows', () => {
  assert.deepEqual(PRODUCTS.filter((p) => p.kind === 'aristada').map((p) => [p.w1, p.w2]), [[6, 7], [8, 12], [8, 12], [10, 12]]);
  assert.deepEqual([42, 43, 49, 50].map((d) => f('aristada-last-dose-441', d)), ['no-supplementation', 'supplement', 'supplement', 're-initiate']);
  assert.deepEqual([56, 57, 84, 85].map((d) => f('aristada-last-dose-662', d)), ['no-supplementation', 'supplement', 'supplement', 're-initiate']);
  assert.deepEqual([70, 71, 84, 85].map((d) => f('aristada-last-dose-1064', d)), ['no-supplementation', 'supplement', 'supplement', 're-initiate']);
  const r = run({ product: 'aristada-last-dose-882', lastInjection: '2026-01-01', today: '2026-01-10' });
  assert.match(r.note, /should not be given earlier than 14 days after the previous injection", which is January 15, 2026/);
  assert.match(r.note, /The row changes after February 26, 2026 \(8 weeks\)/);
});

test('Maintena and Asimtufii: open bands, and the exact boundary the label leaves undefined', () => {
  assert.deepEqual([28, 29, 34, 35, 36].map((d) => f('maintena-second-or-third-dose', d)), ['not-past-the-first-band', 'as-soon-as-possible', 'as-soon-as-possible', 'label-leaves-this-open', 'restart']);
  assert.deepEqual([35, 41, 42, 43].map((d) => f('maintena-fourth-or-later-dose', d)), ['as-soon-as-possible', 'as-soon-as-possible', 'label-leaves-this-open', 'restart']);
  assert.deepEqual([56, 57, 97, 98, 99].map((d) => f('asimtufii-two-month', d)), ['not-past-the-first-band', 'as-soon-as-possible', 'as-soon-as-possible', 'label-leaves-this-open', 'restart']);
  assert.match(run({ product: 'asimtufii-two-month', lastInjection: '2026-01-01', today: '2026-04-09' }).note, /Both rows are shown; the label does not define the edge/);
});

test('risperidone: a sentence, or no rule at all', () => {
  assert.equal(f('uzedy-risperidone-sc', 60), 'as-soon-as-possible');
  assert.match(run({ product: 'perseris-risperidone-sc', lastInjection: '2026-01-01', today: '2026-03-01' }).note, /no time bands/);
  const c = run({ product: 'risperdal-consta-im', lastInjection: '2026-01-01', today: '2026-03-01' });
  assert.deepEqual([c.flag, c.band], ['label-states-no-rule', 'The label states no missed-dose rule.']);
  assert.match(run({ product: 'rykindo-risperidone-im', lastInjection: '2026-01-01', today: '2026-03-01' }).note, /no data to specifically address reinitiation/);
});

test('Invega Sustenna and Erzofri: weeks, then a 6-month edge counted in calendar months', () => {
  assert.deepEqual([11, 12, 27, 28, 49, 50].map((d) => f('sustenna-second-initiation', d)), ['not-past-the-first-band', 'as-soon-as-possible', 'as-soon-as-possible', 'two-injections-one-week-apart', 'two-injections-one-week-apart', 'restart']);
  // Day 42 belongs to "4 to 6 weeks"; day 43 to the next row.
  assert.deepEqual([27, 28, 42, 43].map((d) => f('sustenna-maintenance-39-to-156', d)), ['not-past-the-first-band', 'as-soon-as-possible', 'as-soon-as-possible', 'two-injections-one-week-apart']);
  const at = (product, today) => run({ product, lastInjection: '2026-01-01', today });
  assert.equal(at('sustenna-maintenance-234', '2026-06-27').flag, 'two-injections-one-week-apart');
  assert.match(at('sustenna-maintenance-234', '2026-06-27').note, /first 2 injections should each be 156 mg/);
  // July 1 is exactly 6 calendar months: within 3 days either side, both rows.
  for (const d of ['2026-06-28', '2026-07-01', '2026-07-04']) assert.equal(at('sustenna-maintenance-39-to-156', d).flag, 'label-leaves-this-open', d);
  assert.equal(at('sustenna-maintenance-39-to-156', '2026-07-05').flag, 'restart');
  assert.match(at('erzofri-stabilized-234', '2026-08-01').note, /351 mg deltoid injection on Day 1/);
  assert.match(at('sustenna-maintenance-234', '2026-08-01').note, /234 mg deltoid injection on Day 1 and a 156 mg/);
});

test('Invega Trinza and Hafyera: month bands, with both rows near each edge', () => {
  const at = (product, today) => run({ product, lastInjection: '2026-01-01', today });
  // Trinza edges: April 16 (3 1/2 months), May 1 (4 months), October 1 (9 months).
  assert.equal(at('trinza-last-410', '2026-04-10').flag, 'not-past-the-first-band');
  assert.equal(at('trinza-last-410', '2026-04-16').flag, 'label-leaves-this-open');
  assert.equal(at('trinza-last-410', '2026-04-23').flag, 'as-soon-as-possible');
  const re = at('trinza-last-410', '2026-07-01');
  assert.equal(re.flag, 're-initiate-with-monthly-product');
  assert.match(re.note, /Invega Sustenna 117 mg on Day 1 and 117 mg on Day 8 \(deltoid\), then Invega Trinza 410 mg/);
  assert.match(at('trinza-last-819', '2026-07-01').note, /Invega Sustenna 156 mg on Day 1 and 156 mg on Day 8/);
  assert.match(at('trinza-last-273', '2026-07-01').note, /78 mg on Day 1 and 78 mg on Day 8/);
  assert.equal(at('trinza-last-410', '2026-10-10').flag, 'restart');
  // Hafyera edges: July 22 (6 months and 3 weeks), September 1 (8 months), December 1 (11 months).
  assert.equal(at('hafyera-last-1092', '2026-07-15').flag, 'not-past-the-first-band');
  assert.match(at('hafyera-last-1092', '2026-08-10').note, /product 156 mg on Day 1 \(deltoid\), then Invega Hafyera 1,092 mg 1 month after Day 1/);
  assert.match(at('hafyera-last-1560', '2026-08-10').note, /product 234 mg on Day 1/);
  assert.match(at('hafyera-last-1560', '2026-10-01').note, /156 mg on Day 1 and 156 mg on Day 8/);
  assert.equal(at('hafyera-last-1560', '2026-09-02').flag, 'label-leaves-this-open');
  assert.equal(at('hafyera-last-1560', '2026-12-10').flag, 'restart');
  assert.match(at('hafyera-last-1560', '2026-12-10').note, /labels do not define a month/);
});

test('refusals; a withheld label', () => {
  assert.match(run({}).message, /^Choose the product/);
  assert.match(run({ product: 'uzedy-risperidone-sc' }).message, /last injection/);
  assert.match(run({ product: 'uzedy-risperidone-sc', lastInjection: '2026-01-01' }).message, /today's date/);
  assert.match(run({ product: 'uzedy-risperidone-sc', lastInjection: '2026-03-01', today: '2026-01-01' }).message, /not before the last injection/);
  const p = PRODUCTS.find((x) => x.kind === 'aristada');
  const w = run({ product: p.value, lastInjection: '2026-01-01', today: '2026-03-01' }, { ...T, [p.setId]: row('Aristada', { supersededOn: '2026-11-01' }) });
  assert.deepEqual([w.withheld, w.daysSinceLast], [true, undefined]);
});
