import { test } from 'node:test';
import assert from 'node:assert/strict';
import { race } from '../../lib/scoring-v4.js';

const min = { facialPalsy: 0, armMotor: 0, legMotor: 0, gaze: 0, languageAgnosia: 0 };

test('race 0 (tile example) -> LVO less likely', () => {
  const r = race(min);
  assert.equal(r.score, 0);
  assert.equal(r.lvoLikely, false);
  assert.equal(r.band, 'LVO less likely');
});

test('race 4 (just below LVO threshold) -> LVO less likely', () => {
  const r = race({ facialPalsy: 1, armMotor: 1, legMotor: 1, gaze: 0, languageAgnosia: 1 });
  assert.equal(r.score, 4);
  assert.equal(r.lvoLikely, false);
});

test('race 5 (LVO threshold per Pérez de la Ossa 2014) -> LVO likely', () => {
  const r = race({ facialPalsy: 2, armMotor: 2, legMotor: 0, gaze: 1, languageAgnosia: 0 });
  assert.equal(r.score, 5);
  assert.equal(r.lvoLikely, true);
  assert.equal(r.band, 'LVO likely');
});

test('race 9 (maximum) -> LVO likely', () => {
  const r = race({ facialPalsy: 2, armMotor: 2, legMotor: 2, gaze: 1, languageAgnosia: 2 });
  assert.equal(r.score, 9);
  assert.equal(r.lvoLikely, true);
});

test('race text mentions Pérez de la Ossa 2014', () => {
  assert.match(race(min).text, /Pérez de la Ossa 2014/);
  assert.match(race({ ...min, facialPalsy: 2, armMotor: 2, gaze: 1 }).text, /Pérez de la Ossa 2014/);
});

test('race parts mirror input', () => {
  const r = race({ facialPalsy: 1, armMotor: 2, legMotor: 0, gaze: 1, languageAgnosia: 1 });
  assert.equal(r.parts.facialPalsy, 1);
  assert.equal(r.parts.armMotor, 2);
  assert.equal(r.parts.gaze, 1);
  assert.equal(r.score, 5);
});

test('race rejects out-of-range and non-integer', () => {
  assert.throws(() => race({ ...min, facialPalsy: 3 }));
  assert.throws(() => race({ ...min, gaze: 2 }));
  assert.throws(() => race({ ...min, armMotor: -1 }));
  assert.throws(() => race({ ...min, legMotor: 1.5 }));
  assert.throws(() => race({ ...min, languageAgnosia: NaN }));
});
