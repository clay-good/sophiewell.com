// spec-v130 2.2: PSA density (Benson 1992). PSAD = serum PSA / prostate volume;
// > 0.15 ng/mL/cc raises suspicion for clinically significant cancer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { psaDensity } from '../../lib/uro-v130.js';

test('density above 0.15 is flagged', () => {
  const r = psaDensity({ psa: 6, volume: 30 });
  assert.equal(r.valid, true);
  assert.equal(r.density, 0.2); // 6/30
  assert.equal(r.abnormal, true);
  assert.match(r.band, /raising suspicion/);
});

test('density at/below 0.15 is not flagged (threshold flip)', () => {
  const r = psaDensity({ psa: 6, volume: 40 });
  assert.equal(r.density, 0.15); // 6/40 = 0.15
  assert.equal(r.abnormal, false);
  assert.match(r.band, /lower-suspicion/);
});

test('blank field -> valid:false; scalar -> valid:false; zero volume guarded', () => {
  assert.equal(psaDensity({ psa: 6 }).valid, false);
  assert.equal(psaDensity(7).valid, false);
  assert.equal(psaDensity({ psa: 6, volume: 0 }).valid, false);
});
