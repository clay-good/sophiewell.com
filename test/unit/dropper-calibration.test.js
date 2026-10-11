// spec-v1629 tool 21: dropper calibration and dose in drops.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dropperCalibration as dc } from '../../lib/dropper-calibration-v1629.js';

test('no default drops per mL: a missing count is refused, not filled in', () => {
  const r = dc({ dose: 0.5, doseUnit: 'mL' });
  assert.equal(r.valid, false);
  assert.match(r.message, /Enter the number of drops counted/);
  assert.match(r.message, /no standard drops-per-mL figure to fall back on/);
  assert.match(dc({ drops: 60 }).message, /Enter the volume those drops made/);
});

test('drops per mL from the count, alone or with a dose', () => {
  assert.equal(dc({ drops: 60, volume: 2.5 }).dropsPerMl, 24);
  const r = dc({ drops: 60, volume: 2.5, dose: 0.5, doseUnit: 'mL' });
  assert.equal(r.dropsWhole, 12);
  assert.equal(r.errorPercent, 0);
  assert.match(r.notes.join(' '), /exactly the dose/);
});

test('a dose in mg uses the concentration, and rounding to a whole drop states its error', () => {
  // 24 drops/mL; 12.5 mg at 40 mg/mL is 0.3125 mL = 7.5 drops -> 8 drops = 0.333333 mL, 6.66667% over.
  const r = dc({ drops: 60, volume: 2.5, dose: 12.5, doseUnit: 'mg', concentration: 40 });
  assert.equal(r.dropsExact, 7.5);
  assert.equal(r.dropsWhole, 8);
  assert.equal(r.deliveredMl, 0.333333);
  assert.equal(r.errorPercent, 6.66667);
  assert.match(r.band, /8 drops \(7\.5 before rounding\), delivering 0\.333333 mL \(13\.3333 mg\)/);
  assert.match(r.notes.join(' '), /6\.66667% over the dose/);
  assert.match(dc({ drops: 60, volume: 2.5, dose: 12.5, doseUnit: 'mg' }).message, /Enter the concentration/);
  assert.match(dc({ drops: 60, volume: 2.5, dose: 12.5 }).message, /Choose the unit of the dose/);
});

test('a dose that rounds to 0 drops is reported as not measurable with this dropper', () => {
  const r = dc({ drops: 60, volume: 2.5, dose: 0.01, doseUnit: 'mL' });
  assert.equal(r.valid, true);
  assert.equal(r.measurable, false);
  assert.equal(r.dropsWhole, 0);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /not measurable with this dropper/);
});
