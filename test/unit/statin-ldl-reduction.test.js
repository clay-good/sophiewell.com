// spec-v1633 tool 21: the comparative LDL-C table on the Crestor label.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statinLdlReduction as d, LABEL, TABLE } from '../../lib/statin-ldl-reduction-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d(i, now);

test('the label answers and the table is the label\'s', () => {
  assert.equal(labelRow(LABEL.setId, now).answers, true);
  assert.deepEqual(TABLE, { rosuvastatin: { 10: -46, 20: -52, 40: -55 }, atorvastatin: { 10: -37, 20: -43, 40: -48, 80: -51 }, simvastatin: { 10: -28, 20: -35, 40: -39, 80: -46 }, pravastatin: { 10: -20, 20: -24, 40: -30 } });
});

test('a dose the trial used gives its group mean, and a baseline is projected by arithmetic', () => {
  assert.equal(run({ statin: 'rosuvastatin', dose: 20 }).meanChangePercent, -52);
  const r = run({ statin: 'atorvastatin', dose: 40, baselineLdl: 160 });
  assert.deepEqual([r.meanChangePercent, r.projectedLdl], [-48, 83.2]);
  assert.match(r.notes[0], /not a forecast for this patient/);
  assert.equal(run({ statin: 'atorvastatin', dose: 40 }).projectedLdl, undefined);
});

test('the nearest trial means are named as the closest numbers, not as equivalent doses', () => {
  const r = run({ statin: 'simvastatin', dose: 20 }); // -35
  assert.deepEqual(r.nearest, [{ statin: 'rosuvastatin', dose: 10, change: -46 }, { statin: 'atorvastatin', dose: 10, change: -37 }, { statin: 'pravastatin', dose: 40, change: -30 }]);
  assert.match(r.notes.join(' '), /not an equivalent dose/);
  assert.match(r.notes.join(' '), /No intensity category/);
});

test('a dose outside the table is not interpolated; rosuvastatin 5 mg is a different table', () => {
  const p = run({ statin: 'pravastatin', dose: 80 });
  assert.deepEqual([p.flag, p.meanChangePercent], ['not-in-table', undefined]);
  assert.equal(run({ statin: 'rosuvastatin', dose: 80 }).flag, 'not-in-table');
  assert.equal(run({ statin: 'atorvastatin', dose: 30 }).flag, 'not-in-table');
  assert.match(run({ statin: 'rosuvastatin', dose: 5 }).band, /different table on the label/);
});

test('nothing is defaulted, and a superseded label withholds the table', () => {
  assert.match(d({}, now).message, /^Choose the statin/);
  assert.match(run({ statin: 'lovastatin', dose: 40 }).message, /^Choose the statin/);
  assert.match(run({ statin: 'atorvastatin' }).message, /^Enter the daily dose/);
  const T = { [LABEL.setId]: { label: 'Crestor', splVersion: 19, publishedOn: '2026-09-30', verifiedOn: '2026-10-11', validThrough: '2027-10-11', supersededOn: '2026-10-12' } };
  const w = d({ statin: 'atorvastatin', dose: 40 }, now, T);
  assert.deepEqual([w.withheld, w.meanChangePercent], [true, undefined]);
});
