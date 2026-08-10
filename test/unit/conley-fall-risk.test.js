// spec-v692: Conley Fall Risk Scale.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { conleyFallRisk } from '../../lib/conley-fall-risk-v692.js';

test('nothing present -> 0, low risk', () => {
  const r = conleyFallRisk({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.abnormal, false);
});

test('each item carries its weight', () => {
  assert.equal(conleyFallRisk({ previousFalls: true }).score, 2);
  assert.equal(conleyFallRisk({ dizziness: true }).score, 1);
  assert.equal(conleyFallRisk({ incontinence: true }).score, 1);
  assert.equal(conleyFallRisk({ impairedJudgment: true }).score, 3);
  assert.equal(conleyFallRisk({ agitation: true }).score, 2);
  assert.equal(conleyFallRisk({ impairedGait: true }).score, 1);
});

test('maximum is 10', () => {
  const r = conleyFallRisk({ previousFalls: true, dizziness: true, incontinence: true, impairedJudgment: true, agitation: true, impairedGait: true });
  assert.equal(r.score, 10);
});

test('worked example: falls + dizziness + agitation -> 5 (at risk)', () => {
  const r = conleyFallRisk({ previousFalls: 'true', dizziness: 'true', agitation: 'true' });
  assert.equal(r.score, 5);
  assert.equal(r.tier, 'at-risk');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Conley 5 of 10/);
});

test('cutoff is >= 2', () => {
  assert.equal(conleyFallRisk({ dizziness: true }).abnormal, false);            // 1
  assert.equal(conleyFallRisk({ dizziness: true, impairedGait: true }).abnormal, true); // 2
  assert.equal(conleyFallRisk({ previousFalls: true }).abnormal, true);         // 2
});
