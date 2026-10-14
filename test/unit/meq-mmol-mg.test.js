// spec-v1629 tool 5: milligrams, millimoles, milliequivalents and milliosmoles.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meqMmolMg as mq } from '../../lib/meq-mmol-mg-v1629.js';

const meq = (mg, formula, valence) => Math.round(mq({ quantity: mg, unit: 'mg', formula, valence }).mEq * 100) / 100;

// The label figures in the comments were read on DailyMed on October 10, 2026; the tool prints only
// its own arithmetic until label rows can be withheld when a label changes (spec-v1628 section 1).
test('the arithmetic lands on the figures four FDA labels print', () => {
  assert.equal(meq(600, 'KCl', 1), 8.05); // Klor-Con: "600 mg (8 mEq)"
  assert.equal(meq(750, 'KCl', 1), 10.06); // "750 mg (10 mEq)"
  assert.equal(meq(1500, 'KCl', 1), 20.12);
  assert.equal(meq(540, 'K3C6H5O7.H2O', 3), 4.99); // Urocit-K: "5 mEq (540 mg)"
  assert.equal(meq(1080, 'K3C6H5O7.H2O', 3), 9.99); // "10 mEq (1080 mg)"
  assert.equal(meq(84, 'NaHCO3', 1), 1); // "84 mg is equal to one milliequivalent"
  assert.equal(meq(650, 'NaHCO3', 1), 7.74);
  assert.equal(meq(300, 'Li2CO3', 2), 8.12); // lithium oral solution: 8 mEq per 300 mg of lithium carbonate
});

test('calcium chloride dihydrate uses the hydrate\'s weight with valence 2', () => {
  const r = mq({ quantity: 1000, unit: 'mg', formula: 'CaCl2.2H2O', valence: 2, volumeMl: 500 });
  assert.equal(r.mmol, 6.80235); // 1000 / 147.008, not / 110.978
  assert.equal(r.mEq, 13.6047);
  assert.equal(r.mEqPerL, 27.2094);
  assert.match(r.notes.join(' '), /normality 0\.0272094 N/);
});

test('a blank valence gives mmol only, never an assumed 1', () => {
  const r = mq({ quantity: 1000, unit: 'mg', formula: 'CaCl2.2H2O' });
  assert.equal(r.valid, true);
  assert.equal(r.mEq, null);
  assert.equal(r.mmol, 6.80235);
  assert.match(r.notes.join(' '), /No valence was entered, so no milliequivalents are given\. It is not assumed to be 1/);
  assert.doesNotMatch(r.band, /mEq/);
  assert.match(mq({ quantity: 20, unit: 'mEq', formula: 'KCl' }).message, /needs the valence.*not assumed to be 1/);
});

test('every unit can be the starting one, and milliosmoles are marked ideal', () => {
  const fromMeq = mq({ quantity: 20, unit: 'mEq', formula: 'KCl', valence: 1, particles: 2 });
  assert.equal(fromMeq.mg, 1490.96);
  assert.equal(fromMeq.mOsmIdeal, 40);
  assert.match(fromMeq.band, /mOsm \(ideal\)/);
  assert.match(fromMeq.notes.join(' '), /A real solution measures lower/);
  assert.equal(mq({ quantity: 20, unit: 'mmol', molecularWeight: 74.548 }).mg, 1490.96);
  assert.equal(mq({ quantity: 40, unit: 'mOsm', formula: 'KCl', particles: 2 }).mmol, 20);
  assert.match(mq({ quantity: 40, unit: 'mOsm', formula: 'KCl' }).message, /needs the number of particles/);
  assert.equal(mq({ quantity: 20, unit: 'mmol', molecularWeight: 74.548 }).mOsmIdeal, null);
});

test('refusals', () => {
  assert.match(mq({}).message, /Choose the unit/);
  assert.match(mq({ unit: 'mg' }).message, /Enter the quantity/);
  assert.match(mq({ quantity: 5, unit: 'mg' }).message, /either the formula or the molecular weight/);
  assert.match(mq({ quantity: 5, unit: 'mg', formula: 'KCl', molecularWeight: 74.5 }).message, /not both and not neither/);
  assert.match(mq({ quantity: 5, unit: 'mg', formula: 'kcl' }).message, /lowercase/);
  assert.match(mq({ quantity: 5, unit: 'mg', formula: 'KCl', valence: 1.5 }).message, /valence is a whole number/);
  assert.match(mq({ quantity: 5, unit: 'mg', formula: 'KCl', valence: 0 }).message, /between 1 and 12/);
});

// spec-v1629 tool 5, label anchors: the label's own line beside the computed one.
import { LABEL_CHECKS } from '../../lib/meq-mmol-mg-v1629.js';
const lrow = (label, extra = {}) => ({ label, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-13', validThrough: '2027-10-13', ...extra });
const LT = Object.fromEntries(LABEL_CHECKS.map((c) => [c.setId, lrow(c.brand)]));
const LNOW = new Date('2026-10-13T12:00:00Z');

test('label check: the label line is added and the arithmetic is unchanged', () => {
  const plain = mq({ quantity: 600, unit: 'mg', formula: 'KCl', valence: 1 });
  const r = mq({ quantity: 600, unit: 'mg', formula: 'KCl', valence: 1, labelCheck: 'potassium-chloride' }, LNOW, LT);
  assert.deepEqual([r.mEq, r.mmol, r.band], [plain.mEq, plain.mmol, plain.band]);
  assert.match(r.notes.join(' '), /600 mg or 750 mg of potassium chloride equivalent to 8 mEq or 10 mEq/);
  assert.equal(plain.labelLinks, undefined);
  assert.equal(r.lithiumSolutionMl, undefined);
  assert.equal(mq({ quantity: 600, unit: 'mg', formula: 'KCl', labelCheck: 'calcium' }, LNOW, LT).valid, false);
});

test('label check: lithium carbonate gives the oral-solution volume by the label\'s conversion', () => {
  const li = (quantity) => mq({ quantity, unit: 'mg', formula: 'Li2CO3', valence: 2, labelCheck: 'lithium-carbonate' }, LNOW, LT);
  assert.deepEqual([li(300).lithiumSolutionMl, li(150).lithiumSolutionMl, li(600).lithiumSolutionMl, li(450).lithiumSolutionMl], [5, 2.5, 10, 7.5]);
  // 8.12 mEq computed; the volume is the label's 5 mL, not 5.08 mL.
  assert.equal(Math.round(li(300).mEq * 100) / 100, 8.12);
});

test('label check: a superseded label withholds the line and the volume, not the arithmetic', () => {
  const c = LABEL_CHECKS.find((x) => x.value === 'lithium-carbonate');
  const r = mq({ quantity: 300, unit: 'mg', formula: 'Li2CO3', valence: 2, labelCheck: 'lithium-carbonate' }, LNOW, { ...LT, [c.setId]: lrow('lithium', { supersededOn: '2026-11-01' }) });
  assert.deepEqual([r.valid, r.labelWithheld, r.lithiumSolutionMl], [true, true, undefined]);
  assert.doesNotMatch(r.notes.join(' '), /Table 2/);
  assert.ok(r.mEq > 8);
});
