// spec-v726: Insomnia Severity Index (ISI).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isi } from '../../lib/isi-v726.js';

const ALL = (n) => ({ fallingAsleep: String(n), stayingAsleep: String(n), wakingEarly: String(n), dissatisfaction: String(n), noticeable: String(n), worried: String(n), interference: String(n) });

test('all-zero -> 0, none', () => {
  const r = isi(ALL(0));
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'none');
  assert.equal(r.abnormal, false);
});

test('maximum is 28 -> severe', () => {
  const r = isi(ALL(4));
  assert.equal(r.score, 28);
  assert.equal(r.tier, 'severe');
});

test('worked example sums to 16 -> moderate', () => {
  const r = isi({ fallingAsleep: '3', stayingAsleep: '3', wakingEarly: '2', dissatisfaction: '2', noticeable: '2', worried: '2', interference: '2' });
  assert.equal(r.score, 16);
  assert.equal(r.tier, 'moderate');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /ISI 16 of 28/);
});

test('bands: 0-7 none, 8-14 subthreshold, 15-21 moderate, 22-28 severe', () => {
  assert.equal(isi(ALL(1)).tier, 'none');          // 7
  assert.equal(isi({ ...ALL(1), fallingAsleep: '2' }).tier, 'subthreshold'); // 8
  assert.equal(isi(ALL(2)).tier, 'subthreshold');  // 14
  assert.equal(isi(ALL(3)).tier, 'moderate');      // 21
  assert.equal(isi({ ...ALL(3), interference: '4' }).tier, 'severe'); // 22
});

test('the 15 cut is moderate (>=15 flagged)', () => {
  // 14 subthreshold, 15 moderate
  const fourteen = isi(ALL(2)); // 14
  assert.equal(fourteen.score, 14);
  assert.equal(fourteen.tier, 'subthreshold');
  assert.equal(fourteen.abnormal, false);
  const fifteen = isi({ ...ALL(2), fallingAsleep: '3' }); // 15
  assert.equal(fifteen.score, 15);
  assert.equal(fifteen.tier, 'moderate');
  assert.equal(fifteen.abnormal, true);
});

test('items require an integer 0-4; required', () => {
  assert.equal(isi({}).valid, false);
  assert.equal(isi({}).code, 'MISSING_INPUT');
  assert.equal(isi({ ...ALL(2), worried: '5' }).valid, false);
});
