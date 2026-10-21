// Regression tests for the defects an independent review found in the spec-v1629 (compounding arithmetic) and v1639
// (counter and contraception) tools on 2026-10-20, each with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contraceptiveMissedPill } from '../../lib/contraceptive-missed-pill-v1639.js';
import { oralSuspensionCourse } from '../../lib/oral-suspension-course-v1639.js';
import { epinephrineDeviceWeightBand } from '../../lib/epinephrine-device-weight-band-v1639.js';
import { emergencyContraceptionWindow } from '../../lib/emergency-contraception-window-v1639.js';
import { missedDoseLabelRule } from '../../lib/missed-dose-label-rule-v1639.js';
import { compoundCopyCheck } from '../../lib/compound-copy-check-v1629.js';
import { ethanolProof } from '../../lib/ethanol-proof-v1629.js';
import { formulaScale } from '../../lib/formula-scale-v1629.js';
import { tabletPowderSource } from '../../lib/tablet-powder-source-v1629.js';
import { isotonicityEValue } from '../../lib/isotonicity-e-value-v1629.js';
import { percentIonized } from '../../lib/percent-ionized-v1629.js';
import { dilutionC1V1 } from '../../lib/dilution-c1v1-v1629.js';
import { dropperCalibration } from '../../lib/dropper-calibration-v1629.js';

const now = new Date('2026-10-20T09:00:00Z');

test('hours printed beside a CDC or label line sit on the side the rule was decided', () => {
  const late = contraceptiveMissedPill({ pillType: 'combined-estrogen-progestin', dueAt: '2026-10-19 08:00', nowAt: '2026-10-20 07:57' }, now);
  assert.equal(late.hoursSinceDue, 23.95);
  assert.match(late.notes[0], /^23\.95 hours since the pill was due/);
  const pop = contraceptiveMissedPill({ pillType: 'norethindrone-or-norgestrel', dueAt: '2026-10-20 08:00', nowAt: '2026-10-20 11:02', intercourse: 'intercourse-no' }, now);
  assert.equal(pop.hoursSinceDue, 3.03);
  assert.match(emergencyContraceptionWindow({ intercourseAt: '2026-10-17 08:00', nowAt: '2026-10-20 08:02' }, now).band, /^72\.03 hours: past the Plan B/);
  assert.match(missedDoseLabelRule({ product: 'tirzepatide-mounjaro', lastDoseAt: '2026-10-17 08:00', changeTo: '2026-10-20 07:57' }, now).band, /71\.95 hours between doses is less than 72/);
});

test('epinephrine: a weight just under 30 kg is not printed as 30 kg', () => {
  const r = epinephrineDeviceWeightBand({ weight: '66.13', weightUnit: 'lb' }, now);
  assert.equal(r.weightKg, 29.996);
  assert.equal(epinephrineDeviceWeightBand({ weight: '14.997', weightUnit: 'kg' }, now).weightKg, 14.997);
});

test('suspension: a dose on the discard date needs the second bottle', () => {
  const r = oralSuspensionCourse({ doseMl: 5, dosesPerDay: 2, days: 11, mixedOn: '2026-10-01', discardAfterDays: 10 });
  assert.equal(r.flag, 'course-outlasts-the-bottle');
  assert.equal(oralSuspensionCourse({ doseMl: 5, dosesPerDay: 2, days: 10, mixedOn: '2026-10-01', discardAfterDays: 10 }).flag, 'course');
});

test('compounding: a fractional strength is not settled as "not a copy"', () => {
  const r = compoundCopyCheck({ sameApi: 'yes', availability: 'marketed', compoundedStrength: 12.5, commercialStrength: 25, sameRoute: 'yes', determination: 'no', priorCount: 0 });
  assert.equal(r.essentiallyACopy, null);
  assert.match(r.band, /^Not settled by the guidance's numbers/);
  assert.match(compoundCopyCheck({ sameApi: 'yes', availability: 'shortage', compoundedStrength: 12.5, commercialStrength: 25, sameRoute: 'yes', determination: 'no', priorCount: 0 }).band, /not commercially available/);
});

test('proof gallons use the proof to the nearest tenth degree (27 CFR 30.31(a))', () => {
  assert.equal(ethanolProof({ mode: 'gallons', volumeUnit: 'gal', volume: 100, proof: 100.04 }).proofGallons, 100);
});

test('impossible or incomplete inputs are refused or asked for', () => {
  assert.match(formulaScale({ formula: 'Drug A, 1, g\nDrug B, 500, mg\nBase, qs, g', ingredient: 'Drug A', ingredientQuantity: 2, masterYield: 100 }).message, /unit of the master formula's yield/);
  assert.equal(isotonicityEValue({ mode: 'white-vincent', solutes: '1, 0' }).valid, false);
  assert.equal(dilutionC1V1({ stockUnit: 'ratio', finalUnit: 'pct-wv', stockStrength: 0.5, stockQuantity: 10, finalStrength: 50 }).valid, false);
  assert.equal(dropperCalibration({ drops: 20.5, volume: 1, dose: 1, doseUnit: 'mL' }).valid, false);
});

test('tablets are rounded up on the value itself, and an ionized share never prints 100 beside a nonzero rest', () => {
  assert.match(tabletPowderSource({ needed: 100.0004, strength: 10, count: 10, totalWeight: 2000 }).band, /^Crush 11 tablets/);
  const p = percentIonized({ type: 'acid', pKa: -5, pH: 14 });
  assert.match(p.band, /^nearly 100% ionized/);
  assert.doesNotMatch(p.notes.join(' '), /∞|Infinity/);
});
