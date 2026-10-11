// spec-v1630 tool 10: trace element and pediatric multivitamin volume by weight, on label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pnMicronutrientVolume as m, PRODUCTS } from '../../lib/pn-micronutrient-volume-v1630.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const vol = (product, weight, weightUnit = 'kg') => m({ product, weight, weightUnit }, now);

test('contents per mL are the labels\', and every row answers today', () => {
  assert.deepEqual(PRODUCTS.tralement.perMl, { zinc: 3000, copper: 300, manganese: 55, selenium: 60 });
  assert.deepEqual(PRODUCTS.multrys.perMl, { zinc: 1000, copper: 60, manganese: 3, selenium: 6 });
  for (const p of Object.values(PRODUCTS)) assert.equal(labelRow(p.setId, now).answers, true, p.name);
});

test('Tralement: the weight bands, 1 mL from 50 kg, and nothing under 10 kg', () => {
  assert.deepEqual([10, 19, 20, 29, 30, 39, 40, 49, 50, 90].map((kg) => vol('tralement', kg).volumeMl), [0.2, 0.2, 0.4, 0.4, 0.6, 0.6, 0.8, 0.8, 1, 1]);
  assert.match(vol('tralement', 9.9).message, /not approved for pediatric patients weighing less than 10 kg/);
  // The table's own figures for 20 to 29 kg: 1,200, 120, 22 and 24 mcg.
  assert.deepEqual(vol('tralement', 25).delivered, { zinc: 1200, copper: 120, selenium: 24, manganese: 22 });
  const gap = vol('tralement', 19.5);
  assert.equal(gap.volumeMl, 0.2);
  assert.match(gap.notes.join(' '), /falls between two of them and is placed in the lower one/);
});

test('Tralement: the shortfall against the label\'s daily dosage, with its caps', () => {
  const r = vol('tralement', 25);
  // 50 x 25 = 1,250; 20 x 25 = 500, capped at 300; 2 x 25 = 50.
  assert.deepEqual([r.requirement.zinc, r.requirement.copper, r.requirement.selenium], [1250, 300, 50]);
  assert.deepEqual(r.shortfall, { zinc: 50, copper: 180, selenium: 26 });
  assert.deepEqual(vol('tralement', 70).shortfall, {});
  assert.match(r.notes.join(' '), /not to supplement Tralement with additional manganese/);
});

test('Multrys: Table 1 band by band, and 0.2 mL every other day from 0.4 to 0.59 kg', () => {
  const table = [[0.6, 0.2], [0.8, 0.2], [0.9, 0.3], [1.1, 0.3], [1.2, 0.4], [1.4, 0.4], [1.5, 0.5], [1.7, 0.5], [1.8, 0.6], [2, 0.6], [2.1, 0.7], [2.3, 0.7], [2.4, 0.8], [2.6, 0.8], [2.7, 0.9], [2.9, 0.9], [3, 1], [9.9, 1]];
  for (const [kg, mL] of table) assert.equal(vol('multrys', kg).volumeMl, mL, `${kg} kg`);
  const tiny = vol('multrys', 500, 'g');
  assert.deepEqual([tiny.volumeMl, tiny.everyOtherDay, tiny.delivered.zinc], [0.2, true, 100]);
  assert.match(vol('multrys', 0.3).message, /no dosage under 0\.4 kg/);
  assert.match(vol('multrys', 10).message, /under 10 kg/);
});

test('Multrys: where the label\'s sentence and its table disagree, the table is shown and the difference named', () => {
  const at27 = vol('multrys', 2.7);
  assert.equal(at27.volumeMl, 0.9);
  assert.match(at27.notes.join(' '), /gives 0\.8 mL at this weight, not the table's 0\.9 mL/);
  assert.match(vol('multrys', 3).notes.join(' '), /gives 0\.9 mL at this weight, not the table's 1 mL/);
  // Where they agree nothing is said.
  assert.doesNotMatch(vol('multrys', 1.5).notes.join(' '), /disagree/);
  assert.doesNotMatch(vol('multrys', 5).notes.join(' '), /disagree/);
});

test('Multrys: zinc requirement by weight (400, 250, 100 mcg/kg/day)', () => {
  assert.deepEqual([vol('multrys', 2.7).requirement.zinc, vol('multrys', 3).requirement.zinc, vol('multrys', 4).requirement.zinc, vol('multrys', 8).requirement.zinc], [1080, 750, 1000, 800]);
  assert.deepEqual(vol('multrys', 2.7).shortfall, { zinc: 180 });
  assert.match(vol('multrys', 5).notes.join(' '), /zinc rows overlap/);
  // At 8 kg, 1 mL gives 60 mcg of copper against 160.
  assert.deepEqual(vol('multrys', 8).shortfall, { copper: 100, selenium: 10 });
});

test('Infuvite Pediatric: three weight bands, single-dose vials and the bulk package', () => {
  const v = (kg) => { const r = vol('infuvite-pediatric', kg); return [r.vial1Ml, r.vial2Ml, r.combinedMl]; };
  assert.deepEqual([v(0.9), v(1), v(2.99), v(3), v(20)], [[1.2, 0.3, 1.5], [2.6, 0.65, 3.25], [2.6, 0.65, 3.25], [4, 1, 5], [4, 1, 5]]);
});

test('fail closed: a withheld label shows no volume', () => {
  const id = PRODUCTS.multrys.setId;
  const superseded = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-11-01' } };
  for (const [when, table] of [[new Date('2029-01-01T00:00:00Z'), undefined], [now, superseded]]) {
    const r = m({ product: 'multrys', weight: 2, weightUnit: 'kg' }, when, table);
    assert.deepEqual([r.valid, r.withheld, r.volumeMl], [true, true, undefined]);
    assert.doesNotMatch(`${r.band} ${r.notes.join(' ')}`, /0\.6 mL/);
  }
  assert.equal(m({ product: 'tralement', weight: 25, weightUnit: 'kg' }, now, superseded).volumeMl, 0.4);
});

test('product, weight and unit are required', () => {
  assert.match(vol('', 5).message, /Choose the product/);
  assert.match(m({ product: 'multrys', weight: 5 }, now).message, /weight unit/);
  assert.match(m({ product: 'multrys', weightUnit: 'kg' }, now).message, /weight/);
  assert.equal(vol('tralement', 55.1156, 'lb').volumeMl, 0.4);
});
