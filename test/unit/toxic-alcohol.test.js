// spec-v86 §2.3: osmolar gap + AACT fomepizole-indication boundary examples.
// Osmolality: Smithline N, Gardner KD. JAMA. 1976;236(14):1594-1597.
// Indication: Barceloux DG, et al (AACT) methanol/ethylene-glycol guidelines.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toxicAlcohol } from '../../lib/tox-v86.js';

test('ethanol-corrected calculated osmolality and signed osmolar gap', () => {
  const r = toxicAlcohol({ measuredOsm: 305, sodium: 140, glucose: 90, bun: 14, ethanol: 0, recentIngestion: true });
  // 2*140 + 90/18 + 14/2.8 + 0 = 290; gap = 305 - 290 = 15
  assert.equal(r.calcOsm, 290);
  assert.equal(r.osmolarGap, 15);
  assert.equal(r.indicated, true);
  assert.match(r.limbsText, /recent-ingestion/);
});

test('ethanol term reduces the gap (correction applied)', () => {
  const r = toxicAlcohol({ measuredOsm: 305, sodium: 140, glucose: 90, bun: 14, ethanol: 37 });
  // adds 37/3.7 = 10 to the calc, so calc 300, gap 5
  assert.equal(r.calcOsm, 300);
  assert.equal(r.osmolarGap, 5);
});

test('documented level over 20 mg/dL -> fomepizole indicated', () => {
  const r = toxicAlcohol({ measuredOsm: 290, sodium: 140, glucose: 90, bun: 14, knownLevel: 25 });
  assert.equal(r.indicated, true);
  assert.match(r.limbsText, /over 20 mg\/dL/);
});

test('strong suspicion with 2 of 3 supportive features -> indicated', () => {
  // pH 7.1 (<7.3), bicarb 15 (<20), small gap (not >10) -> 2 of 3
  const r = toxicAlcohol({ measuredOsm: 295, sodium: 140, glucose: 90, bun: 14, pH: 7.1, bicarbonate: 15, strongSuspicion: true });
  assert.equal(r.indicated, true);
  assert.match(r.limbsText, /strong suspicion/);
});

test('negative osmolar gap is reported signed, not clamped', () => {
  const r = toxicAlcohol({ measuredOsm: 280, sodium: 145, glucose: 90, bun: 14 });
  // calc ~ 2*145 + 5 + 5 = 300; gap = 280 - 300 = -20
  assert.ok(r.osmolarGap < 0);
  assert.equal(r.indicated, false);
});

test('normal-gap-does-not-exclude caveat is surfaced', () => {
  const r = toxicAlcohol({ measuredOsm: 290, sodium: 140, glucose: 90, bun: 14 });
  assert.match(r.note, /does not exclude/i);
  assert.match(r.note, /anion gap/i);
});

test('missing osmolality or sodium returns null', () => {
  assert.equal(toxicAlcohol({ sodium: 140 }), null);
  assert.equal(toxicAlcohol({ measuredOsm: 290 }), null);
});

// --- spec-v1103: the two chemistry terms the library was defaulting to zero ---

test('an omitted glucose does not manufacture an osmolar gap', () => {
  const withLabs = toxicAlcohol({ measuredOsm: 300, sodium: 140, glucose: 180, bun: 28, recentIngestion: true });
  // 2*140 + 180/18 + 28/2.8 = 300, so the gap is 0 and nothing is indicated.
  assert.equal(withLabs.osmolarGap, 0);
  assert.equal(withLabs.indicated, false);

  // Drop the glucose and the calculated osmolality falls by 10, which is the
  // whole "gap over 10" limb. It must ask, not answer.
  const r = toxicAlcohol({ measuredOsm: 300, sodium: 140, bun: 28, recentIngestion: true });
  assert.equal(r.valid, false);
  assert.deepEqual(r.missing, ['a glucose']);
  assert.match(r.band, /Enter a glucose/);
  assert.equal(r.indicated, undefined);
  assert.equal(r.osmolarGap, undefined);
});

test('an omitted BUN does not manufacture an osmolar gap', () => {
  const r = toxicAlcohol({ measuredOsm: 300, sodium: 140, glucose: 180, recentIngestion: true });
  assert.equal(r.valid, false);
  assert.deepEqual(r.missing, ['a BUN']);
  assert.match(r.band, /Enter a BUN/);
});

test('both missing are named together, and the refusal says why', () => {
  const r = toxicAlcohol({ measuredOsm: 300, sodium: 140, recentIngestion: true });
  assert.equal(r.valid, false);
  assert.deepEqual(r.missing, ['a glucose', 'a BUN']);
  assert.match(r.band, /Enter a glucose and a BUN/);
  assert.match(r.band, /calculated osmolality/);
});

