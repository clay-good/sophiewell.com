import { test } from 'node:test';
import assert from 'node:assert/strict';
import { philadelphia } from '../../lib/scoring-v4.js';

test('philadelphia 0/8 (tile example) -> not low risk', () => {
  const r = philadelphia({});
  assert.equal(r.lowRisk, false);
  assert.match(r.band, /NOT low risk per Baker 1993/);
});

test('philadelphia 7/8 -> not low risk; failing list', () => {
  const r = philadelphia({
    age29To60Days: true, wellAppearing: true, wbcLt15: true,
    bandToNeutrophilRatioLt0Point2: true, uaLt10WbcAndFewBacteria: true,
    csfLt8WbcAndGramStainNeg: true, cxrClearOrNotObtained: true,
    // stoolNormalOrNoDiarrhea missing
  });
  assert.equal(r.metCount, 7);
  assert.equal(r.lowRisk, false);
  assert.deepEqual(r.failing, ['stoolNormalOrNoDiarrhea']);
});

test('philadelphia 8/8 -> low risk; safe outpatient management', () => {
  const r = philadelphia({
    age29To60Days: true, wellAppearing: true, wbcLt15: true,
    bandToNeutrophilRatioLt0Point2: true, uaLt10WbcAndFewBacteria: true,
    csfLt8WbcAndGramStainNeg: true, cxrClearOrNotObtained: true,
    stoolNormalOrNoDiarrhea: true,
  });
  assert.equal(r.lowRisk, true);
  assert.match(r.band, /safe outpatient management/);
});
