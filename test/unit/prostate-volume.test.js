// spec-v130 2.1: prostate volume, prolate ellipsoid (Terris & Stamey 1991).
// volume = AP x TR x CC x 0.52, dimensions in cm, volume in cc; > 30 cc enlarged.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prostateVolume } from '../../lib/uro-v130.js';

test('ellipsoid volume from three dimensions', () => {
  const r = prostateVolume({ ap: 4, tr: 5, cc: 4 });
  assert.equal(r.valid, true);
  assert.equal(r.volume, 41.6); // 4*5*4*0.52 = 41.6
  assert.equal(r.abnormal, true); // > 30 cc
  assert.match(r.band, /enlarged/);
});

test('small gland is not flagged enlarged (BPH threshold)', () => {
  const r = prostateVolume({ ap: 2.5, tr: 3, cc: 3 });
  assert.equal(r.volume, 11.7); // 2.5*3*3*0.52
  assert.equal(r.abnormal, false);
  assert.match(r.band, /non-enlarged/);
});

test('any blank dimension -> valid:false; scalar -> valid:false', () => {
  assert.equal(prostateVolume({ ap: 4, tr: 5 }).valid, false);
  assert.equal(prostateVolume(7).valid, false);
  assert.equal(prostateVolume({ ap: 0, tr: 5, cc: 4 }).valid, false);
});
