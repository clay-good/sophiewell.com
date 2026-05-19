import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bostonFebrile } from '../../lib/scoring-v4.js';

test('boston 0/7 (tile example) -> not eligible', () => {
  const r = bostonFebrile({});
  assert.equal(r.lowRisk, false);
  assert.match(r.band, /NOT eligible for outpatient ceftriaxone/);
});

test('boston 6/7 -> not eligible; failing list captures CXR', () => {
  const r = bostonFebrile({
    age28To89Days: true, wellAppearing: true, noFocalSourceOnExam: true,
    wbcLt20: true, uaLt10WbcPerHpf: true, csfLt10WbcPerMm3: true,
    // cxrClearOrNotObtained missing
  });
  assert.equal(r.metCount, 6);
  assert.equal(r.lowRisk, false);
  assert.deepEqual(r.failing, ['cxrClearOrNotObtained']);
});

test('boston 7/7 -> eligible for outpatient ceftriaxone', () => {
  const r = bostonFebrile({
    age28To89Days: true, wellAppearing: true, noFocalSourceOnExam: true,
    wbcLt20: true, uaLt10WbcPerHpf: true, csfLt10WbcPerMm3: true,
    cxrClearOrNotObtained: true,
  });
  assert.equal(r.lowRisk, true);
  assert.match(r.band, /eligible for outpatient ceftriaxone management per Baskin 1992/);
});