test('a typed zero is a measurement, not a gap (rule 1)', () => {
  // spec-v1211: a glucose of 0 and a BUN of 0 are now OUTSIDE the envelopes
  // lib/bounds.js declares (glucose 5-2000, BUN 1-300), so this no longer
  // computes -- but the property the test exists for is unchanged and is now
  // asserted directly: a typed 0 is read as a value the reader ENTERED and
  // judged on its merits, never as a field they left blank. The two produce
  // different sentences.
  const zero = toxicAlcohol({ measuredOsm: 300, sodium: 140, glucose: 0, bun: 0, recentIngestion: true });
  assert.match(zero.band, /glucose in mg\/dL must be between 5 and 2000/);
  const blank = toxicAlcohol({ measuredOsm: 300, sodium: 140, bun: 14, recentIngestion: true });
  assert.match(blank.band, /Enter a glucose/);
  assert.notEqual(zero.band, blank.band);
});

test('the smallest survivable glucose and BUN still compute a gap', () => {
  const r = toxicAlcohol({ measuredOsm: 300, sodium: 140, glucose: 5, bun: 1, recentIngestion: true });
  assert.equal(r.valid, undefined);
  assert.equal(r.indicated, true);
});

test('the ethanol stays optional and still defaults out', () => {
  const r = toxicAlcohol({ measuredOsm: 300, sodium: 140, glucose: 180, bun: 28 });
  assert.equal(r.calcOsm, 300);
  assert.match(r.note, /Ethanol defaults to 0/);
});

// spec-v1211: the osmolar gap is measured MINUS calculated, and sodium, glucose
// and BUN are the three terms of the calculated side. An impossible term drives
// the gap far negative and CLOSES the limb that turns on "gap over 10".
test('an impossible sodium used to erase the fomepizole indication', () => {
  const real = toxicAlcohol({ measuredOsm: 330, sodium: 140, glucose: 90, bun: 14, recentIngestion: true });
  assert.match(real.band, /Fomepizole indicated/);
  const bad = toxicAlcohol({ measuredOsm: 330, sodium: 2000, glucose: 90, bun: 14, recentIngestion: true });
  assert.equal(bad.valid, false);
  assert.match(bad.band, /serum sodium in mEq\/L must be between 90 and 200/);
  assert.ok(!/No AACT fomepizole indication/.test(bad.band), 'must not rule out the antidote from an impossible sodium');
});

test('the top of the sodium envelope still answers', () => {
  const r = toxicAlcohol({ measuredOsm: 330, sodium: 200, glucose: 90, bun: 14, recentIngestion: true });
  assert.notEqual(r.valid, false);
});

test('an impossible glucose is refused the same way', () => {
  const r = toxicAlcohol({ measuredOsm: 330, sodium: 140, glucose: 20000, bun: 14, recentIngestion: true });
  assert.match(r.band, /glucose in mg\/dL must be between 5 and 2000/);
});

test('a blank glucose is still asked for, not reported out of range', () => {
  // spec-v1103's branch, and spec-v1207's rule: the check runs after it.
  const r = toxicAlcohol({ measuredOsm: 330, sodium: 140, bun: 14, recentIngestion: true });
  assert.match(r.band, /Enter a glucose/);
});

// spec-v1212: `views/group-v12.js` read these four OPTIONAL fields with
// `Number(input.value)`, and Number('') is 0 -- so a blank pH arrived as a
// measured 0 and spec-v1211's envelope refused the tile's own worked example.
// The library half of the contract: a blank optional field is null, and null is
// not a measurement.
test('a blank optional field is null, and the example still computes', () => {
  const r = toxicAlcohol({
    measuredOsm: 305, sodium: 140, glucose: 90, bun: 14, recentIngestion: true,
    ethanol: null, pH: null, bicarbonate: null, knownLevel: null,
  });
  assert.equal(r.calcOsm, 290);
  assert.equal(r.osmolarGap, 15);
  assert.equal(r.indicated, true);
});

test('a pH of 0 is a measurement, and is refused', () => {
  // The other side of the same line: 0 entered deliberately is not a blank.
  const r = toxicAlcohol({
    measuredOsm: 305, sodium: 140, glucose: 90, bun: 14, recentIngestion: true, pH: 0,
  });
  assert.equal(r.valid, false);
  assert.match(r.band, /arterial pH must be between 6.5 and 8/);
});
