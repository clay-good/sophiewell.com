// spec-v246: worked examples for the IBD / GI activity indices. Point systems
// spec-v97 verified (Walmsley 1998; Turner 2007; Lai 2009; Hennes/IAIHG 2008).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sccai, pucai, bbpsBoston, simplifiedAih } from '../../lib/ibd-v246.js';

test('sccai: >= 5 active', () => {
  const r = sccai({ freqDay: 2, freqNight: 1, urgency: 1, blood: 1, wellbeing: 1, extracolonic: 0 });
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
});
test('sccai: < 5 remission', () => {
  assert.equal(sccai({ freqDay: 1, blood: 1 }).abnormal, false);
});

test('pucai: moderate band', () => {
  const r = pucai({ pain: 5, bleeding: 10, consistency: 5, number: 10, nocturnal: 0, activity: 5 });
  assert.equal(r.score, 35);
  assert.match(r.band, /moderate/);
});
test('pucai: remission below 10', () => {
  assert.equal(pucai({ pain: 5 }).abnormal, false);
});

test('bbps: >= 6 adequate', () => {
  const r = bbpsBoston({ right: 2, transverse: 2, left: 2 });
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, false);
});
test('bbps: < 6 inadequate', () => {
  assert.equal(bbpsBoston({ right: 1, transverse: 2, left: 1 }).abnormal, true);
});

test('simplified-aih: >= 6 probable', () => {
  const r = simplifiedAih({ autoantibody: 2, igg: 1, histology: 2, viralAbsent: true });
  assert.equal(r.score, 6);
  assert.match(r.band, /probable/);
});
test('simplified-aih: >= 7 definite', () => {
  const r = simplifiedAih({ autoantibody: 2, igg: 2, histology: 2, viralAbsent: true });
  assert.equal(r.score, 7);
  assert.match(r.band, /definite/);
});
