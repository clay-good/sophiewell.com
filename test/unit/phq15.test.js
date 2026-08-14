// spec-v734: PHQ-15 somatic symptom severity.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { phq15 } from '../../lib/phq15-v734.js';

const ITEMS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15'];
const all = (v) => Object.fromEntries(ITEMS.map((k) => [k, v]));

test('all twos -> 30, high', () => {
  const r = phq15(all('2'));
  assert.equal(r.valid, true);
  assert.equal(r.score, 30);
  assert.equal(r.tier, 'high');
  assert.equal(r.abnormal, true);
});

test('worked example: six 2s -> 12, medium', () => {
  const r = phq15({ q1: '2', q2: '2', q3: '2', q4: '2', q5: '2', q6: '2', q7: '0', q8: '0', q9: '0', q10: '0', q11: '0', q12: '0', q13: '0', q14: '0', q15: '0' });
  assert.equal(r.score, 12);
  assert.equal(r.tier, 'medium');
  assert.match(r.band, /PHQ-15 12 of 30 /);
  assert.match(r.band, /medium somatic symptom severity \(10-14\)/);
});

test('the band edges: 4 minimal, 5 low, 9 low, 10 medium, 14 medium, 15 high', () => {
  const mk = (n) => { const o = all('0'); for (let i = 0; i < n; i++) o[ITEMS[i]] = '1'; return phq15(o); };
  assert.equal(mk(4).tier, 'minimal');
  assert.equal(mk(5).tier, 'low');
  assert.equal(mk(9).tier, 'low');
  assert.equal(mk(10).tier, 'medium');
  assert.equal(mk(10).abnormal, true);
  assert.equal(mk(14).tier, 'medium');
  assert.equal(mk(15).tier, 'high');
});

test('all zeros -> 0, minimal, not abnormal', () => {
  const r = phq15(all('0'));
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'minimal');
  assert.equal(r.abnormal, false);
});

test('items require an integer 0-2; all required', () => {
  assert.equal(phq15({}).valid, false);
  assert.equal(phq15({}).code, 'MISSING_INPUT');
  assert.equal(phq15({ ...all('1'), q15: '3' }).valid, false);
  assert.equal(phq15({ ...all('1'), q15: '' }).field, 'q15');
});
