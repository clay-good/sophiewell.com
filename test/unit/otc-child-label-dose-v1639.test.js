// spec-v1639 tool 10: the child's row on the Drug Facts chart.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { otcChildLabelDose as cd, PRODUCTS, M013 } from '../../lib/otc-child-label-dose-v1639.js';

const row = (label, extra = {}) => ({ label, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-12', validThrough: '2027-10-12', ...extra });
const T = Object.fromEntries(PRODUCTS.map((p) => [p.setId, row(p.brand)]));
const NOW = new Date('2026-10-12T12:00:00Z');
const run = (o, t = T) => cd(o, NOW, t);
const P = (v) => PRODUCTS.find((p) => p.value === v);

test('the charts as printed', () => {
  assert.deepEqual(P('kids-tylenol-160mg-in-5ml').rows.map((r) => r.out || r.stop), ['ask a doctor', '5 mL', '7.5 mL', '10 mL', '12.5 mL', '15 mL']);
  assert.deepEqual(P('kids-tylenol-160mg-in-5ml').rows.map((r) => r.mg), [undefined, 160, 240, 320, 400, 480]);
  assert.deepEqual(P('infant-tylenol-160mg-in-5ml').rows.map((r) => r.out || r.stop), ['ask a doctor', '5 mL']);
  assert.deepEqual(P('kids-motrin-chewable-100mg').rows.map((r) => r.out || r.stop), ['ask a doctor', '1 tablet', '1½ tablets', '2 tablets', '2½ tablets', '3 tablets']);
  assert.deepEqual(P('kids-motrin-100mg-in-5ml').rows.map((r) => r.mg), [undefined, 100, 150, 200, 250, 300]);
  assert.deepEqual(P('infant-motrin-50mg-in-1-25ml').rows.map((r) => [r.out || r.stop, r.mg]), [['ask a doctor', undefined], ['1.25 mL', 50], ['1.875 mL', 75]]);
  assert.deepEqual(P('pyrantel-chewable').rows.map((r) => r.mg), [undefined, 125, 250, 375, 500, 625, 750, 875, 1000]);
  assert.deepEqual(M013.map((m) => m[2]), ['160 to 162.5 mg', '240 to 243.8 mg', '320 to 325 mg', '320 to 406.3 mg', '320 to 487.5 mg']);
});

test('weight and age on the same row', () => {
  const r = run({ product: 'kids-tylenol-160mg-in-5ml', weight: 40, weightUnit: 'lb', ageYears: 4 });
  assert.deepEqual([r.flag, r.band, r.abnormal], ['chart-row', '7.5 mL (240 mg).', false]);
  assert.match(r.note, /4 to under 6 years, 240 to 243.8 mg/);
  assert.match(r.note, /do not give more than 5 times in 24 hours/);
  assert.equal(run({ product: 'kids-motrin-100mg-in-5ml', weight: 20, weightUnit: 'kg' }).band, '7.5 mL (150 mg).');
});

test('weight and age on different rows: both shown, none chosen', () => {
  const r = run({ product: 'kids-tylenol-160mg-in-5ml', weight: 50, weightUnit: 'lb', ageYears: 4 });
  assert.deepEqual([r.flag, r.abnormal], ['weight-and-age-rows-differ', true]);
  assert.equal(r.band, 'By weight: 10 mL (320 mg). By age: 7.5 mL (240 mg).');
  assert.match(r.note, /If possible, use weight to dose; otherwise, use age\./);
  const y = run({ product: 'kids-tylenol-160mg-in-5ml', weight: 26, weightUnit: 'lb', ageYears: 1, ageMonths: 8 });
  assert.equal(y.band, 'By weight: 5 mL (160 mg). By age: "ask a doctor".');
});

test('"ask a doctor" and "do not use" are the answer', () => {
  const r = run({ product: 'kids-tylenol-160mg-in-5ml', weight: 20, weightUnit: 'lb' });
  assert.deepEqual([r.flag, r.band], ['label-says-stop', 'The label says: ask a doctor.']);
  assert.equal(run({ product: 'kids-benadryl-12-5mg-in-5ml', ageYears: 3 }).band, 'The label says: do not use unless directed by a doctor.');
  assert.equal(run({ product: 'kids-benadryl-12-5mg-in-5ml', ageYears: 1 }).band, 'The label says: do not use.');
  assert.equal(run({ product: 'delsym-30mg-in-5ml', ageYears: 3 }).band, 'The label says: do not use.');
  assert.equal(run({ product: 'imodium-caplet', ageYears: 4 }).band, 'The label says: ask a doctor.');
  assert.equal(run({ product: 'pyrantel-chewable', weight: 30, weightUnit: 'lb', ageYears: 1 }).flag, 'weight-and-age-rows-differ');
});

test('chart ends, gaps between whole-pound rows, and infants\' rows in months', () => {
  assert.match(run({ product: 'kids-tylenol-160mg-in-5ml', weight: 100, weightUnit: 'lb' }).note, /above the chart's last weight row \(72-95 lb\)/);
  assert.match(run({ product: 'infant-tylenol-160mg-in-5ml', weight: 40, weightUnit: 'lb' }).note, /last weight row \(24-35 lb\)/);
  const g = run({ product: 'kids-tylenol-160mg-in-5ml', weight: 35.5, weightUnit: 'lb' });
  assert.equal(g.flag, 'no-chart-row');
  assert.match(g.note, /falls between two rows/);
  assert.equal(run({ product: 'infant-motrin-50mg-in-1-25ml', ageMonths: 8 }).band, '1.25 mL (50 mg).');
  assert.equal(run({ product: 'infant-motrin-50mg-in-1-25ml', ageMonths: 4 }).band, 'The label says: ask a doctor.');
  assert.match(run({ product: 'infant-motrin-50mg-in-1-25ml', ageYears: 0 }).message, /age in months/);
  assert.match(run({ product: 'infant-motrin-50mg-in-1-25ml', weight: 10, weightUnit: 'lb' }).note, /no weight row below 12 lb/);
  assert.match(run({ product: 'infant-motrin-50mg-in-1-25ml', ageYears: 2 }).note, /past the chart's last age row/);
});

test('Imodium, Delsym and pyrantel rows', () => {
  assert.match(run({ product: 'imodium-caplet', weight: 50, weightUnit: 'lb', ageYears: 7 }).band, /^1 caplet after the first loose stool; 1\/2 caplet after each subsequent loose stool; but no more than 2 caplets in 24 hours/);
  assert.match(run({ product: 'imodium-1mg-in-7-5ml', ageYears: 10 }).band, /no more than 45 mL in 24 hours/);
  assert.match(run({ product: 'imodium-1mg-in-7-5ml', ageYears: 15 }).band, /^30 mL after the first loose stool; 15 mL after each/);
  assert.equal(run({ product: 'delsym-30mg-in-5ml', ageYears: 8 }).band, '5 mL every 12 hours, not to exceed 10 mL in 24 hours (30 mg).');
  assert.equal(run({ product: 'pyrantel-chewable', weight: 70, weightUnit: 'lb' }).band, '1½ tablets (375 mg).');
  assert.equal(run({ product: 'pyrantel-chewable', weight: 200, weightUnit: 'lb' }).band, '4 tablets (1000 mg).');
  assert.match(run({ product: 'imodium-caplet', weight: 150, weightUnit: 'lb', ageYears: 15 }).note, /its last row, "adults and children 12 years and over", is by age/);
});

test('a blank weight or age is said, not passed over', () => {
  assert.match(run({ product: 'kids-tylenol-160mg-in-5ml', ageYears: 4 }).note, /The weight was not entered, so only the age row is shown/);
  assert.match(run({ product: 'kids-tylenol-160mg-in-5ml', weight: 40, weightUnit: 'lb' }).note, /The age was not entered, so only the weight row is shown/);
  assert.doesNotMatch(run({ product: 'kids-tylenol-160mg-in-5ml', weight: 40, weightUnit: 'lb', ageYears: 4 }).note, /was not entered, so only/);
});

test('refusals and a withheld label', () => {
  assert.match(run({}).message, /^Choose the product/);
  assert.match(run({ product: 'kids-tylenol-160mg-in-5ml' }).message, /weight, age, or both/);
  assert.match(run({ product: 'kids-tylenol-160mg-in-5ml', weight: 30 }).message, /lb or kg/);
  assert.match(run({ product: 'delsym-30mg-in-5ml', weight: 30, weightUnit: 'lb' }).message, /by age only/);
  assert.match(run({ product: 'pyrantel-chewable', ageYears: 5 }).message, /by weight/);
  const p = P('delsym-30mg-in-5ml');
  const w = run({ product: 'delsym-30mg-in-5ml', ageYears: 8 }, { ...T, [p.setId]: row('Delsym', { supersededOn: '2026-11-01' }) });
  assert.deepEqual([w.withheld, w.flag], [true, 'withheld']);
});
