// spec-v1631 tool 11: theophylline and aminophylline by the label, on two label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { theophyllineLabelDose as th, LABELS, LOAD, GROUPS, BANDS } from '../../lib/theophylline-label-dose-v1631.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const start = { mode: 'iv-start', product: 'aminophylline', group: 'adult', prior: 'none', weight: 70 };
const adj = { mode: 'adjust', route: 'iv', level: 12, current: 28 };

test('the label\'s constants: loading figures, Table V rates and ceilings, Table VI factors', () => {
  assert.deepEqual([LOAD.theophylline, LOAD.aminophylline, LOAD.volume, LOAD.salt], [4.6, 5.7, 0.5, 0.8]);
  for (const id of Object.values(LABELS)) assert.equal(labelRow(id, now).answers, true);
  assert.deepEqual(GROUPS.map((g) => g.q12 ?? g.rate ?? 'weeks'), [1, 1.5, 'weeks', 0.8, 0.7, 0.7, 0.5, 0.4, 0.3, 0.2]);
  assert.deepEqual(GROUPS.map((g) => g.cap ?? 0), [0, 0, 0, 0, 0, 0, 900, 900, 400, 400]);
  assert.deepEqual(BANDS.map((b) => b.factor), [1.25, null, 0.9, 0.75, 0.75, 0.5]);
});

test('the label\'s examples: 0.4 mg/kg/h is 0.5 as aminophylline; a child 0.8 is 1.0', () => {
  const adult = th(start, now);
  // 5.7 x 70 = 399 mg; 0.4 x 70 = 28 mg/h theophylline, / 0.8 = 35 mg/h (0.5 mg/kg/h).
  assert.deepEqual([adult.loadingDose, adult.ratePerKg, adult.infusionRate, adult.capped], [399, 0.4, 35, false]);
  const child = th({ ...start, group: 'child-1-9', weight: 20 }, now);
  assert.deepEqual([child.loadingDose, child.infusionRate], [114, 20]);
  assert.equal(th({ ...start, product: 'theophylline' }, now).loadingDose, 322);
  assert.match(adult.notes.join(' '), /approximately 79% theophylline/);
});

test('the daily ceilings hold the rate; the infant rate comes from age in weeks; neonates are every 12 hours', () => {
  const big = th({ ...start, weight: 110, product: 'theophylline' }, now);
  assert.deepEqual([big.capped, big.infusionRate], [true, 37.5]);
  assert.match(big.notes.join(' '), /above the label's 900 mg\/day .* 900 ÷ 24 = 37\.5 mg\/h/);
  const old = th({ ...start, group: 'elderly', weight: 70, product: 'theophylline' }, now);
  assert.deepEqual([old.capped, old.infusionRate], [true, sig4(400 / 24)]);
  const infant = th({ ...start, group: 'infant', ageWeeks: 20, weight: 6, product: 'theophylline' }, now);
  assert.deepEqual([infant.ratePerKg, infant.infusionRate], [0.37, 2.22]);
  assert.equal(th({ ...start, group: 'infant', weight: 6 }, now).valid, false);
  assert.equal(th({ ...start, group: 'infant', weight: 6, ageWeeks: 60 }, now).valid, false);
  const neo = th({ ...start, group: 'neonate-late', weight: 2 }, now);
  assert.deepEqual([neo.doseEvery12h, neo.infusionRate], [3.75, undefined]);
  assert.match(th({ ...start, group: 'impaired' }, now).notes.join(' '), /should not exceed 17 mg\/h of theophylline \(21 mg\/h as aminophylline\)/);
});
function sig4(x) { return Number(x.toPrecision(4)); }

test('a loading dose after recent theophylline needs a level: D = (desired - measured) x 0.5 L/kg', () => {
  assert.match(th({ ...start, prior: 'taken' }, now).message, /should not be given before a serum level/);
  assert.match(th({ ...start, prior: 'taken', level: 4 }, now).message, /Enter the desired level/);
  const r = th({ ...start, product: 'theophylline', prior: 'taken', level: 4, target: 10 }, now);
  assert.equal(r.loadingDose, 210);
  assert.equal(th({ ...start, prior: 'taken', level: 4, target: 10 }, now).loadingDose, 262.5);
  assert.equal(th({ ...start, prior: 'taken', level: 12, target: 10 }, now).loadingDose, 0);
  assert.match(th({ ...start, level: 4 }, now).message, /Clear the level/);
});

test('Table VI: the action and the arithmetic for each band, by route', () => {
  const row = (level, route = 'iv') => { const r = th({ ...adj, route, level }, now); return [r.row, r.adjusted]; };
  assert.deepEqual([5, 9.8, 9.9, 10, 14.9, 15, 19.9, 20, 24.9, 25, 30, 30.1].map((l) => row(l)[0]),
    ['low', 'low', 'maintain', 'maintain', 'maintain', 'consider', 'consider', 'decrease', 'decrease', 'hold', 'hold', 'overdose']);
  assert.deepEqual([row(5), row(12), row(17), row(22), row(27), row(35)], [['low', 35], ['maintain', null], ['consider', 25.2], ['decrease', 21], ['hold', 21], ['overdose', 14]]);
  assert.match(th({ ...adj, level: 9.9 }, now).notes.join(' '), /gives 9\.9 itself no row/);
  assert.match(th({ ...adj, level: 27 }, now).band, /stop the infusion first; then no more than 21 mg\/h/);
  const oral = th({ ...adj, route: 'oral', level: 27, current: 600 }, now);
  assert.match(oral.band, /skip the next dose first; then no more than 450 mg\/day/);
  assert.match(oral.notes[0], /Recheck the level after 3 days/);
  assert.equal(th({ ...adj, level: 22 }, now).abnormal, true);
  assert.equal(th(adj, now).abnormal, false);
});

test('nothing is defaulted', () => {
  assert.match(th({}, now).message, /Choose the mode/);
  assert.match(th({ ...start, product: '' }, now).message, /Choose the product/);
  assert.match(th({ ...start, group: '' }, now).message, /Table V/);
  assert.match(th({ ...start, prior: '' }, now).message, /past 24 hours/);
  assert.equal(th({ ...start, weight: '' }, now).valid, false);
  assert.match(th({ ...adj, route: '' }, now).message, /IV infusion or an oral product/);
  assert.equal(th({ ...adj, level: '' }, now).valid, false);
  assert.equal(th({ ...adj, current: '' }, now).valid, false);
});

test('fail closed: each label withholds only its own figures', () => {
  const table = { ...LABEL_EDITIONS, [LABELS.iv]: { ...LABEL_EDITIONS[LABELS.iv], supersededOn: '2026-10-10' } };
  assert.deepEqual([th(start, now, table).withheld, th(start, now, table).loadingDose], [true, undefined]);
  assert.equal(th(adj, now, table).withheld, true);
  assert.equal(th({ ...adj, route: 'oral', current: 600 }, now, table).withheld, undefined);
  assert.equal(th(adj, new Date('2028-01-01T00:00:00Z')).withheld, true);
});
