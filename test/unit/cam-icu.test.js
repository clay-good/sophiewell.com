// spec-v13 §3.2.3 wave 13-2: CAM-ICU boundary examples per Ely EW,
// et al. JAMA. 2001;286(21):2703-2710. Positive when feature 1 AND
// feature 2 AND (feature 3 OR feature 4).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { camIcu } from '../../lib/scoring-v4.js';

test('cam-icu negative: no features', () => {
  const r = camIcu({ acuteOnsetOrFluctuating: false, inattention: false,
    alteredLoc: false, disorganizedThinking: false });
  assert.equal(r.positive, false);
});

test('cam-icu negative: features 1 + 2 only (algorithm needs 3 or 4)', () => {
  const r = camIcu({ acuteOnsetOrFluctuating: true, inattention: true,
    alteredLoc: false, disorganizedThinking: false });
  assert.equal(r.positive, false);
});

test('cam-icu positive: 1 + 2 + 3', () => {
  const r = camIcu({ acuteOnsetOrFluctuating: true, inattention: true,
    alteredLoc: true, disorganizedThinking: false });
  assert.equal(r.positive, true);
});

test('cam-icu positive: 1 + 2 + 4', () => {
  const r = camIcu({ acuteOnsetOrFluctuating: true, inattention: true,
    alteredLoc: false, disorganizedThinking: true });
  assert.equal(r.positive, true);
});

test('cam-icu negative: 2 + 3 + 4 (missing feature 1)', () => {
  const r = camIcu({ acuteOnsetOrFluctuating: false, inattention: true,
    alteredLoc: true, disorganizedThinking: true });
  assert.equal(r.positive, false);
});
