// spec-v56 §2.7: magnesium sulfate (preeclampsia/eclampsia) infusion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mgso4Preeclampsia } from '../../lib/medication-v5.js';

test('4 g load + 2 g/h at 40 g/L: 100 mL load, 50 mL/h maintenance', () => {
  const r = mgso4Preeclampsia({ loadG: 4, maintGPerH: 2, concGPerMl: 0.04 });
  assert.equal(r.loadVolMl, 100);
  assert.equal(r.maintRateMlH, 50);
  assert.equal(r.maintGPerH, 2);
});

test('6 g load scales the loading volume', () => {
  const r = mgso4Preeclampsia({ loadG: 6, maintGPerH: 2, concGPerMl: 0.04 });
  assert.equal(r.loadVolMl, 150);
});

test('renal impairment halves the maintenance default', () => {
  const r = mgso4Preeclampsia({ loadG: 4, maintGPerH: 2, concGPerMl: 0.04, renalImpairment: true });
  assert.equal(r.maintGPerH, 1);
  assert.equal(r.maintRateMlH, 25);
  assert.equal(r.renalImpairment, true);
});

test('rejects impossible concentration / rate', () => {
  assert.throws(() => mgso4Preeclampsia({ loadG: 4, maintGPerH: 2, concGPerMl: 0 }), /concGPerMl/);
  assert.throws(() => mgso4Preeclampsia({ loadG: 4, maintGPerH: NaN, concGPerMl: 0.04 }), /maintGPerH/);
});
