// spec-v81 §5 acceptance: drug & infusion billing. Each of the three engines
// gets >=3 boundary worked examples, including the JZ/JW/multi-dose gate, the
// fractional-unit rounding boundary, the least-waste vial search, and the
// chemo + therapeutic + hydration + push hierarchy encounter. One file,
// mirroring the billing-v80.test.js precedent.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ndcHcpcsUnits, drugWastage, infusionHierarchy,
  JZ_REQUIRED_DATE, INFUSION_PUSH_FLOOR_MIN,
} from '../../lib/billing-v81.js';

// ---- 2.1 ndc-hcpcs-units ----------------------------------------------------
test('ndc-hcpcs-units: dose / billing-unit with the rounding rule and the non-multiple flag', () => {
  // 35 mg against a 10 mg unit = 3.5 -> 4 units rounded up; flagged non-multiple.
  const r = ndcHcpcsUnits({ dose: 35, doseUnit: 'mg', unitSize: 10, unitUnit: 'mg', rounding: 'up' });
  assert.equal(r.exactUnits, 3.5);
  assert.equal(r.billingUnits, 4);
  assert.equal(r.isCleanMultiple, false);
  // A clean multiple does not flag.
  const clean = ndcHcpcsUnits({ dose: 40, doseUnit: 'mg', unitSize: 10, unitUnit: 'mg' });
  assert.equal(clean.billingUnits, 4);
  assert.equal(clean.isCleanMultiple, true);
  // Rounding rules diverge on the 3.5 boundary.
  assert.equal(ndcHcpcsUnits({ dose: 35, doseUnit: 'mg', unitSize: 10, unitUnit: 'mg', rounding: 'down' }).billingUnits, 3);
  assert.equal(ndcHcpcsUnits({ dose: 35, doseUnit: 'mg', unitSize: 10, unitUnit: 'mg', rounding: 'nearest' }).billingUnits, 4);
});

test('ndc-hcpcs-units: cross-unit mass conversion (mcg/g) and family/bad-input guards', () => {
  // 700 mcg against a 0.5 mg unit: 0.7 mg / 0.5 mg = 1.4 -> 2 units up.
  const r = ndcHcpcsUnits({ dose: 700, doseUnit: 'mcg', unitSize: 0.5, unitUnit: 'mg', rounding: 'up' });
  assert.equal(r.exactUnits, 1.4);
  assert.equal(r.billingUnits, 2);
  // A unit measured in international units cannot divide a milligram dose.
  assert.throws(() => ndcHcpcsUnits({ dose: 5, doseUnit: 'units', unitSize: 10, unitUnit: 'mg' }), RangeError);
  assert.throws(() => ndcHcpcsUnits({ dose: -1, doseUnit: 'mg', unitSize: 10, unitUnit: 'mg' }), RangeError);
  assert.throws(() => ndcHcpcsUnits({ dose: 5, doseUnit: 'mg', unitSize: 0, unitUnit: 'mg' }), RangeError);
  assert.throws(() => ndcHcpcsUnits({ dose: 5, doseUnit: 'pints', unitSize: 10, unitUnit: 'mg' }), TypeError);
});

// ---- 2.2 drug-wastage -------------------------------------------------------
test('drug-wastage: single-dose partial use -> JW, full use -> JZ, multi-dose -> refusal', () => {
  // 35 mg from a 50 mg single-dose vial, 10 mg unit: 4 admin, 5 total, 1 JW.
  const jw = drugWastage({ vialSize: 50, dose: 35, doseUnit: 'mg', unitSize: 10, unitUnit: 'mg', vialType: 'single' });
  assert.equal(jw.administeredUnits, 4);
  assert.equal(jw.totalUnits, 5);
  assert.equal(jw.discardedUnits, 1);
  assert.equal(jw.modifier, 'JW');
  // Full use of the vial -> zero waste -> JZ.
  const jz = drugWastage({ vialSize: 50, dose: 50, doseUnit: 'mg', unitSize: 10, unitUnit: 'mg', vialType: 'single' });
  assert.equal(jz.discardedUnits, 0);
  assert.equal(jz.modifier, 'JZ');
  assert.ok(jz.note.includes(JZ_REQUIRED_DATE));
  // Multi-dose vial: JW does not apply, no waste billed.
  const multi = drugWastage({ vialSize: 50, dose: 35, doseUnit: 'mg', unitSize: 10, unitUnit: 'mg', vialType: 'multi' });
  assert.equal(multi.eligibleForJW, false);
  assert.equal(multi.discardedUnits, 0);
  assert.equal(multi.modifier, null);
});

