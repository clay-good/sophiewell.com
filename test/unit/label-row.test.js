// spec-v1628 section 1, fail closed: a label figure answers only while its label stands; and the
// first tool that reads its figures that way (spec-v1630 tool 9).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderModule, STATE, MODULE } from '../../scripts/build-label-editions.mjs';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow, labelUrl } from '../../lib/label-row.js';
import { pnCalciumPhosphateCheck as cp, PRODUCTS } from '../../lib/pn-calcium-phosphate-check-v1630.js';

const CA = '16307c00-d0d5-4e05-821f-17b0c1a29fc9';
const now = new Date('2026-10-11T12:00:00Z');
const superseded = { ...LABEL_EDITIONS, [CA]: { ...LABEL_EDITIONS[CA], supersededOn: '2026-11-01', supersededBy: 'version 6 (2026-10-30)' } };

test('the shipped module is the generator\'s output for the watch state', () => {
  const rows = JSON.parse(readFileSync(STATE, 'utf8'));
  assert.equal(readFileSync(MODULE, 'utf8'), renderModule(rows), 'run `node scripts/build-label-editions.mjs` and commit lib/label-editions.js');
  assert.equal(Object.keys(LABEL_EDITIONS).length, rows.length);
  // Hashes and tool lists stay in the script's file; the browser gets only what it shows or decides on.
  assert.equal(LABEL_EDITIONS[CA].sections, undefined);
});

test('a row answers through its validThrough date and not a day longer', () => {
  const through = LABEL_EDITIONS[CA].validThrough;
  const row = labelRow(CA, now);
  assert.deepEqual([row.answers, row.version, row.url], [true, LABEL_EDITIONS[CA].splVersion, labelUrl(CA)]);
  assert.equal(labelRow(CA, new Date(`${through}T23:59:00Z`)).answers, true);
  const dayAfter = new Date(new Date(`${through}T00:00:00Z`).getTime() + 86400000);
  const late = labelRow(CA, dayAfter);
  assert.deepEqual([late.answers, late.reason], [false, 'expired']);
  assert.match(late.message, /last confirmed against DailyMed more than 12 months ago, so it is withheld/);
});

test('a superseded row does not answer, whatever the date', () => {
  const row = labelRow(CA, now, superseded);
  assert.deepEqual([row.answers, row.reason], [false, 'superseded']);
  assert.match(row.message, /read from version \d+ of the Calcium Gluconate injection.*text has changed since, so the figure is withheld/);
  assert.ok(row.message.length <= 280);
  assert.throws(() => labelRow('00000000-0000-0000-0000-000000000000', now), /no label edition recorded/);
});

test('every product strength the tool reads is on a watched label', () => {
  for (const p of Object.values(PRODUCTS)) assert.equal(labelRow(p.setId, now).answers, true, p.name);
});

const order = { finalVolume: 150, calciumUnit: 'mL-gluconate', calcium: 6, phosphateUnit: 'mL-kphos', phosphate: 0.5 };

test('calcium-phosphate: concentrations from milliliters at the label strengths', () => {
  // 6 mL x 0.465 = 2.79 mEq and 0.5 mL x 3 = 1.5 mmol, in 0.15 L.
  const r = cp({ ...order, aminoAcidGrams: 4.5, limitKind: 'sum', limit: 30 }, now);
  assert.deepEqual([r.calciumMEqPerL, r.phosphateMmolPerL, r.sum, r.aminoAcidPercent, r.aboveLimit], [18.6, 10, 28.6, 3, false]);
  assert.match(r.notes[0], /0\.465 mEq\/mL = 2\.79 mEq \(version \d+ of the Calcium Gluconate injection/);
  assert.doesNotMatch(`${r.band} ${r.bandLabel}`, /compatible/i);
  assert.match(r.note, /does not make an admixture compatible/);
  assert.equal(cp({ ...order, phosphateUnit: 'mL-naphos' }, now).phosphateMmolPerL, 10);
  assert.deepEqual(cp({ finalVolume: 1000, calciumUnit: 'mEq', calcium: 10, phosphateUnit: 'mmol', phosphate: 15 }, now).sum, 25);
});

test('calcium-phosphate: the limit is the reader\'s, and without one the tool does not judge', () => {
  const none = cp(order, now);
  assert.equal(none.aboveLimit, undefined);
  assert.match(none.band, /No limit entered: concentrations only/);
  const over = cp({ ...order, limitKind: 'max-calcium', limit: 15 }, now);
  assert.deepEqual([over.aboveLimit, over.abnormal], [true, true]);
  assert.equal(cp({ ...order, limitKind: 'sum', limit: 28.6 }, now).aboveLimit, false);
  assert.match(cp({ ...order, limit: 30 }, now).message, /Choose what your limit is/);
  // The point of lowest dilution concentrates both ions.
  const low = cp({ ...order, lowestVolume: 100 }, now);
  assert.deepEqual([low.calciumMEqPerL, low.phosphateMmolPerL], [27.9, 15]);
  assert.match(cp({ ...order, lowestVolume: 200 }, now).message, /cannot be more than the final volume/);
});

test('fail closed: past validThrough, or superseded, the label strength is not used', () => {
  for (const [when, table, why] of [[new Date('2029-01-01T00:00:00Z'), undefined, /more than 12 months ago/], [now, superseded, /text has changed since/]]) {
    const r = cp(order, when, table);
    assert.equal(r.valid, false);
    assert.equal(r.withheld, 'calcium');
    assert.match(r.message, why);
    assert.doesNotMatch(r.message, /0\.465/);
    // Longer than 280 characters and the page would lift the refusal out of the result area.
    assert.ok(r.message.length <= 280, String(r.message.length));
    assert.equal(r.labelUrl, labelUrl(CA));
    // The reader's own figure from the vial in hand stands in, and the result says so.
    const own = cp({ ...order, calciumPerMl: 0.465, ...(table ? {} : { phosphatePerMl: 3 }) }, when, table);
    assert.equal(own.calciumMEqPerL, 18.6);
    assert.match(own.notes[0], /the figure you entered from the label in hand/);
  }
  // Entering mEq and mmol never touches a label row.
  assert.equal(cp({ finalVolume: 1000, calciumUnit: 'mEq', calcium: 10, phosphateUnit: 'mmol', phosphate: 15 }, new Date('2029-01-01T00:00:00Z')).valid, true);
  // Another label in the same tool keeps answering when one is superseded.
  assert.equal(cp({ ...order, calciumUnit: 'mEq', calcium: 2.79 }, now, superseded).phosphateMmolPerL, 10);
});
