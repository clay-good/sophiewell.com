// spec-v147 2.3: 2010 ACR/EULAR RA classification (Aletaha 2010). Entry
// condition gates; four domains 0-10; >=6 = definite RA.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acrEular2010Ra } from '../../lib/rheum-v147.js';

test('entry condition not met -> criteria not applicable, no score', () => {
  const r = acrEular2010Ra({ joints: 'over10', serology: 'high', acutePhase: 'abnormal', duration: 'over6' });
  assert.equal(r.valid, true);
  assert.equal(r.applicable, false);
  assert.equal(r.abnormal, false);
  assert.equal(r.score, undefined);
});

test('tile example: 5+0+0+1 = 6 -> definite RA (>=6 flip)', () => {
  const r = acrEular2010Ra({ entry: true, joints: 'over10', serology: 'negative', acutePhase: 'normal', duration: 'over6' });
  assert.equal(r.applicable, true);
  assert.equal(r.score, 6);
  assert.equal(r.bandLabel, 'Definite RA');
  assert.equal(r.abnormal, true);
});

test('score 5 -> not classified (just below threshold)', () => {
  // 1-3 small joints (2) + low serology (2) + abnormal (1) + <6 weeks (0) = 5
  const r = acrEular2010Ra({ entry: true, joints: 'small1to3', serology: 'low', acutePhase: 'abnormal', duration: 'under6' });
  assert.equal(r.score, 5);
  assert.equal(r.bandLabel, 'Not classified');
  assert.equal(r.abnormal, false);
});

test('ceiling 10', () => {
  const r = acrEular2010Ra({ entry: true, joints: 'over10', serology: 'high', acutePhase: 'abnormal', duration: 'over6' });
  assert.equal(r.score, 10);
});

test('entry met but a domain blank -> complete-the-fields', () => {
  const r = acrEular2010Ra({ entry: true, joints: 'over10', serology: 'negative', acutePhase: 'normal' });
  assert.equal(r.valid, false);
  assert.match(r.message, /symptom duration/);
});
