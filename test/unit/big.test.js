import { test } from 'node:test';
import assert from 'node:assert/strict';
import { big } from '../../lib/scoring-v4.js';

test('big BD 0, INR 1, GCS 15 -> 2.5; below threshold', () => {
  const r = big({ baseDeficit: 0, inr: 1, gcs: 15 });
  assert.equal(r.score, 2.5);
  assert.equal(r.highMortalityRisk, false);
});

test('big BD 8, INR 2, GCS 8 -> 20; high risk', () => {
  const r = big({ baseDeficit: 8, inr: 2, gcs: 8 });
  assert.equal(r.score, 8 + 5 + 7);
  assert.equal(r.highMortalityRisk, true);
  assert.match(r.band, /high predicted mortality \(score from Borgman 2011; cutoff of 16 from Davis 2015\)/);
});

test('big boundary 16 -> high risk', () => {
  const r = big({ baseDeficit: 6, inr: 2, gcs: 10 });
  assert.equal(r.score, 6 + 5 + 5);
  assert.equal(r.highMortalityRisk, true);
});

test('big rejects out-of-range GCS', () => {
  assert.throws(() => big({ baseDeficit: 0, inr: 1, gcs: 2 }));
});

// spec-v1041 guarded the base deficit. spec-v1146: it guarded ONE of the three
// terms, and the required-field sweep beside it only ever cleared that one.
test('big: a blank INR or GCS is absent, not zero', () => {
  // The defect, stated: a blank INR contributed 2.5 x 0 and a blank GCS
  // contributed 15 - 0, and the tile printed "BIG 0.0: below the threshold".
  for (const missing of [{ inr: null }, { gcs: null }, { inr: '' }, { gcs: '' }]) {
    const r = big({ baseDeficit: 0, inr: 1, gcs: 15, ...missing });
    assert.equal(r.incomplete, true, JSON.stringify(missing));
    assert.equal(r.score, null);
    assert.match(r.band, /BIG is at least/);
  }
  // It names which terms are missing, by the words on the labels.
  assert.match(big({ baseDeficit: 0, inr: null, gcs: 15 }).band, /Enter the INR/);
  assert.match(big({ baseDeficit: 0, inr: 1, gcs: null }).band, /Enter the GCS/);
  assert.match(big({ baseDeficit: null, inr: null, gcs: null }).band,
    /Enter the base deficit, the INR and the GCS/);
});

test('big: what IS entered is a floor, and a floor at or above 16 still rules in', () => {
  // The score rises with every term, so a partial total can carry the
  // high-mortality reading and never the reassuring one (rule 3).
  const ruledIn = big({ baseDeficit: null, inr: 4, gcs: 8 });   // 10 + 7 = 17
  assert.equal(ruledIn.incomplete, true);
  assert.equal(ruledIn.highMortalityRisk, true);
  assert.match(ruledIn.band, />=16/);
  const below = big({ baseDeficit: null, inr: 1, gcs: 15 });    // 2.5 + 0
  assert.equal(below.highMortalityRisk, null);
  assert.match(below.band, /BIG is at least 2.5 from the INR and the GCS/);
});

test('big: a typed 0 is still an answer', () => {
  // spec-v1406: an INR of 0 is below the envelope and refuses; the typed 0 here is the base deficit.
  const r = big({ baseDeficit: 0, inr: 1, gcs: 15 });
  assert.equal(r.incomplete, undefined);
  assert.equal(r.score, 2.5);
});

test('spec-v1747: a base deficit past the sourced envelope is refused, not read as below the threshold', () => {
  assert.throws(() => big({ baseDeficit: -1e6, inr: 1.2, gcs: 15 }), /plausible range for base deficit/);
  assert.ok(Number.isFinite(big({ baseDeficit: 40, inr: 1.2, gcs: 15 }).score));
});

test('spec-v1754: big refuses a fractional GCS; 3, 15 and the worked example answer', () => {
  const ex = { baseDeficit: 0, inr: 1, gcs: 15 };
  for (const gcs of [12.5, '12.5']) {
    assert.throws(() => big({ ...ex, gcs }), (e) => e instanceof RangeError && /whole number/.test(e.message));
  }
  for (const gcs of [3, 15]) assert.notEqual(big({ ...ex, gcs }).score, null);
  assert.notEqual(big(ex).score, null);
});
