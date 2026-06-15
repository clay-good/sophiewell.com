// spec-v79 §5 acceptance: claim edits & modifier logic. Each of the five
// decision engines gets >=3 boundary worked examples, including the indicator-0
// bypass gate, the MAI-2 absolute non-payable, the in/out-of-global boundary
// day, the most-specific-X-modifier pick, and a pricing-before-informational
// reorder. (One file, mirroring the v78 billing-v78.test.js precedent.)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ncciPtp, mueCheck, modifierXSelector, globalPeriod, modifierOrder,
  NCCI_ASSOCIATED_MODIFIERS,
} from '../../lib/billing-v79.js';

// ---- 2.1 ncci-ptp -----------------------------------------------------------
test('ncci-ptp: indicator 1 permits an NCCI-associated modifier, rejects a non-associated one', () => {
  const ok = ncciPtp({ codeA: '11042', codeB: '97597', column1: 'a', modifierIndicator: 1, proposedModifier: '59' });
  assert.equal(ok.isEdit, true);
  assert.equal(ok.canBypass, true);
  assert.equal(ok.column1Code, '11042');
  assert.equal(ok.column2Code, '97597');
  assert.equal(ok.proposedIsNcciAssociated, true);
  const bad = ncciPtp({ codeA: '11042', codeB: '97597', column1: 'a', modifierIndicator: 1, proposedModifier: '25' });
  // 25 IS an NCCI-associated modifier (global-surgery group); use a truly non-associated one.
  assert.equal(bad.proposedIsNcciAssociated, true);
  const reallyBad = ncciPtp({ codeA: '11042', codeB: '97597', column1: 'a', modifierIndicator: 1, proposedModifier: '22' });
  assert.equal(reallyBad.proposedIsNcciAssociated, false);
  assert.match(reallyBad.bypassVerdict, /NOT an NCCI-associated modifier/);
});

test('ncci-ptp: indicator 0 is a hard gate -- no modifier can unbundle', () => {
  const r = ncciPtp({ codeA: '80048', codeB: '80053', column1: 'b', modifierIndicator: 0, proposedModifier: '59' });
  assert.equal(r.canBypass, false);
  assert.equal(r.column1Code, '80053');
  assert.match(r.bypassVerdict, /no modifier can unbundle/i);
  assert.match(r.bypassVerdict, /cannot rescue an indicator-0 pair/);
});

test('ncci-ptp: indicator 9 is not an active edit; unknown column explains the rule', () => {
  const r = ncciPtp({ codeA: '99213', codeB: '99214', modifierIndicator: 9 });
  assert.equal(r.isEdit, false);
  assert.equal(r.canBypass, false);
  assert.equal(r.column1Code, null);
  assert.match(r.columnNote, /Column 1 code is the comprehensive/);
});

test('ncci-ptp: bad inputs throw; identical codes rejected; indicator must be 0/1/9', () => {
  assert.throws(() => ncciPtp({ codeA: '11042', codeB: '11042', modifierIndicator: 1 }), RangeError);
  assert.throws(() => ncciPtp({ codeA: '', codeB: '97597', modifierIndicator: 1 }), TypeError);
  assert.throws(() => ncciPtp({ codeA: '11042', codeB: '97597', modifierIndicator: 5 }), RangeError);
  assert.ok(NCCI_ASSOCIATED_MODIFIERS.includes('XU'));
});

// ---- 2.2 mue-check ----------------------------------------------------------
test('mue-check: within the MUE passes with all units payable', () => {
  const r = mueCheck({ unitsBilled: 2, mueValue: 3, mai: 1 });
  assert.equal(r.pass, true);
  assert.equal(r.payableUnits, 2);
  assert.equal(r.unitsAtRisk, 0);
});

test('mue-check: MAI 1 over the value cuts to the limit but the excess is rescuable on a separate line', () => {
  const r = mueCheck({ unitsBilled: 5, mueValue: 3, mai: 1 });
  assert.equal(r.pass, false);
  assert.equal(r.payableUnits, 3);
  assert.equal(r.unitsAtRisk, 2);
  assert.equal(r.rescuable, true);
  assert.match(r.verdict, /SEPARATE line/);
});

test('mue-check: MAI 2 is absolute -- excess never pays and is not rescuable', () => {
  const r = mueCheck({ unitsBilled: 4, mueValue: 1, mai: 2 });
  assert.equal(r.pass, false);
  assert.equal(r.payableUnits, 1);
  assert.equal(r.unitsAtRisk, 3);
  assert.equal(r.rescuable, false);
  assert.match(r.verdict, /never be paid/i);
});

test('mue-check: MAI 3 excess is reviewable with documentation; bad MAI throws', () => {
  const r = mueCheck({ unitsBilled: 10, mueValue: 8, mai: 3 });
  assert.equal(r.rescuable, true);
  assert.match(r.verdict, /REVIEWABLE/);
  assert.throws(() => mueCheck({ unitsBilled: 1, mueValue: 1, mai: 4 }), RangeError);
  assert.throws(() => mueCheck({ unitsBilled: -1, mueValue: 1, mai: 1 }), RangeError);
});

// ---- 2.3 modifier-x-selector ------------------------------------------------
test('modifier-x-selector: picks the most specific X-modifier by XE>XS>XP>XU precedence', () => {
  const r = modifierXSelector({ distinctService: true, separateSite: true });
  assert.equal(r.modifier, 'XS');
  const multi = modifierXSelector({ distinctService: true, separateEncounter: true, separateSite: true });
  assert.equal(multi.modifier, 'XE');
  assert.deepEqual(multi.alsoApply, ['XS']);
});

