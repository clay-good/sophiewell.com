// spec-v146 2.1: SINS - Spinal Instability Neoplastic Score (Fisher 2010). Six
// components sum 0-18; bands 0-6 stable, 7-12 indeterminate, 13-18 unstable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sinsScore } from '../../lib/spine-v146.js';

const base = { location: 'mobile', pain: 'mechanical', lesion: 'mixed', alignment: 'normal', collapse: 'none', posterolateral: 'none' };

test('total 6 -> stable (boundary)', () => {
  const r = sinsScore(base); // 2+3+1+0+0+0 = 6
  assert.equal(r.valid, true);
  assert.equal(r.score, 6);
  assert.equal(r.bandLabel, 'Stable');
  assert.equal(r.abnormal, false);
});

test('total 7 -> indeterminate (6->7 flip)', () => {
  const r = sinsScore({ ...base, lesion: 'lytic' }); // 2+3+2+0+0+0 = 7
  assert.equal(r.score, 7);
  assert.equal(r.bandLabel, 'Indeterminate');
  assert.equal(r.abnormal, true);
});

test('total 12 -> indeterminate; 13 -> unstable (12->13 flip)', () => {
  const r12 = sinsScore({ location: 'junctional', pain: 'mechanical', lesion: 'lytic', alignment: 'deformity', collapse: 'under50', posterolateral: 'none' }); // 3+3+2+2+2+0 = 12
  assert.equal(r12.score, 12);
  assert.equal(r12.bandLabel, 'Indeterminate');
  const r13 = sinsScore({ location: 'junctional', pain: 'mechanical', lesion: 'lytic', alignment: 'deformity', collapse: 'over50', posterolateral: 'none' }); // 3+3+2+2+3+0 = 13
  assert.equal(r13.score, 13);
  assert.equal(r13.bandLabel, 'Unstable');
  assert.equal(r13.abnormal, true);
});

test('ceiling 18', () => {
  const r = sinsScore({ location: 'junctional', pain: 'mechanical', lesion: 'lytic', alignment: 'subluxation', collapse: 'over50', posterolateral: 'bilateral' });
  assert.equal(r.score, 18);
});

test('blank component -> complete-the-fields fallback, never a partial total', () => {
  const r = sinsScore({ ...base, posterolateral: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /posterolateral/);
});
