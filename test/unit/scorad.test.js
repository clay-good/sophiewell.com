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

test('all-zero -> SCORAD 0 mild', () => {
  const r = scorad({});
  assert.equal(r.score, 0);
  assert.equal(r.oscorad, 0);
  assert.equal(r.bandLabel, 'Mild');
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
