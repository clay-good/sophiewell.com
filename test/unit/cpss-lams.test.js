import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpss, lams } from '../../lib/scoring-v4.js';

// ---- CPSS (Kothari 1999) -------------------------------------------------

test('cpss all-normal (tile example) -> negative screen', () => {
  const r = cpss({ facialDroop: 0, armDrift: 0, abnormalSpeech: 0 });
  assert.equal(r.positive, false);
  assert.equal(r.band, 'negative screen');
  assert.equal(r.abnormalCount, 0);
});

test('cpss single abnormal item -> positive screen', () => {
  const r = cpss({ facialDroop: 1, armDrift: 0, abnormalSpeech: 0 });
  assert.equal(r.positive, true);
  assert.equal(r.abnormalCount, 1);
  assert.equal(r.band, 'positive screen');
});

test('cpss all three abnormal -> positive screen', () => {
  const r = cpss({ facialDroop: 1, armDrift: 1, abnormalSpeech: 1 });
  assert.equal(r.positive, true);
  assert.equal(r.abnormalCount, 3);
});

test('cpss text mentions Kothari 1999', () => {
  assert.match(cpss({ facialDroop: 0, armDrift: 0, abnormalSpeech: 0 }).text, /Kothari 1999/);
  assert.match(cpss({ facialDroop: 1, armDrift: 0, abnormalSpeech: 0 }).text, /Kothari 1999/);
});

test('cpss rejects non-binary, non-integer, and missing inputs', () => {
  assert.throws(() => cpss({ facialDroop: 2, armDrift: 0, abnormalSpeech: 0 }));
  assert.throws(() => cpss({ facialDroop: -1, armDrift: 0, abnormalSpeech: 0 }));
  assert.throws(() => cpss({ facialDroop: 0.5, armDrift: 0, abnormalSpeech: 0 }));
  assert.throws(() => cpss({ facialDroop: 0, armDrift: 0 }));
});

// ---- LAMS (Llanes 2004; Nazliel 2008) ------------------------------------

test('lams 0 (tile example) -> LVO less likely', () => {
  const r = lams({ facialDroop: 0, armDrift: 0, gripStrength: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.lvoLikely, false);
  assert.equal(r.band, 'LVO less likely');
});

test('lams 3 (just below LVO threshold) -> LVO less likely', () => {
  const r = lams({ facialDroop: 1, armDrift: 1, gripStrength: 1 });
  assert.equal(r.score, 3);
  assert.equal(r.lvoLikely, false);
});

test('lams 4 (LVO threshold per Nazliel 2008) -> LVO likely', () => {
  const r = lams({ facialDroop: 0, armDrift: 2, gripStrength: 2 });
  assert.equal(r.score, 4);
  assert.equal(r.lvoLikely, true);
  assert.equal(r.band, 'LVO likely');
});

test('lams 5 (maximum) -> LVO likely', () => {
  const r = lams({ facialDroop: 1, armDrift: 2, gripStrength: 2 });
  assert.equal(r.score, 5);
  assert.equal(r.lvoLikely, true);
});

test('lams text mentions Nazliel 2008 LVO threshold', () => {
  assert.match(lams({ facialDroop: 1, armDrift: 2, gripStrength: 2 }).text, /Nazliel 2008/);
});

test('lams rejects out-of-range and non-integer inputs', () => {
  assert.throws(() => lams({ facialDroop: 2, armDrift: 0, gripStrength: 0 }));
  assert.throws(() => lams({ facialDroop: 0, armDrift: 3, gripStrength: 0 }));
  assert.throws(() => lams({ facialDroop: 0, armDrift: 0, gripStrength: -1 }));
  assert.throws(() => lams({ facialDroop: 0, armDrift: 1.5, gripStrength: 0 }));
  assert.throws(() => lams({ facialDroop: 0, armDrift: NaN, gripStrength: 0 }));
});