test('drug-wastage: dose exceeding one vial draws whole vials; least-waste vial search', () => {
  // 120 mg, 50 mg single-dose vials, 10 mg unit: 3 vials (150 mg = 15 units),
  // 12 admin, 3 discarded.
  const r = drugWastage({ vialSize: 50, dose: 120, doseUnit: 'mg', unitSize: 10, unitUnit: 'mg', vialType: 'single' });
  assert.equal(r.vialsUsed, 3);
  assert.equal(r.totalUnits, 15);
  assert.equal(r.administeredUnits, 12);
  assert.equal(r.discardedUnits, 3);
  // Least-waste: 35 mg from {50, 20, 10} sizes -> 20+20 = 40 mg, 5 mg waste.
  const lw = drugWastage({
    vialSize: 50, dose: 35, doseUnit: 'mg', unitSize: 10, unitUnit: 'mg', vialType: 'single',
    availableVialSizes: [50, 20, 10],
  });
  assert.equal(lw.leastWaste.totalAmount, 40);
  assert.equal(lw.leastWaste.wasteAmount, 5);
});

// ---- 2.3 infusion-hierarchy -------------------------------------------------
test('infusion-hierarchy: chemo+therapeutic+hydration+push -> chemo infusion is initial by hierarchy, not chronology', () => {
  const r = infusionHierarchy({
    administrations: [
      { type: 'hydration', minutes: 60 },              // given first on the clock
      { type: 'therapeutic-infusion', minutes: 60 },
      { type: 'chemo-infusion', minutes: 90 },         // given last, but ranks first
      { type: 'therapeutic-push', minutes: 0 },
    ],
  });
  assert.equal(r.initialCode, '96413');                // chemo infusion initial
  assert.equal(r.initialKind, 'chemo-infusion');
  const byIndex = (i) => r.lines.find((l) => l.index === i);
  assert.equal(byIndex(2).role, 'initial');
  assert.equal(byIndex(1).code, '96367');              // therapeutic sequential
  assert.equal(byIndex(0).code, '96361');              // hydration sequential
  assert.equal(byIndex(3).role, 'additional-push');
  assert.equal(byIndex(3).code, '96375');
});

test('infusion-hierarchy: category dominates mode; sub-16-min infusion reclassifies to a push; additional hours', () => {
  // chemo PUSH outranks a therapeutic INFUSION (category beats mode).
  const r1 = infusionHierarchy({ administrations: [
    { type: 'therapeutic-infusion', minutes: 60 }, { type: 'chemo-push', minutes: 0 },
  ] });
  assert.equal(r1.initialCode, '96409');               // chemo push initial
  // A 10-minute therapeutic infusion is reported as a push, not an infusion.
  const r2 = infusionHierarchy({ administrations: [{ type: 'therapeutic-infusion', minutes: 10 }] });
  assert.equal(r2.lines[0].reclassified, true);
  assert.equal(r2.lines[0].mode, 'push');
  assert.equal(r2.initialCode, '96374');               // therapeutic push initial
  assert.ok(INFUSION_PUSH_FLOOR_MIN === 16);
  // A 150-minute initial chemo infusion adds one additional-hour unit (96415).
  const r3 = infusionHierarchy({ administrations: [{ type: 'chemo-infusion', minutes: 150 }] });
  assert.equal(r3.lines[0].addOnCode, '96415');
  assert.equal(r3.lines[0].addOnUnits, 1);
});

test('infusion-hierarchy: empty / non-array / bad-type guards throw', () => {
  assert.throws(() => infusionHierarchy({ administrations: [] }), RangeError);
  assert.throws(() => infusionHierarchy({ administrations: 1 }), TypeError);
  assert.throws(() => infusionHierarchy({ administrations: [{ type: 'iv-drip', minutes: 30 }] }), TypeError);
});
