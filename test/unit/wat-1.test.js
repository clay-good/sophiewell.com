import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wat1 } from '../../lib/scoring-v4.js';

const zero = {
  looseStools: 0, vomiting: 0, fever: 0,
  sbsStatePositive: 0, tremor: 0, sweating: 0,
  uncoordinatedMovement: 0, yawnSneeze: 0,
  startleToTouch: 0, increasedMuscleTone: 0,
  recoveryMinutes: 0,
};

test('wat-1 0 (tile example, no symptoms) -> no significant withdrawal', () => {
  const r = wat1(zero);
  assert.equal(r.score, 0);
  assert.equal(r.withdrawal, false);
  assert.equal(r.band, 'no significant withdrawal');
});

test('wat-1 2 (sub-threshold) -> no significant withdrawal', () => {
  const r = wat1({ ...zero, looseStools: 1, tremor: 1 });
  assert.equal(r.score, 2);
  assert.equal(r.withdrawal, false);
});

test('wat-1 3 (lower edge) -> iatrogenic withdrawal present', () => {
  const r = wat1({ ...zero, looseStools: 1, tremor: 1, sweating: 1 });
  assert.equal(r.score, 3);
  assert.equal(r.withdrawal, true);
});

test('wat-1 recovery minutes 0 -> 0 points (immediate calm)', () => {
  const r = wat1({ ...zero, recoveryMinutes: 1.5 });
  assert.equal(r.parts.recoveryPoints, 0);
  assert.equal(r.score, 0);
});

test('wat-1 recovery minutes 2-5 -> 1 point', () => {
  const r = wat1({ ...zero, recoveryMinutes: 3 });
  assert.equal(r.parts.recoveryPoints, 1);
  assert.equal(r.score, 1);
});

test('wat-1 recovery minutes >5 -> 2 points', () => {
  const r = wat1({ ...zero, recoveryMinutes: 7 });
  assert.equal(r.parts.recoveryPoints, 2);
  assert.equal(r.score, 2);
});

test('wat-1 12 (all max) -> withdrawal present', () => {
  const r = wat1({
    looseStools: 1, vomiting: 1, fever: 1,
    sbsStatePositive: 1, tremor: 1, sweating: 1,
    uncoordinatedMovement: 1, yawnSneeze: 1,
    startleToTouch: 1, increasedMuscleTone: 1,
    recoveryMinutes: 10,
  });
  assert.equal(r.score, 12);
  assert.equal(r.withdrawal, true);
});

test('wat-1 boundary at exactly 5 minutes -> 1 point', () => {
  const r = wat1({ ...zero, recoveryMinutes: 5 });
  assert.equal(r.parts.recoveryPoints, 1);
});

test('wat-1 boundary at exactly 2 minutes -> 1 point', () => {
  const r = wat1({ ...zero, recoveryMinutes: 2 });
  assert.equal(r.parts.recoveryPoints, 1);
});

test('wat-1 rejects out-of-range items and negative recovery', () => {
  assert.throws(() => wat1({ ...zero, looseStools: 2 }));
  assert.throws(() => wat1({ ...zero, tremor: -1 }));
  assert.throws(() => wat1({ ...zero, recoveryMinutes: -1 }));
});
