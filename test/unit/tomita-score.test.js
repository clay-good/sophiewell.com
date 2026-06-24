// spec-v146 2.3: Tomita Surgical Strategy Score (Tomita 2001). Three factors sum
// 2-10; bands 2-3 wide/marginal, 4-5 marginal/intralesional, 6-7 palliative,
// 8-10 supportive/terminal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tomitaScore } from '../../lib/spine-v146.js';

test('floor 2 -> wide/marginal excision', () => {
  const r = tomitaScore({ primary: 'slow', visceral: 'none', bone: 'solitary' }); // 1+0+1 = 2
  assert.equal(r.valid, true);
  assert.equal(r.score, 2);
  assert.equal(r.bandLabel, 'Wide / marginal excision');
  assert.equal(r.abnormal, false);
});

test('total 3 -> wide/marginal; 4 -> marginal/intralesional (3->4 flip)', () => {
  const r3 = tomitaScore({ primary: 'moderate', visceral: 'none', bone: 'solitary' }); // 2+0+1 = 3
  assert.equal(r3.score, 3);
  assert.equal(r3.bandLabel, 'Wide / marginal excision');
  const r4 = tomitaScore({ primary: 'moderate', visceral: 'none', bone: 'multiple' }); // 2+0+2 = 4
  assert.equal(r4.score, 4);
  assert.equal(r4.bandLabel, 'Marginal / intralesional excision');
});

test('total 5 -> marginal; 6 -> palliative (5->6 flip, abnormal)', () => {
  const r5 = tomitaScore({ primary: 'moderate', visceral: 'treatable', bone: 'solitary' }); // 2+2+1 = 5
  assert.equal(r5.score, 5);
  assert.equal(r5.bandLabel, 'Marginal / intralesional excision');
  assert.equal(r5.abnormal, false);
  const r6 = tomitaScore({ primary: 'rapid', visceral: 'none', bone: 'multiple' }); // 4+0+2 = 6
  assert.equal(r6.score, 6);
  assert.equal(r6.bandLabel, 'Palliative surgery');
  assert.equal(r6.abnormal, true);
});

test('ceiling 10 -> supportive/terminal', () => {
  const r = tomitaScore({ primary: 'rapid', visceral: 'untreatable', bone: 'multiple' }); // 4+4+2 = 10
  assert.equal(r.score, 10);
  assert.equal(r.bandLabel, 'Supportive / terminal care');
});

test('blank factor -> complete-the-fields fallback', () => {
  const r = tomitaScore({ primary: 'rapid', visceral: 'untreatable' });
  assert.equal(r.valid, false);
  assert.match(r.message, /bone metastases/);
});
