// spec-v144 2.3: Danis-Weber ankle classification (Weber 1972, AO-adopted).
// Type by distal-fibula level vs the syndesmosis; the B -> C flip is the
// suprasyndesmotic instability boundary.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weberAnkle } from '../../lib/ortho-v144.js';

test('blank -> complete-the-fields fallback', () => {
  assert.equal(weberAnkle({}).valid, false);
});

test('below the syndesmosis -> Type A, stable', () => {
  const r = weberAnkle({ level: 'below' });
  assert.equal(r.classification, 'A');
  assert.equal(r.abnormal, false);
});

test('at the level -> Type B (assess medial side)', () => {
  const r = weberAnkle({ level: 'at' });
  assert.equal(r.classification, 'B');
  assert.match(r.band, /medial side|stress/i);
});

test('B -> C suprasyndesmotic flip to unstable', () => {
  assert.equal(weberAnkle({ level: 'at' }).abnormal, false);    // B
  const c = weberAnkle({ level: 'above' });
  assert.equal(c.classification, 'C');
  assert.equal(c.abnormal, true);                               // C unstable
  assert.match(c.band, /suprasyndesmotic/);
});
