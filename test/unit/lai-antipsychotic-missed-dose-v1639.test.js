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

test('paliperidone is said to be missing; refusals; a withheld label', () => {
  assert.match(run({}).message, /paliperidone palmitate injections are not covered yet/);
  assert.match(run({ product: 'uzedy-risperidone-sc' }).message, /last injection/);
  assert.match(run({ product: 'uzedy-risperidone-sc', lastInjection: '2026-01-01' }).message, /today's date/);
  assert.match(run({ product: 'uzedy-risperidone-sc', lastInjection: '2026-03-01', today: '2026-01-01' }).message, /not before the last injection/);
  assert.match(run({ product: 'uzedy-risperidone-sc', lastInjection: '2026-01-01', today: '2026-03-01' }).note, /Invega Sustenna, Erzofri, Invega Trinza, Invega Hafyera/);
  const p = PRODUCTS[0];
  const w = run({ product: p.value, lastInjection: '2026-01-01', today: '2026-03-01' }, { ...T, [p.setId]: row('Aristada', { supersededOn: '2026-11-01' }) });
  assert.deepEqual([w.withheld, w.daysSinceLast], [true, undefined]);
});
