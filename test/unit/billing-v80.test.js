// spec-v80 §5 acceptance: E/M & time-based coding, completed. Each of the six
// engines gets >=3 boundary worked examples, including every time-band boundary
// minute the spec names (29/30/74/75/104/134 critical care; the 99417-vs-G2212
// payer threshold; the 8-minute-rule bands; the anesthesia (base+time+mod)xCF
// example and the medical-direction percentage). One file, mirroring the v79
// billing-v79.test.js precedent.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  emMdm2023, criticalCareTime, splitShared, prolongedServices, therapyUnits, anesthesiaUnits,
  NPP_FEE_PERCENT, ANESTHESIA_CF_DEFAULT, MEDICAL_DIRECTION,
} from '../../lib/billing-v80.js';

// ---- 2.1 em-mdm-2023 --------------------------------------------------------
test('em-mdm-2023: Moderate/High MDM map to the right code in inpatient, ED, SNF, and home', () => {
  // Moderate MDM = level 4 (two elements at >=4).
  assert.equal(emMdm2023({ setting: 'inpatient-initial', problems: 4, data: 4, risk: 2 }).code, '99222');
  assert.equal(emMdm2023({ setting: 'inpatient-initial', problems: 5, data: 5, risk: 5 }).code, '99223');
  assert.equal(emMdm2023({ setting: 'ed', problems: 4, data: 4, risk: 3 }).code, '99284');
  assert.equal(emMdm2023({ setting: 'ed', problems: 5, data: 5, risk: 2 }).code, '99285');
  assert.equal(emMdm2023({ setting: 'snf-subsequent', problems: 4, data: 4, risk: 2 }).code, '99309');
  assert.equal(emMdm2023({ setting: 'snf-subsequent', problems: 5, data: 5, risk: 4 }).code, '99310');
  assert.equal(emMdm2023({ setting: 'home-new', problems: 4, data: 4, risk: 3 }).code, '99344');
  assert.equal(emMdm2023({ setting: 'home-new', problems: 5, data: 5, risk: 4 }).code, '99345');
});

test('em-mdm-2023: the 2-of-3 driver and limiting element are reported; straightforward/low collapse where the family collapses them', () => {
  const r = emMdm2023({ setting: 'inpatient-initial', problems: 4, data: 4, risk: 2 });
  assert.equal(r.mdm, 'Moderate');
  assert.deepEqual(r.limitingElements, ['risk']);
  // Inpatient-initial collapses straightforward and low into 99221.
  assert.equal(emMdm2023({ setting: 'inpatient-initial', problems: 2, data: 2, risk: 2 }).code, '99221');
  assert.equal(emMdm2023({ setting: 'inpatient-initial', problems: 3, data: 3, risk: 2 }).code, '99221');
  // SNF subsequent does NOT collapse: straightforward 99307, low 99308.
  assert.equal(emMdm2023({ setting: 'snf-subsequent', problems: 2, data: 2, risk: 2 }).code, '99307');
  assert.equal(emMdm2023({ setting: 'snf-subsequent', problems: 3, data: 3, risk: 2 }).code, '99308');
});

test('em-mdm-2023: office defers to em-mdm (returns both new and established codes); bad inputs throw', () => {
  const o = emMdm2023({ setting: 'office', problems: 4, data: 4, risk: 4 });
  assert.equal(o.code, null);
  assert.equal(o.newCode, '99204');
  assert.equal(o.estCode, '99214');
  assert.throws(() => emMdm2023({ setting: 'clinic', problems: 4, data: 4, risk: 4 }), TypeError);
  assert.throws(() => emMdm2023({ setting: 'ed', problems: 1, data: 4, risk: 4 }), RangeError);
});

// ---- 2.2 critical-care-time -------------------------------------------------
test('critical-care-time: every band boundary the spec names (29/30/74/75/104/134)', () => {
  assert.equal(criticalCareTime({ totalMinutes: 29 }).isCriticalCare, false);
  const m30 = criticalCareTime({ totalMinutes: 30 });
  assert.equal(m30.code99291, 1); assert.equal(m30.units99292, 0);
  assert.equal(criticalCareTime({ totalMinutes: 74 }).units99292, 0);
  assert.equal(criticalCareTime({ totalMinutes: 75 }).units99292, 1);
  assert.equal(criticalCareTime({ totalMinutes: 104 }).units99292, 1);
  assert.equal(criticalCareTime({ totalMinutes: 134 }).units99292, 2);
  assert.equal(criticalCareTime({ totalMinutes: 135 }).units99292, 3);
});

