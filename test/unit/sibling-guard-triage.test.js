// spec-v1237: the probe this programme's own waves refilled.
//
// `scripts/probe-unguarded-sibling.mjs` asks, within one library module, whether
// one exported function refuses an impossible measurement while a sibling that
// reads the same kind of number does not -- on the premise that "a module is
// written by one hand at one sitting, so this is rarely a considered
// difference".
//
// It was drained to zero at spec-v1210. Thirteen waves of spec-v1224 to
// spec-v1236 put 14 modules and 22 functions back into it, by guarding exactly
// the functions the envelope probe named and their siblings not at all.
//
// Three of those 22 were never unguarded: `fornsIndex`, `lokIndex` and
// `nafldFibrosis` compare against `BOUNDS.platelets.max` DIRECTLY, with a
// message that explains the x1000 unit confusion better than any helper's
// sentence. The probe watched six helper NAMES and the question is "does this
// function refuse an impossible measurement", which a direct comparison answers
// too -- the same drift its own `GUARDS` comment warns about, one level up.
//
// Of the rest, four were real and are guarded here. The others have no envelope
// to apply, and the four whose absence a future reader would most likely "fix"
// wrongly now say so in the code -- because a false flag invites a fix to a
// correct tile.
import test from 'node:test';
import assert from 'node:assert/strict';

import { torontoHccRisk } from '../../lib/hcc-surveillance-v281.js';
import { bardScore, fattyLiverIndex } from '../../lib/hep-v124.js';
import { salicylateToxicity } from '../../lib/tox-v86.js';
import { iomGwg } from '../../lib/ob-v138.js';
import { lipi } from '../../lib/risk-scores-v215.js';
import { vasograde } from '../../lib/stroke-risk-v217.js';
import { BOUNDS } from '../../lib/bounds.js';

test('toronto-hcc-risk refuses the platelet count its sibling already refused', () => {
  const T = { age: 60, sex: 'male', etiology: 'hcv', platelets: 150 };
  assert.match(torontoHccRisk({ ...T, platelets: 20000 }).message, /^Platelet count .* must be between 0 and 2000/);
  assert.match(torontoHccRisk({ ...T, age: 900 }).message, /^Age \(years\) must be/);
  assert.equal(torontoHccRisk(T).valid, true);
  // A blank field is still asked for, in the tile's own words.
  assert.match(torontoHccRisk({ sex: 'male', etiology: 'hcv', platelets: 150 }).message, /^Enter age, sex/);
});

test('the two fatty-liver scores refuse a BMI past the envelope', () => {
  assert.match(bardScore({ bmi: 9999, ast: 60, alt: 40 }).message, /body mass index/);
  assert.equal(bardScore({ bmi: 30, ast: 60, alt: 40 }).total, 3);
  assert.match(fattyLiverIndex({ tg: 150, bmi: 9999, ggt: 40, waist: 95 }).message, /body mass index/);
  assert.equal(fattyLiverIndex({ tg: 150, bmi: 30, ggt: 40, waist: 95 }).valid, true);
  // AST, ALT, triglycerides, GGT and waist have no entry in the table and are
  // deliberately unbounded here; the tile must still score from them.
  assert.equal(bardScore({ bmi: 30, ast: 6000, alt: 40 }).valid, true);
  assert.equal(fattyLiverIndex({ tg: 5000, bmi: 30, ggt: 4000, waist: 200 }).valid, true);
});

test('salicylate reads its pH envelope from the table rather than a second copy', () => {
  assert.match(salicylateToxicity({ level: 45, unit: 'mgdl', pH: 7.1 }).recommendation, /Hemodialysis recommended/);
  // The two ends are BOUNDS.pH's, so a pH outside it adds no criterion.
  const outside = salicylateToxicity({ level: 45, unit: 'mgdl', pH: BOUNDS.pH.min });
  assert.doesNotMatch(String(outside.criteria || []), /arterial pH/);
  assert.equal(BOUNDS.pH.min, 6.5);
  assert.equal(BOUNDS.pH.max, 8);
});

// The deliberate absences. Each of these reads a number the shared table also
// names, and each must NOT be bounded by it -- these assertions are the record
// that the silence was decided rather than missed.
test('the tiles with no envelope still answer from the values that look bounded', () => {
  // Pounds and inches, not kilograms and metres.
  assert.equal(iomGwg({ weight: 150, height: 65 }).valid, true);
  // The unit is unstated by design ("same units"), so a unit-specific envelope
  // cannot be applied. The caller's own cap of 1000 is what bounds it.
  assert.equal(lipi({ anc: 6, wbc: 9, ldhHigh: false }).valid, true);
  assert.equal(lipi({ anc: 6, wbc: 90000, ldhHigh: false }).valid, false);
  // Graded scales bound themselves.
  assert.equal(vasograde({ modifiedFisher: 4, wfns: 5 }).valid, true);
  assert.match(vasograde({ modifiedFisher: 9, wfns: 5 }).message, /./);
});
