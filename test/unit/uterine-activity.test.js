// spec-v1439: tachysystole (>5 per 10 min averaged over 30 min, ACOG via Frey 2014) and Montevideo units.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uterineActivity as ua } from '../../lib/uterine-activity-v1439.js';

test('averaged over 30 minutes: more than 5 is tachysystole, exactly 5 is not', () => {
  assert.equal(ua({ w1: 5, w2: 5, w3: 5 }).tachysystole, false);
  assert.equal(ua({ w1: 6, w2: 5, w3: 5 }).tachysystole, true); // 5.33
  assert.equal(ua({ w1: 7, w2: 4, w3: 4 }).tachysystole, false); // one busy window is not the average
  assert.equal(ua({ w1: 6, w2: 6, w3: 6 }).mean, 6);
});

test('Montevideo units: count x (average peak - tone), compared with 200', () => {
  const r = ua({ w1: 4, w2: 4, w3: 4, mvuCount: 4, peak: 65, tone: 15 });
  assert.equal(r.mvu, 200);
  assert.match(r.band, /not above the 200/);
  assert.match(ua({ w1: 4, w2: 4, w3: 4, mvuCount: 5, peak: 60, tone: 15 }).band, /225 \(5 x 45 mmHg above tone\), above the 200/);
});

test('Montevideo inputs are all or nothing, and a blank set is named', () => {
  assert.match(ua({ w1: 4, w2: 4, w3: 4, peak: 60 }).message, /enter all three/);
  assert.ok(ua({ w1: 4, w2: 4, w3: 4 }).notes.some((n) => /No intrauterine pressure values were entered/.test(n)));
  assert.match(ua({ w1: 4, w2: 4, w3: 4, mvuCount: 4, peak: 10, tone: 20 }).message, /below the baseline tone/);
});

test('every answer carries the partial-assessment caveat', () => {
  assert.ok(ua({ w1: 3, w2: 3, w3: 3 }).notes.some((n) => /partial assessment/.test(n)));
});

test('a missing window is asked for; impossible counts are refused', () => {
  assert.match(ua({ w1: 4, w2: 4 }).message, /Enter the contractions counted in the third 10-minute window/);
  assert.equal(ua({ w1: 4.5, w2: 4, w3: 4 }).valid, false);
  assert.equal(ua({ w1: 40, w2: 4, w3: 4 }).valid, false);
});
