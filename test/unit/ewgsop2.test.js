import test from 'node:test';
import assert from 'node:assert/strict';
import { ewgsop2 as e, CUTOFFS, CHAIR_RISE_SECONDS, GAIT_SPEED, SPPB, TUG_SECONDS } from '../../lib/ewgsop2-v880.js';

test('ewgsop2: the published cutoffs', () => {
  assert.deepEqual(CUTOFFS.male, { grip: 27, asm: 20, asmi: 7.0 });
  assert.deepEqual(CUTOFFS.female, { grip: 16, asm: 15, asmi: 5.5 });
  assert.equal(CHAIR_RISE_SECONDS, 15);
  assert.equal(GAIT_SPEED, 0.8);
  assert.equal(SPPB, 8);
  assert.equal(TUG_SECONDS, 20);
});

test('ewgsop2: strength is the entry criterion and nothing substitutes for it', () => {
  // The reason the tile exists: mass and performance without low strength diagnose nothing.
  const massOnly = e({ sex: 'male', gripStrength: 35, asm: 18 });
  assert.equal(massOnly.stage, 'not-met');
  assert.match(massOnly.band, /Muscle strength is the entry criterion/);
  const performanceOnly = e({ sex: 'male', gripStrength: 35, gaitSpeed: 0.5 });
  assert.equal(performanceOnly.stage, 'not-met');
  for (const input of [{}, { sex: 'male', gripStrength: 24 }]) {
    assert.match(e(input).strengthFirstNote, /Strength comes first, not mass/);
  }
});

test('ewgsop2: either strength measure opens the algorithm', () => {
  assert.equal(e({ sex: 'male', gripStrength: 26 }).stage, 'probable');
  assert.equal(e({ sex: 'male', chairRiseSeconds: 16 }).stage, 'probable');
  // The thresholds are strict on both sides.
  assert.equal(e({ sex: 'male', gripStrength: 27 }).stage, 'not-met');
  assert.equal(e({ sex: 'male', chairRiseSeconds: 15 }).stage, 'not-met');
  assert.match(e({ sex: 'male', gripStrength: 26 }).probableNote, /intervention need not wait/);
});

test('ewgsop2: every cutoff is sex-specific', () => {
  // The same grip, two answers.
  assert.equal(e({ sex: 'male', gripStrength: 24 }).stage, 'probable');
  assert.equal(e({ sex: 'female', gripStrength: 24 }).stage, 'not-met');
  // And the mass cutoffs move too.
  assert.equal(e({ sex: 'male', gripStrength: 24, asm: 18 }).stage, 'confirmed');
  assert.equal(e({ sex: 'female', gripStrength: 14, asm: 18 }).stage, 'probable');
  assert.match(e({ sex: 'female' }).sexNote, /below 16 kg/);
  assert.match(e({ sex: 'male' }).sexNote, /below 27 kg/);
  // Anything that is not 'female' reads as male.
  assert.equal(e({}).sex, 'male');
});

test('ewgsop2: quantity confirms, performance grades', () => {
  const base = { sex: 'male', gripStrength: 24 };
  assert.equal(e({ ...base, asm: 18 }).stage, 'confirmed');
  assert.equal(e({ ...base, asmi: 6.5 }).stage, 'confirmed');
  // Performance without quantity does not confirm.
  assert.equal(e({ ...base, gaitSpeed: 0.5 }).stage, 'probable');
  // Each performance route grades an already-confirmed case severe.
  for (const perf of [{ gaitSpeed: 0.8 }, { sppb: 8 }, { tugSeconds: 20 }, { fourHundredMeterWalkFailed: true }]) {
    assert.equal(e({ ...base, asm: 18, ...perf }).stage, 'severe', JSON.stringify(perf));
  }
  assert.match(e({ ...base, asm: 18 }).band, /Performance is what would grade it severe/);
});

test('ewgsop2: performance grades severity, it does not diagnose', () => {
  for (const input of [{}, { sex: 'male', gripStrength: 24 }]) {
    assert.match(e(input).performanceNote, /grades severity; it does not diagnose/);
    assert.match(e(input).findNote, /prompt to measure, not part of the diagnosis/);
  }
});

test('ewgsop2: out-of-range measurements are rejected', () => {
  assert.equal(e({ gripStrength: 151 }).valid, false);
  assert.equal(e({ sppb: 13 }).valid, false);
  assert.equal(e({ gaitSpeed: 6 }).valid, false);
  assert.equal(e({ asmi: 31 }).valid, false);
  assert.equal(e({ gripStrength: 'abc' }).lowStrength, false);
});

test('ewgsop2: the documented example', () => {
  const r = e({ sex: 'male', gripStrength: '24', asm: '18' });
  assert.equal(r.stage, 'confirmed');
  assert.match(r.band, /grip strength of 24 kg, below the male cutoff of 27/);
});
