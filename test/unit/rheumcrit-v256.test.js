// spec-v256: worked examples for the rheumatology + critical-care tools. Point
// systems / formulas spec-v97 verified (Heuft-Dorenbosch 2003; IMACS MMT-8; Adnet
// 1997; Yang & Tobin 1991).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { masesEnthesitis, mmt8, intubationDifficultyScale, cropIndex } from '../../lib/rheumcrit-v256.js';

test('mases: >= 1 enthesitis', () => {
  const r = masesEnthesitis({ cc1R: true, cc1L: true, psisR: true });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
});
test('mases: none', () => {
  const r = masesEnthesitis({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('mmt8: sum 0-80', () => {
  const r = mmt8({ neck: 8, deltoid: 8, biceps: 8, wrist: 8, glutMax: 8, glutMed: 8, quad: 8, ankle: 8 });
  assert.equal(r.score, 64);
});

test('ids: slight-to-moderate', () => {
  const r = intubationDifficultyScale({ extraAttempts: 1, cormack: 2 }); // 1 + 1
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, true);
});
test('ids: easy at 0', () => {
  const r = intubationDifficultyScale({ cormack: 1 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('crop: favors extubation', () => {
  const r = cropIndex({ compliance: 50, pimax: 30, pao2: 80, fio2: 0.4, paco2: 40, rr: 20 });
  assert.equal(r.score, 25.2);
  assert.equal(r.abnormal, false);
});
test('crop: below threshold', () => {
  const r = cropIndex({ compliance: 20, pimax: 20, pao2: 60, fio2: 0.5, paco2: 45, rr: 30 });
  assert.ok(r.score < 13);
  assert.equal(r.abnormal, true);
});

// spec-v1217: `lvl` substituted 0 for a grade off the scale, so an impossible
// count scored as the most favourable one and the reading said nothing.
test('IDS: an impossible operator count is refused, not scored as zero', () => {
  const base = { extraAttempts: 1, extraOperators: 1, altTechniques: 0, cormack: '2' };
  const good = intubationDifficultyScale(base);
  assert.equal(good.valid, true);
  assert.equal(good.score, 3);
  for (const bad of [99, -1, 1e6]) {
    const r = intubationDifficultyScale({ ...base, extraOperators: bad });
    assert.equal(r.valid, false, `${bad} operators must not score`);
    assert.match(r.message, /operators beyond the first must be between 0 and 10/);
    // views/group-v256.js render() prints `message` (spec-v1212).
    assert.equal(r.band, r.message);
  }
  // Each of the three counts guards its own scale, and N1's is 20 not 10.
  assert.equal(intubationDifficultyScale({ ...base, extraAttempts: 20 }).valid, true);
  assert.match(intubationDifficultyScale({ ...base, extraAttempts: 21 }).message, /attempts beyond the first/);
  assert.match(intubationDifficultyScale({ ...base, altTechniques: 11 }).message, /alternative techniques/);
});

test('MMT-8: a grade off the 0-10 scale is refused, not read as the weakest', () => {
  const full = { neck: 10, deltoid: 10, biceps: 10, wrist: 10, glutMax: 10, glutMed: 10, quad: 10, ankle: 10 };
  assert.equal(mmt8(full).score, 80);
  const r = mmt8({ ...full, neck: 99 });
  assert.equal(r.valid, false);
  assert.match(r.message, /neck flexors must be between 0 and 10/);
  assert.equal(r.band, r.message);
  // A real 0 is a real grade and still scores.
  assert.equal(mmt8({ ...full, neck: 0 }).score, 70);
});
