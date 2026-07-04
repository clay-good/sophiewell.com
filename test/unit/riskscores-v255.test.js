// spec-v255: worked examples for the risk & severity scores. Point systems spec-v97
// verified (Vasquez 2010; Trubiano 2020; Harris 1969; Koivuranta 1997).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vcss, penFast, harrisHipScore, koivurantaPonv } from '../../lib/riskscores-v255.js';

test('vcss: sum of attributes', () => {
  const r = vcss({ pain: 2, varicose: 2, edema: 1, pigmentation: 1, inflammation: 1 });
  assert.equal(r.score, 7);
});

test('pen-fast: >= 3 not low risk', () => {
  const r = penFast({ recent: true, anaphylaxis: true }); // 2 + 2
  assert.equal(r.score, 4);
  assert.equal(r.abnormal, true);
});
test('pen-fast: < 3 low risk', () => {
  const r = penFast({ treatment: true }); // 1
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
});

test('harris-hip: good band', () => {
  const r = harrisHipScore({ pain: 40, function: 40, deformity: 4, rom: 5 }); // 89
  assert.equal(r.score, 89);
  assert.match(r.band, /good/);
});
test('harris-hip: poor below 70', () => {
  const r = harrisHipScore({ pain: 20, function: 30, deformity: 4, rom: 5 }); // 59
  assert.equal(r.score, 59);
  assert.equal(r.abnormal, true);
});

test('koivuranta: 3 factors ~54%', () => {
  const r = koivurantaPonv({ female: true, priorPonv: true, nonSmoker: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /54%/);
});
test('koivuranta: zero factors', () => {
  const r = koivurantaPonv({});
  assert.equal(r.score, 0);
  assert.match(r.band, /17%/);
});
