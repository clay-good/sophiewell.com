// spec-v211 2.4: IMPROVEDD VTE worked examples. 7 IMPROVE items + D-dimer >=2ULN
// (+2); total 0-14; low 0-1, moderate 2-3, high >=4; >=2 = prophylaxis-discussion
// threshold. Weights spec-v97 cross-verified (Gibson 2017 + IMPROVE derivation).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { improvedd } from '../../lib/heme-onc-risk-v211.js';

test('high-risk worked example (IMPROVEDD 7)', () => {
  const r = improvedd({ previousVte: true, cancer: true, dDimer: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 7); // 3 + 2 + 2
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high VTE risk/);
});

test('moderate-risk case (2-3)', () => {
  const r = improvedd({ ageOver60: true, immobilization: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /moderate/);
});

test('low-risk case (0-1)', () => {
  const r = improvedd({ ageOver60: true });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low VTE risk/);
});

test('D-dimer adds 2 points on top of the IMPROVE items', () => {
  const base = { cancer: true };
  assert.equal(improvedd(base).score, 2);
  assert.equal(improvedd({ ...base, dDimer: true }).score, 4);
});

test('maximum score 14', () => {
  const r = improvedd({ previousVte: true, thrombophilia: true, paralysis: true, cancer: true, immobilization: true, icu: true, ageOver60: true, dDimer: true });
  assert.equal(r.score, 14);
});

test('no factors -> IMPROVEDD 0, low risk', () => {
  const r = improvedd({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});
