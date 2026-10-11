// spec-v1513 tools 1 and 3: Star-method PDC and the outreach list.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pdcStar as p, adherenceOutreachList as a } from '../../lib/pdc-star-v1513.js';

const ann = 'Ann, D10, 2026-01-05, 30, atorvastatin\nAnn, D10, 2026-02-10, 30, atorvastatin\nAnn, D10, 2026-03-20, 90, atorvastatin\nAnn, D10, 2026-06-25, 90, atorvastatin\nAnn, D10, 2026-09-20, 90, atorvastatin';

// Measurement year 2025 is the last with the stay adjustment (2027 Technical Notes, Attachment L).
const ann2025 = ann.replaceAll('2026-', '2025-');

test('same-ingredient overlaps shift; through 2025 a stay leaves both sides and shifts the supply', () => {
  const r = p({ fills: ann2025, year: '2025', stays: 'Ann, 2025-04-01, 2025-04-10' });
  assert.equal(r.rows[0].pdc, 94);
  assert.equal(r.stayAdjusted, true);
  assert.match(r.notes.join(' '), /stay days removed/);
  assert.doesNotMatch(r.notes.join(' '), /risk-adjusted/);
});

// spec-v1641 row 21: from measurement year 2026 the Star measures are risk adjusted and carry no stay
// adjustment (CMS Patient Safety memo, April 22, 2026), so the same stay changes nothing.
test('from measurement year 2026 a stay is not removed, and the result says why', () => {
  const withStay = p({ fills: ann, year: '2026', stays: 'Ann, 2026-04-01, 2026-04-10' });
  const without = p({ fills: ann, year: '2026' });
  assert.equal(withStay.rows[0].pdc, 91.4); // 330 of 361 days
  assert.equal(withStay.rows[0].pdc, without.rows[0].pdc);
  assert.equal(withStay.stayAdjusted, false);
  assert.match(withStay.notes.join(' '), /not adjusted for inpatient or skilled nursing stays \(CMS Patient Safety memo, April 22, 2026\)/);
  assert.doesNotMatch(withStay.notes.join(' '), /stay days removed/);
  // A stay spanning the whole treatment period no longer excludes the patient.
  assert.equal(p({ fills: ann, year: '2026', stays: 'Ann, 2026-01-01, 2026-12-31' }).rows[0].inDenominator, true);
  assert.equal(p({ fills: ann2025, year: '2025', stays: 'Ann, 2025-01-01, 2025-12-31' }).rows[0].inDenominator, false);
});

test('different drugs in the class are not shifted', () => {
  const same = p({ fills: 'X, D10, 2026-01-01, 30, atorvastatin\nX, D10, 2026-01-15, 30, atorvastatin\nX, D10, 2026-12-01, 31, atorvastatin', year: '2026' }).rows[0].pdc;
  const diff = p({ fills: 'X, D10, 2026-01-01, 30, atorvastatin\nX, D10, 2026-01-15, 30, rosuvastatin\nX, D10, 2026-12-01, 31, atorvastatin', year: '2026' }).rows[0].pdc;
  assert.ok(same > diff, `${same} vs ${diff}`);
});

test('denominator rules: one fill, a 90-day period, insulin and sacubitril/valsartan', () => {
  assert.match(p({ fills: 'A, D10, 2026-01-01, 30, atorvastatin', year: '2026' }).rows[0].reason, /fewer than 2 fills/);
  assert.match(p({ fills: 'A, D10, 2026-10-03, 30, atorvastatin\nA, D10, 2026-11-01, 30, atorvastatin', year: '2026' }).rows[0].reason, /90 days, under 91/);
  assert.equal(p({ fills: 'A, D10, 2026-10-02, 30, atorvastatin\nA, D10, 2026-11-01, 30, atorvastatin', year: '2026' }).rows[0].inDenominator, true);
  assert.match(p({ fills: 'C, D08, 2026-01-10, 90, metformin\nC, D08, 2026-02-01, 30, insulin glargine', year: '2026' }).rows[0].reason, /insulin/);
  assert.match(p({ fills: 'E, D09, 2026-01-10, 90, sacubitril/valsartan\nE, D09, 2026-04-10, 90, sacubitril/valsartan', year: '2026' }).rows[0].reason, /sacubitril/);
});

test('outreach: slack is the uncovered days still allowed; past it is listed apart', () => {
  const fills = `${ann}\nBo, D10, 2026-02-01, 30, rosuvastatin\nBo, D10, 2026-05-01, 30, rosuvastatin`;
  const r = a({ fills: fills.replaceAll('2026-', '2025-'), year: '2025', asOf: '2025-09-26', stays: 'Ann, 2025-04-01, 2025-04-10' });
  assert.deepEqual(r.list.map((x) => [x.patient, x.slack]), [['Ann', 56]]);
  // In 2026 the stay days stay in: 21 uncovered of the 72 allowed over 361 days.
  const r26 = a({ fills, year: '2026', asOf: '2026-09-26', stays: 'Ann, 2026-04-01, 2026-04-10' });
  assert.deepEqual(r26.list.map((x) => [x.patient, x.slack]), [['Ann', 51]]);
  assert.match(r26.notes.join(' '), /risk-adjusted/);
  assert.deepEqual(r.rows.map((x) => [x.patient, x.canReach]), [['Ann', true], ['Bo', false]]);
  assert.match(r.band, /1 cannot reach 80%/);
});

test('blank inputs ask', () => {
  assert.equal(p({ year: '2026' }).valid, false);
  assert.equal(p({ fills: ann }).valid, false);
  assert.match(p({ fills: 'A, D11, 2026-01-01, 30, x', year: '2026' }).message, /D08, D09 or D10/);
});

test('mapped file rows use the same PDC calculation and preserve commas in values', () => {
  const fillRows = [
    { patient: 'Smith, Ann', measure: 'D10', fill_date: '2026-01-05', days_supply: '30', ingredient: 'atorvastatin' },
    { patient: 'Smith, Ann', measure: 'D10', fill_date: '2026-02-10', days_supply: '30', ingredient: 'atorvastatin' },
  ];
  const fromRows = p({ fillRows, year: '2026' });
  const fromText = p({ fills: 'Ann Smith, D10, 2026-01-05, 30, atorvastatin\nAnn Smith, D10, 2026-02-10, 30, atorvastatin', year: '2026' });
  assert.equal(fromRows.rows[0].pdc, fromText.rows[0].pdc);
  assert.equal(fromRows.rows[0].patient, 'Smith, Ann');
  assert.match(p({ fillRows: [{ ...fillRows[0], ingredient: '' }], year: '2026' }).message, /ingredient/);
});
