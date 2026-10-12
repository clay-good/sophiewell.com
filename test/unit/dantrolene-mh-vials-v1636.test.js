// spec-v1636 tool 6: dantrolene for malignant hyperthermia, dose and vials, from the three labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dantroleneMhVials, LABELS, PRODUCTS } from '../../lib/dantrolene-mh-vials-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const d = (i, t) => dantroleneMhVials({ weight: 70, product: 'ryanodex', use: 'treatment', ...i }, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });

test('all three label rows answer; a product withholds only on its own label', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(d({ dosePerKg: 2.5, cumulativeGiven: 0 }, dead(LABELS.ryanodex.setId)).flag, 'withheld');
  assert.equal(d({ dosePerKg: 2.5, cumulativeGiven: 0 }, dead(LABELS.revonto.setId)).flag, 'treatment');
  assert.equal(PRODUCTS.length, 3);
});

test('Ryanodex: 250 mg vials, 5 mL of sterile water each, 50 mg/mL', () => {
  const r = d({ dosePerKg: 2.5, cumulativeGiven: 0 });
  assert.deepEqual([r.doseMg, r.vials, r.sterileWaterMl, r.volumeMl, r.mannitolGrams, r.vialsToTenMgKg], [175, 1, 5, 3.5, 0.09, 3]);
  assert.deepEqual((({ doseMg, vials }) => [doseMg, vials])(d({ weight: 100, dosePerKg: 2.5, cumulativeGiven: 0 })), [250, 1]);
  assert.deepEqual((({ doseMg, vials }) => [doseMg, vials])(d({ weight: 101, dosePerKg: 2.5, cumulativeGiven: 0 })), [252.5, 2]);
  assert.match(r.notes.join(' '), /insufficient to maintain diuresis/);
});

test('the 20 mg products: 60 mL of sterile water and 3 g of mannitol per vial', () => {
  for (const product of ['dantrium-intravenous', 'revonto']) {
    const r = d({ product, dosePerKg: 2.5, cumulativeGiven: 0 });
    assert.deepEqual([r.doseMg, r.vials, r.sterileWaterMl, r.volumeMl, r.mannitolGrams, r.vialsToTenMgKg], [175, 9, 540, 525, 26.25, 35], product);
  }
});

test('the cumulative maximum of 10 mg/kg is tested only against what was entered', () => {
  assert.equal(d({ dosePerKg: 2.5, cumulativeGiven: 525 }).flag, 'treatment');
  const over = d({ dosePerKg: 2.5, cumulativeGiven: 600 });
  assert.deepEqual([over.flag, over.abnormal], ['past-cumulative-maximum', true]);
  assert.match(over.band, /11\.1 mg\/kg, past the label's maximum cumulative 10 mg\/kg; 100 mg remains/);
  const unknown = d({ dosePerKg: 2.5 });
  assert.deepEqual([unknown.flag, unknown.abnormal], ['treatment-cumulative-not-entered', true]);
  assert.match(unknown.notes.join(' '), /is not tested against the cumulative maximum/);
});

test('the treatment dose is the reader\'s; under 1 mg/kg is flagged; 2.5 mg/kg is named as the prevention dose', () => {
  assert.match(d({}).message, /^Enter the dose for this bolus/);
  assert.equal(d({ dosePerKg: 0.5, cumulativeGiven: 0 }).flag, 'below-label-minimum');
  assert.equal(d({ dosePerKg: 1, cumulativeGiven: 0 }).flag, 'treatment');
  assert.match(d({ dosePerKg: 2.5, cumulativeGiven: 0 }).notes.join(' '), /does not name a larger starting dose; 2\.5 mg\/kg is its prevention dose/);
  const p = d({ use: 'prevention' });
  assert.deepEqual([p.flag, p.doseMg, p.vialsToTenMgKg], ['prevention', 175, null]);
  assert.match(p.notes.join(' '), /about 75 minutes before surgery/);
  assert.match(d({ use: 'prevention', product: 'revonto' }).notes.join(' '), /over about 1 hour, starting about 1\.25 hours before/);
});

test('nothing is defaulted', () => {
  assert.match(dantroleneMhVials({}, now).message, /^Enter the weight/);
  assert.match(dantroleneMhVials({ weight: 70 }, now).message, /^Choose the product/);
  assert.match(dantroleneMhVials({ weight: 70, product: 'ryanodex' }, now).message, /^Choose the use/);
  assert.equal(dantroleneMhVials(null, now).valid, false);
});
