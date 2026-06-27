// spec-v160 2.2: DAPSA (Schoels 2016). TJC68 + SJC66 + global + pain + CRP(mg/dL).
// Cutoffs: remission <=4, low 5-14, moderate 15-28, high >28.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dapsa } from '../../lib/rheum-v160.js';

test('tile example: moderate activity', () => {
  // 5 + 3 + 4 + 4 + 1.2 = 17.2 -> moderate (15-28)
  const r = dapsa({ tjc68: 5, sjc66: 3, global: 4, pain: 4, crp: 1.2 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 17.2);
  assert.equal(r.bandLabel, 'Moderate disease activity');
});

test('CRP is mg/dL - an mg/L value would inflate the score ~10x', () => {
  // CRP 1.0 mg/dL contributes 1.0; the same sample as 10 mg/L would (wrongly) add 10.
  const correct = dapsa({ tjc68: 2, sjc66: 1, global: 1, pain: 1, crp: 1.0 });
  assert.equal(correct.score, 6); // remission/low boundary region
  const wrongUnit = dapsa({ tjc68: 2, sjc66: 1, global: 1, pain: 1, crp: 10 });
  assert.equal(wrongUnit.score, 15); // demonstrates the inflation; documents the trap
});

test('cutoff boundaries 4/5, 14/15, 28', () => {
  assert.equal(dapsa({ tjc68: 4, sjc66: 0, global: 0, pain: 0, crp: 0 }).bandLabel, 'Remission'); // 4
  assert.equal(dapsa({ tjc68: 5, sjc66: 0, global: 0, pain: 0, crp: 0 }).bandLabel, 'Low disease activity'); // 5
  assert.equal(dapsa({ tjc68: 14, sjc66: 0, global: 0, pain: 0, crp: 0 }).bandLabel, 'Low disease activity'); // 14
  assert.equal(dapsa({ tjc68: 15, sjc66: 0, global: 0, pain: 0, crp: 0 }).bandLabel, 'Moderate disease activity'); // 15
  assert.equal(dapsa({ tjc68: 28, sjc66: 0, global: 0, pain: 0, crp: 0 }).bandLabel, 'Moderate disease activity'); // 28
  assert.equal(dapsa({ tjc68: 29, sjc66: 0, global: 0, pain: 0, crp: 0 }).bandLabel, 'High disease activity'); // 29
});

test('blanks / out-of-range fall back', () => {
  assert.equal(dapsa({ tjc68: 69, sjc66: 0, global: 0, pain: 0, crp: 0 }).valid, false); // > 68
  assert.equal(dapsa({ tjc68: 5, sjc66: 3, global: 4, pain: 4 }).valid, false); // no CRP
  assert.equal(dapsa({}).valid, false);
});
