// spec-v1631 tool 10: digoxin loading and maintenance by the label's method, on a label row.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { digoxinLabelDose as dg, TABLE, WEIGHTS, LABEL } from '../../lib/digoxin-label-dose-v1631.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const adult = { ageGroup: 'over-10', leanWeight: 70, weightUnit: 'kg', loadMcgPerKg: 10, creatinineClearance: 55 };

test('the maintenance table is the label\'s Table 3, cell for cell', () => {
  assert.deepEqual(WEIGHTS, [40, 50, 60, 70, 80, 90, 100]);
  assert.deepEqual(TABLE, {
    10: [62.5, 125, 125, 187.5, 187.5, 187.5, 250, 19],
    20: [125, 125, 125, 187.5, 187.5, 250, 250, 16],
    30: [125, 125, 187.5, 187.5, 250, 250, 312.5, 14],
    40: [125, 187.5, 187.5, 250, 250, 312.5, 312.5, 13],
    50: [125, 187.5, 187.5, 250, 250, 312.5, 312.5, 12],
    60: [125, 187.5, 250, 250, 312.5, 312.5, 375, 11],
    70: [187.5, 187.5, 250, 250, 312.5, 375, 375, 10],
    80: [187.5, 187.5, 250, 312.5, 312.5, 375, 437.5, 9],
    90: [187.5, 250, 250, 312.5, 375, 437.5, 437.5, 8],
    100: [187.5, 250, 312.5, 312.5, 375, 437.5, 500, 7],
  });
  // Every dose is a whole number of 62.5 mcg steps, and the days fall as clearance rises.
  for (const cells of Object.values(TABLE)) for (const c of cells.slice(0, 7)) assert.equal((c / 62.5) % 1, 0);
  assert.equal(labelRow(LABEL.setId, now).answers, true);
});

test('loading: mcg/kg of lean weight, half first, then a quarter twice', () => {
  const r = dg(adult, now);
  assert.deepEqual([r.loadingMcg, r.loadingAgainst, r.abnormal], [700, 'within', false]);
  assert.match(r.notes.join(' '), /half \(350 mcg\) first, then a quarter \(175 mcg\) every 6 to 8 hours twice/);
  assert.deepEqual([dg({ ...adult, loadMcgPerKg: 9 }, now).loadingAgainst, dg({ ...adult, loadMcgPerKg: 15 }, now).loadingAgainst, dg({ ...adult, loadMcgPerKg: 16 }, now).loadingAgainst], ['below', 'within', 'above']);
  const child = dg({ ageGroup: '5-10', leanWeight: 25, weightUnit: 'kg', loadMcgPerKg: 30 }, now);
  assert.deepEqual([child.loadingMcg, child.loadingAgainst, child.labelLoadingRange, child.maintenanceByTableMcg], [750, 'within', [20, 45], undefined]);
  assert.match(dg({ ageGroup: '5-10', leanWeight: 25, weightUnit: 'kg', loadMcgPerKg: 30, creatinineClearance: 80 }, now).message, /loading range only/);
});

test('maintenance by the formula: daily loss is 14 + clearance / 5', () => {
  const r = dg(adult, now);
  assert.deepEqual([r.percentDailyLoss, r.maintenanceByFormulaMcg], [25, 175]);
  assert.equal(dg({ ...adult, creatinineClearance: 0 }, now).percentDailyLoss, 14);
  assert.equal(dg({ ...adult, creatinineClearance: '' }, now).maintenanceByFormulaMcg, undefined);
});

test('maintenance by the table: the cell at or below the values entered, named in the result', () => {
  const r = dg(adult, now);
  assert.deepEqual([r.maintenanceByTableMcg, r.tableRow, r.tableColumn, r.daysToSteadyState], [250, 50, 70, 12]);
  assert.match(r.notes.join(' '), /read at 50 mL\/min and 70 kg.*that choice is this tool's/);
  const edge = dg({ ...adult, leanWeight: 69.9, creatinineClearance: 59.9 }, now);
  assert.deepEqual([edge.tableRow, edge.tableColumn, edge.maintenanceByTableMcg], [50, 60, 187.5]);
  const big = dg({ ...adult, leanWeight: 120, creatinineClearance: 140 }, now);
  assert.deepEqual([big.tableRow, big.tableColumn, big.maintenanceByTableMcg, big.daysToSteadyState], [100, 100, 500, 7]);
  const starred = dg({ ...adult, leanWeight: 45, creatinineClearance: 12 }, now);
  assert.equal(starred.maintenanceByTableMcg, 62.5);
  assert.match(starred.notes.join(' '), /stars this cell as about 30 percent below/);
  const off = dg({ ...adult, leanWeight: 35, creatinineClearance: 5 }, now);
  assert.equal(off.maintenanceByTableMcg, undefined);
  assert.match(off.notes.join(' '), /has no cell/);
});

test('pounds convert, and the tool does not interpret levels', () => {
  assert.equal(dg({ ...adult, leanWeight: 154.324, weightUnit: 'lb' }, now).loadingMcg, 700);
  const r = dg(adult, now);
  assert.doesNotMatch(`${r.band} ${r.notes.join(' ')}`, /ng\/mL/);
});

test('fail closed: a withheld label keeps the product of the two numbers entered and nothing from the label', () => {
  const superseded = { ...LABEL_EDITIONS, [LABEL.setId]: { ...LABEL_EDITIONS[LABEL.setId], supersededOn: '2026-11-01' } };
  for (const [when, table] of [[new Date('2029-01-01T00:00:00Z'), undefined], [now, superseded]]) {
    const r = dg(adult, when, table);
    assert.deepEqual([r.valid, r.withheld, r.loadingMcg, r.maintenanceByTableMcg, r.loadingAgainst], [true, true, 700, undefined, undefined]);
    assert.doesNotMatch(r.notes.join(' '), /10 to 15|quarter|250 mcg/);
  }
});

test('required choices', () => {
  for (const k of ['ageGroup', 'leanWeight', 'weightUnit', 'loadMcgPerKg']) {
    const r = dg({ ...adult, [k]: '' }, now);
    assert.equal(r.valid, false, k);
    assert.ok(r.message.length <= 280, k);
  }
});