test('critical-care-time: the procedure-time subtraction can drop below the 30-minute floor', () => {
  const r = criticalCareTime({ totalMinutes: 100, procedureMinutes: 40 });
  assert.equal(r.netMinutes, 60);
  assert.equal(r.units99292, 0);
  const below = criticalCareTime({ totalMinutes: 50, procedureMinutes: 25 });
  assert.equal(below.netMinutes, 25);
  assert.equal(below.isCriticalCare, false);
  assert.match(below.note, /NOT critical care/);
});

test('critical-care-time: bad inputs throw; over-subtraction reports a safe note, never a negative unit', () => {
  assert.throws(() => criticalCareTime({ totalMinutes: -1 }), RangeError);
  assert.throws(() => criticalCareTime({ totalMinutes: 'x' }), TypeError);
  const neg = criticalCareTime({ totalMinutes: 10, procedureMinutes: 40 });
  assert.equal(neg.isCriticalCare, false);
  assert.equal(neg.units99292, 0);
});

// ---- 2.3 split-shared -------------------------------------------------------
test('split-shared: names the billing provider and FS modifier under each basis', () => {
  const phys = splitShared({ basis: 'time', physicianTime: 20, nppTime: 15 });
  assert.equal(phys.billingProvider, 'physician');
  assert.equal(phys.fsModifier, true);
  assert.equal(phys.paymentPercent, 100);
  const npp = splitShared({ basis: 'time', physicianTime: 10, nppTime: 25 });
  assert.equal(npp.billingProvider, 'npp');
  assert.equal(npp.paymentPercent, NPP_FEE_PERCENT);
  const mdm = splitShared({ basis: 'mdm', mdmBy: 'npp' });
  assert.equal(mdm.billingProvider, 'npp');
  assert.equal(mdm.paymentPercent, 85);
});

test('split-shared: an exact time tie is flagged, not silently resolved; bad inputs throw', () => {
  const tie = splitShared({ basis: 'time', physicianTime: 15, nppTime: 15 });
  assert.equal(tie.tie, true);
  assert.match(tie.verdict, /exactly evenly/);
  assert.throws(() => splitShared({ basis: 'time', physicianTime: 0, nppTime: 0 }), RangeError);
  assert.throws(() => splitShared({ basis: 'guess' }), TypeError);
  assert.throws(() => splitShared({ basis: 'mdm', mdmBy: 'nobody' }), TypeError);
});

// ---- 2.4 prolonged-services -------------------------------------------------
test('prolonged-services: distinguishes 99417 from G2212 by payer at the threshold', () => {
  // 99205: AMA floor 75, Medicare floor 89.
  assert.equal(prolongedServices({ primaryCode: '99205', totalMinutes: 75, payer: 'ama' }).prolongedCode, '99417');
  assert.equal(prolongedServices({ primaryCode: '99205', totalMinutes: 75, payer: 'ama' }).units, 1);
  const medAt75 = prolongedServices({ primaryCode: '99205', totalMinutes: 75, payer: 'medicare' });
  assert.equal(medAt75.prolongedCode, 'G2212');
  assert.equal(medAt75.units, 0); // below the Medicare 89-minute floor
  assert.equal(prolongedServices({ primaryCode: '99205', totalMinutes: 89, payer: 'medicare' }).units, 1);
  // Each unit is a further 15 minutes.
  assert.equal(prolongedServices({ primaryCode: '99205', totalMinutes: 90, payer: 'ama' }).units, 2);
});

test('prolonged-services: 99215 office and 99223 inpatient floors; below-threshold returns 0 with the divergence stated', () => {
  assert.equal(prolongedServices({ primaryCode: '99215', totalMinutes: 55, payer: 'ama' }).units, 1);
  assert.equal(prolongedServices({ primaryCode: '99215', totalMinutes: 54, payer: 'ama' }).units, 0);
  assert.equal(prolongedServices({ primaryCode: '99223', totalMinutes: 90, payer: 'ama' }).prolongedCode, '99418');
  assert.equal(prolongedServices({ primaryCode: '99223', totalMinutes: 104, payer: 'medicare' }).prolongedCode, 'G0316');
  const below = prolongedServices({ primaryCode: '99215', totalMinutes: 50, payer: 'medicare' });
  assert.equal(below.units, 0);
  assert.match(below.divergence, /AMA 99417 starts at 55 min; Medicare G2212 starts at 69 min/);
});

test('prolonged-services: an unsupported primary code and bad time throw', () => {
  assert.throws(() => prolongedServices({ primaryCode: '99214', totalMinutes: 60, payer: 'ama' }), RangeError);
  assert.throws(() => prolongedServices({ primaryCode: '99205', totalMinutes: -5, payer: 'ama' }), RangeError);
  assert.throws(() => prolongedServices({ primaryCode: '99205', totalMinutes: 80, payer: 'mars' }), TypeError);
});

