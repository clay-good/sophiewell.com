// spec-v1513 tools 1 and 3: Star-method PDC and the outreach list.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pdcStar as p, adherenceOutreachList as a } from '../../lib/pdc-star-v1513.js';

const ann = 'Ann, D10, 2026-01-05, 30, atorvastatin\nAnn, D10, 2026-02-10, 30, atorvastatin\nAnn, D10, 2026-03-20, 90, atorvastatin\nAnn, D10, 2026-06-25, 90, atorvastatin\nAnn, D10, 2026-09-20, 90, atorvastatin';

test('same-ingredient overlaps shift; a stay leaves both sides and shifts the supply', () => {
  const r = p({ fills: ann, year: '2026', stays: 'Ann, 2026-04-01, 2026-04-10' });
  assert.equal(r.rows[0].pdc, 94);
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
  const r = a({ fills, year: '2026', asOf: '2026-09-26', stays: 'Ann, 2026-04-01, 2026-04-10' });
  assert.deepEqual(r.list.map((x) => [x.patient, x.slack]), [['Ann', 56]]);
  assert.match(r.band, /1 cannot reach 80%/);
});

test('blank inputs ask', () => {
  assert.equal(p({ year: '2026' }).valid, false);
  assert.equal(p({ fills: ann }).valid, false);
  assert.match(p({ fills: 'A, D11, 2026-01-01, 30, x', year: '2026' }).message, /D08, D09 or D10/);
});