test('modifier-x-selector: distinct service but no X-subset -> 59 fallback', () => {
  const r = modifierXSelector({ distinctService: true });
  assert.equal(r.modifier, '59');
  assert.match(r.verdict, /most-audited/);
});

test('modifier-x-selector: no distinct-service basis -> hard refusal', () => {
  const r = modifierXSelector({ distinctService: false, separateEncounter: true });
  assert.equal(r.applicable, false);
  assert.equal(r.modifier, null);
  assert.match(r.verdict, /NOT appropriate/);
});

// ---- 2.4 global-period ------------------------------------------------------
test('global-period: a visit inside a 90-day global gets the nature modifier; boundary day is inside', () => {
  const r = globalPeriod({ surgeryDate: '2026-01-01', globalDays: '090', subsequentDate: '2026-02-01', nature: 'unrelated-em' });
  assert.equal(r.insideGlobal, true);
  assert.equal(r.requiredModifier, '24');
  assert.equal(r.windowEnd, '2026-04-01');
  // day 90 exactly is the last day inside
  const lastDay = globalPeriod({ surgeryDate: '2026-01-01', globalDays: '090', subsequentDate: '2026-04-01', nature: 'staged' });
  assert.equal(lastDay.insideGlobal, true);
  assert.equal(lastDay.requiredModifier, '58');
});

test('global-period: day after the window is outside -> bill normally; 000 is day-of-service only', () => {
  const out = globalPeriod({ surgeryDate: '2026-01-01', globalDays: '090', subsequentDate: '2026-04-02', nature: 'unrelated-em' });
  assert.equal(out.insideGlobal, false);
  assert.equal(out.requiredModifier, null);
  assert.match(out.verdict, /Outside the global period/);
  const zero = globalPeriod({ surgeryDate: '2026-01-01', globalDays: '000', subsequentDate: '2026-01-02', nature: 'unrelated-em' });
  assert.equal(zero.insideGlobal, false);
});

test('global-period: related post-op visit is bundled (not payable); return-to-OR gets 78', () => {
  const bundled = globalPeriod({ surgeryDate: '2026-01-01', globalDays: '010', subsequentDate: '2026-01-05', nature: 'related-postop' });
  assert.equal(bundled.insideGlobal, true);
  assert.equal(bundled.separatelyBillable, false);
  assert.equal(bundled.requiredModifier, null);
  const retor = globalPeriod({ surgeryDate: '2026-01-01', globalDays: '090', subsequentDate: '2026-01-10', nature: 'return-to-or' });
  assert.equal(retor.requiredModifier, '78');
});

test('global-period: decision-for-surgery gets 57 (major) on the preop day; XXX gates to no package', () => {
  const dec = globalPeriod({ surgeryDate: '2026-01-02', globalDays: '090', subsequentDate: '2026-01-01', nature: 'decision-for-surgery' });
  assert.equal(dec.requiredModifier, '57');
  const minor = globalPeriod({ surgeryDate: '2026-01-02', globalDays: '010', subsequentDate: '2026-01-02', nature: 'decision-for-surgery' });
  assert.equal(minor.requiredModifier, '25');
  const xxx = globalPeriod({ surgeryDate: '2026-01-01', globalDays: 'XXX', subsequentDate: '2026-02-01', nature: 'unrelated-em' });
  assert.equal(xxx.insideGlobal, false);
  assert.equal(xxx.separatelyBillable, true);
  assert.match(xxx.verdict, /does not apply/);
});

test('global-period: bad dates throw a safe error', () => {
  assert.throws(() => globalPeriod({ surgeryDate: 'nope', globalDays: '090', subsequentDate: '2026-02-01', nature: 'staged' }), RangeError);
  assert.throws(() => globalPeriod({ surgeryDate: 2026, globalDays: '090', subsequentDate: '2026-02-01', nature: 'staged' }), TypeError);
});

// ---- 2.5 modifier-order -----------------------------------------------------
test('modifier-order: pricing modifiers sort before informational ones', () => {
  const r = modifierOrder({ modifiers: ['LT', '26', '59', '50'] });
  // 26 (rank 10) and 50 (rank 20) are pricing; LT and 59 are informational.
  assert.deepEqual(r.sequence, ['26', '50', 'LT', '59']);
  assert.equal(r.ordered[0].class, 'pricing');
  assert.equal(r.ordered[2].class, 'informational');
});

test('modifier-order: flags LT+RT and 26+TC conflicts', () => {
  const lr = modifierOrder({ modifiers: ['LT', 'RT'] });
  assert.ok(lr.conflicts.some((c) => /LT and RT/.test(c)));
  const pt = modifierOrder({ modifiers: ['26', 'TC'] });
  assert.ok(pt.conflicts.some((c) => /global service/.test(c)));
});

test('modifier-order: rejects empty and >4; flags an unrecognized modifier', () => {
  assert.throws(() => modifierOrder({ modifiers: [] }), RangeError);
  assert.throws(() => modifierOrder({ modifiers: ['1', '2', '3', '4', '5'] }), RangeError);
  assert.throws(() => modifierOrder({ modifiers: 'LT' }), TypeError);
  const r = modifierOrder({ modifiers: ['ZZ', '50'] });
  assert.deepEqual(r.unrecognized, ['ZZ']);
  assert.equal(r.sequence[0], '50'); // pricing still leads
});