// ---- 2.5 therapy-units ------------------------------------------------------
test('therapy-units: matches the 8-minute band table at the boundaries (7/8/22/23/52/53)', () => {
  assert.equal(therapyUnits({ rule: 'medicare', totalMinutes: 7 }).units, 0);
  assert.equal(therapyUnits({ rule: 'medicare', totalMinutes: 8 }).units, 1);
  assert.equal(therapyUnits({ rule: 'medicare', totalMinutes: 22 }).units, 1);
  assert.equal(therapyUnits({ rule: 'medicare', totalMinutes: 23 }).units, 2);
  assert.equal(therapyUnits({ rule: 'medicare', totalMinutes: 50 }).units, 3); // 38-52 band
  assert.equal(therapyUnits({ rule: 'medicare', totalMinutes: 52 }).units, 3);
  assert.equal(therapyUnits({ rule: 'medicare', totalMinutes: 53 }).units, 4);
});

test('therapy-units: Rule of Eights diverges from the cumulative rule at pooled remainders', () => {
  // Two 8-minute services: per-service 1+1=2; cumulative 16 min = 1. Diverge.
  const roe = therapyUnits({ rule: 'rule-of-eights', perServiceMinutes: [8, 8] });
  assert.equal(roe.units, 2);
  assert.equal(roe.medicareUnits, 1);
  assert.equal(roe.diverges, true);
  // Two 7-minute services: per-service 0+0=0; cumulative 14 = 1. Diverge the other way.
  const seven = therapyUnits({ rule: 'rule-of-eights', perServiceMinutes: [7, 7] });
  assert.equal(seven.units, 0);
  assert.equal(seven.medicareUnits, 1);
  // A clean multiple-of-15 case agrees.
  const agree = therapyUnits({ rule: 'rule-of-eights', perServiceMinutes: [15, 15] });
  assert.equal(agree.diverges, false);
});

test('therapy-units: bad rule and a missing per-service array throw', () => {
  assert.throws(() => therapyUnits({ rule: 'eights' }), TypeError);
  assert.throws(() => therapyUnits({ rule: 'rule-of-eights', perServiceMinutes: [] }), TypeError);
  assert.throws(() => therapyUnits({ rule: 'medicare', totalMinutes: -1 }), RangeError);
});

// ---- 2.6 anesthesia-units ---------------------------------------------------
test('anesthesia-units: reproduces a (base+time+mod)xCF example and the medical-direction percentage', () => {
  // 5 base + (60/15 = 4) time + 1 mod = 10 units; x $22 = $220; QK 50% = $110.
  const r = anesthesiaUnits({ baseUnits: 5, timeMinutes: 60, modifyingUnits: 1, conversionFactor: 22, medicalDirection: 'qk' });
  assert.equal(r.timeUnits, 4);
  assert.equal(r.totalUnits, 10);
  assert.equal(r.fullPaymentCents, 22000);
  assert.equal(r.directionPercent, 50);
  assert.equal(r.directedPaymentCents, 11000);
  // AA and QZ pay 100%.
  const aa = anesthesiaUnits({ baseUnits: 5, timeMinutes: 60, conversionFactor: 22, medicalDirection: 'aa' });
  assert.equal(aa.directionPercent, 100);
  assert.equal(aa.directedPaymentCents, aa.fullPaymentCents);
});

test('anesthesia-units: AD pays a flat 3 base units, independent of time; default CF is the dated constant', () => {
  const ad = anesthesiaUnits({ baseUnits: 5, timeMinutes: 600, conversionFactor: 22, medicalDirection: 'ad' });
  assert.equal(ad.directionPercent, null);
  assert.equal(ad.directedPaymentCents, Math.round(3 * 22 * 100)); // 3 base units x $22
  assert.equal(MEDICAL_DIRECTION.qx.pct, 50);
  assert.ok(ANESTHESIA_CF_DEFAULT > 0);
});

test('anesthesia-units: time-unit conversion at the 15-minute boundary; bad inputs throw', () => {
  assert.equal(anesthesiaUnits({ baseUnits: 0, timeMinutes: 15, conversionFactor: 20, medicalDirection: 'aa' }).timeUnits, 1);
  assert.equal(anesthesiaUnits({ baseUnits: 0, timeMinutes: 7, conversionFactor: 20, medicalDirection: 'aa' }).timeUnits, 0.5);
  assert.throws(() => anesthesiaUnits({ baseUnits: -1, timeMinutes: 60, conversionFactor: 22, medicalDirection: 'aa' }), RangeError);
  assert.throws(() => anesthesiaUnits({ baseUnits: 5, timeMinutes: 60, conversionFactor: 22, medicalDirection: 'zz' }), TypeError);
});
