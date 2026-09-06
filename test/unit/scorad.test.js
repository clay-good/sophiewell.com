// spec-v151 2.3: SCORAD (European Task Force 1993). SCORAD = A/5 + 7B/2 + C;
// A extent %0-100, B six items 0-3 (0-18), C two VAS 0-10 (0-20). Range 0-103;
// oSCORAD = A/5 + 7B/2. Bands mild <25, moderate 25-50, severe >50.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scorad } from '../../lib/derm-v151.js';

test('tile example: A/5 + 7B/2 + C composite -> 42 (oSCORAD 34) moderate', () => {
  // A=30 -> 6; B=2+1+1+2+1+1=8 -> 7×8/2=28; C=5+3=8; SCORAD=42; oSCORAD=34.
  const r = scorad({ extent: 30, erythema: 2, edema: 1, oozing: 1, excoriation: 2, lichenification: 1, dryness: 1, pruritus: 5, sleeplessness: 3 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 42);
  assert.equal(r.oscorad, 34);
  assert.equal(r.bandLabel, 'Moderate');
});

// spec-v1016: this asserted the defect. The extent (A) is a measurement and a
// fifth of the score, so with no extent there is no severity to read -- an
// uncharted extent is not clear skin. A charted extent of 0 with no intensity
// still scores 0 and bands mild, which is the reading this test meant.
test('a missing extent has no severity; a charted zero is mild', () => {
  const missing = scorad({});
  assert.equal(missing.valid, false);
  assert.equal(missing.score, null);
  assert.match(missing.band, /Enter the extent/);

  const charted = scorad({ extent: 0 });
  assert.equal(charted.score, 0);
  assert.equal(charted.oscorad, 0);
  assert.equal(charted.bandLabel, 'Mild');
});

test('mild/moderate boundary at 25 and moderate/severe at 50', () => {
  // A=50 -> 10; B=0; C=15 -> SCORAD 25 (moderate, inclusive)
  const at25 = scorad({ extent: 50, pruritus: 10, sleeplessness: 5 });
  assert.equal(at25.score, 25);
  assert.equal(at25.bandLabel, 'Moderate');
  // SCORAD 50 stays moderate; >50 severe
  const at50 = scorad({ extent: 100, erythema: 3, edema: 3, oozing: 0, excoriation: 0, lichenification: 0, dryness: 0, pruritus: 0, sleeplessness: 9 });
  // A=100->20; B=6 ->21; C=9 -> 50 moderate
  assert.equal(at50.score, 50);
  assert.equal(at50.bandLabel, 'Moderate');
});

test('max all = 103 severe', () => {
  const r = scorad({ extent: 100, erythema: 3, edema: 3, oozing: 3, excoriation: 3, lichenification: 3, dryness: 3, pruritus: 10, sleeplessness: 10 });
  // A=100->20; B=18 ->63; C=20 -> 103
  assert.equal(r.score, 103);
  assert.equal(r.bandLabel, 'Severe');
});

test('oSCORAD drops the subjective C items', () => {
  const r = scorad({ extent: 30, erythema: 2, edema: 1, oozing: 1, excoriation: 2, lichenification: 1, dryness: 1, pruritus: 10, sleeplessness: 10 });
  assert.equal(r.oscorad, 34); // unchanged by C
  assert.equal(r.score, 54); // 34 + 20
});

// spec-v1093: the subjective half reads a blank VAS as a symptom the patient
// denies. C is worth up to 20 of the 103, so an unasked pruritus score moved
// this tile from severe to moderate with nothing said.
//
// The extent (A) already refuses without a value (spec-v1016); this is the other
// half. Unlike the intensity items -- selects, which open on 0 and are never
// blank -- the two VAS fields are number inputs, so the gap is expressible on
// both surfaces.
test('spec-v1093: a SCORAD scored without the subjective half says so', () => {
  const objective = {
    extent: 40, erythema: 2, edema: 2, oozing: 2,
    excoriation: 2, lichenification: 2, dryness: 2,
  };
  const both = scorad({ ...objective, pruritus: 7, sleeplessness: 3 });
  assert.equal(both.footing, null, 'both asked, nothing to disclose');

  const oneOnly = scorad({ ...objective, pruritus: 7 });
  assert.match(oneOnly.footing, /Scored from 1 of 2 subjective scores; sleeplessness was not entered/);

  // Neither asked is the worst case, and it discloses too.
  const neither = scorad(objective);
  assert.match(neither.footing, /Scored from 0 of 2 subjective scores/);
  assert.match(neither.footing, /pruritus and sleeplessness were not entered/);

  // A patient who reports no itch is not a patient nobody asked.
  assert.equal(scorad({ ...objective, pruritus: 0, sleeplessness: 0 }).footing, null);

  // The band really does move on the subjective half.
  assert.ok(both.score > neither.score);
});
