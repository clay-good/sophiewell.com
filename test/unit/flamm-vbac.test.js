// spec-v139 2.1: Flamm & Geiger VBAC admission score (Obstet Gynecol 1997).
// Five admission factors -> 0-10; predicted VBAC-success bands per the source.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flammVbac } from '../../lib/gyn-v139.js';

test('mid score 5 -> 77% band', () => {
  const r = flammVbac({ ageUnder40: true, vaginalBirth: 'after', reasonNotFtp: false, effacement: 'mid', dilation4: false });
  assert.equal(r.valid, true);
  assert.equal(r.score, 5);
  assert.equal(r.success, 77);
  assert.match(r.band, /5\/10/);
});

test('max score 10 -> 95% band', () => {
  const r = flammVbac({ ageUnder40: true, vaginalBirth: 'beforeAfter', reasonNotFtp: true, effacement: 'gt75', dilation4: true });
  assert.equal(r.score, 10);
  assert.equal(r.success, 95);
});

test('low score 0 -> 49% band', () => {
  const r = flammVbac({ vaginalBirth: 'none', effacement: 'lt25' });
  assert.equal(r.score, 0);
  assert.equal(r.success, 49);
});

test('score 3 -> 60%, score 6 -> 89%', () => {
  // age(2) + before(1) = 3
  assert.equal(flammVbac({ ageUnder40: true, vaginalBirth: 'before', effacement: 'lt25' }).success, 60);
  // age(2) + beforeAfter(4) = 6
  assert.equal(flammVbac({ ageUnder40: true, vaginalBirth: 'beforeAfter', effacement: 'lt25' }).success, 89);
});

test('missing select category -> valid:false', () => {
  assert.equal(flammVbac({ ageUnder40: true }).valid, false);
  assert.equal(flammVbac({ vaginalBirth: 'after' }).valid, false);
});
