// spec-v1633 tool 17: long-acting injectable antipsychotic starting doses from four labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { laiAntipsychoticStart as d, LABELS, PRODUCTS, SUSTENNA_ROWS, TRINZA_ROWS } from '../../lib/lai-antipsychotic-start-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d(i, now);

test('the four labels answer, and the tables are the labels\'', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.deepEqual(SUSTENNA_ROWS, [[12, '234 mg'], [9, '156 mg'], [6, '117 mg'], [3, '39 to 78 mg']]);
  assert.deepEqual(TRINZA_ROWS, [[78, 273], [117, 410], [156, 546], [234, 819]]);
  assert.equal(PRODUCTS.length, 5);
});

test('Invega Sustenna: maintenance by oral dose, and the two initiation injections a week apart', () => {
  assert.deepEqual([12, 9, 6, 3].map((v) => run({ product: 'sustenna', dose: v }).maintenance), ['234 mg', '156 mg', '117 mg', '39 to 78 mg']);
  const r = run({ product: 'sustenna', dose: 9, startDate: '2026-10-12' });
  assert.match(r.notes[0], /234 mg on day 1 and 156 mg one week later, both in the deltoid muscle \(2026-10-12 and 2026-10-19\)/);
  assert.equal(run({ product: 'sustenna', dose: 8 }).flag, 'not-in-table');
  assert.match(run({ product: 'sustenna' }).message, /^Enter the oral paliperidone/);
});

test('Invega Trinza: the 3.5-fold table, nothing for 39 mg, and the 7-day window', () => {
  assert.deepEqual([78, 117, 156, 234].map((v) => run({ product: 'trinza', dose: v }).doseMg), [273, 410, 546, 819]);
  for (const [s, t] of TRINZA_ROWS) assert.ok(Math.abs(t / s - 3.5) < 0.01, `${s} to ${t}`);
  const none = run({ product: 'trinza', dose: 39 });
  assert.deepEqual([none.flag, none.doseMg], ['not-in-table', undefined]);
  assert.match(none.band, /was not studied/);
  const w = run({ product: 'trinza', dose: 156, startDate: '2026-11-01' });
  assert.deepEqual([w.windowFrom, w.windowTo], ['2026-10-25', '2026-11-08']);
  assert.match(w.notes.join(' '), /at least four months/);
});

test('Aristada: one dose at 10 mg, three choices at 15 mg, one at 20 mg or more', () => {
  assert.deepEqual(run({ product: 'aristada', dose: 10 }).options, ['441 mg every month']);
  assert.deepEqual(run({ product: 'aristada', dose: 15 }).options, ['662 mg every month', '882 mg every 6 weeks', '1064 mg every 2 months']);
  assert.deepEqual([run({ product: 'aristada', dose: 20 }).options, run({ product: 'aristada', dose: 30 }).options], [['882 mg every month'], ['882 mg every month']]);
  for (const v of [5, 12, 17]) assert.equal(run({ product: 'aristada', dose: v }).flag, 'not-in-table', String(v));
  const r = run({ product: 'aristada', dose: 15, startDate: '2026-10-12' });
  assert.match(r.notes[0], /Aristada Initio 675 mg injection and one 30 mg oral aripiprazole dose/);
  assert.match(r.notes[0], /21 consecutive days of oral aripiprazole, which runs through 2026-11-01/);
});

test('Abilify Maintena: 1-day and 14-day initiation, and the 26-day floor', () => {
  const one = run({ product: 'maintena-1-day', startDate: '2026-10-12' });
  assert.deepEqual([one.doseMg, one.nextNoSoonerThan, one.oralThrough], [400, '2026-11-07', undefined]);
  assert.match(one.band, /two 400 mg injections at two different injection sites and one 20 mg oral aripiprazole dose/);
  const two = run({ product: 'maintena-14-day', startDate: '2026-10-12' });
  assert.deepEqual([two.oralThrough, two.nextNoSoonerThan], ['2026-10-25', '2026-11-07']);
  assert.equal(run({ product: 'maintena-1-day' }).valid, true); // no dose is asked for
});

test('nothing is defaulted, and a superseded label withholds its table', () => {
  assert.match(d({}, now).message, /^Choose the product and start/);
  assert.match(run({ product: 'aristada', dose: 15, startDate: 'Monday' }).message, /YYYY-MM-DD/);
  const T = Object.fromEntries(Object.values(LABELS).map((l) => [l.setId, { label: l.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11' }]));
  T[LABELS.trinza.setId].supersededOn = '2026-10-12';
  const w = d({ product: 'trinza', dose: 156 }, now, T);
  assert.deepEqual([w.withheld, w.doseMg], [true, undefined]);
  assert.equal(d({ product: 'sustenna', dose: 9 }, now, T).maintenance, '156 mg');
});
