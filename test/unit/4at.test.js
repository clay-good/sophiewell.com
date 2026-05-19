// spec-v13 §3.2.5 wave 13-2: 4AT boundary examples per MacLullich AMJ,
// et al. Health Technol Assess. 2019;23(40):1-194.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fourAt } from '../../lib/scoring-v4.js';

test('4AT 0 of 12 -> delirium unlikely', () => {
  const r = fourAt({ alertnessAbnormal: false, amt4Errors: 0,
    attentionScore: 0, acuteChange: false });
  assert.equal(r.score, 0);
  assert.match(r.band, /unlikely/);
});

test('4AT 2 of 12 (AMT4 + attention) -> possible cognitive impairment', () => {
  const r = fourAt({ alertnessAbnormal: false, amt4Errors: 1,
    attentionScore: 1, acuteChange: false });
  assert.equal(r.score, 2);
  assert.match(r.band, /cognitive impairment without delirium/);
});

test('4AT 4 of 12 (alertness abnormal alone) -> possible delirium', () => {
  const r = fourAt({ alertnessAbnormal: true, amt4Errors: 0,
    attentionScore: 0, acuteChange: false });
  assert.equal(r.score, 4);
  assert.match(r.band, /possible delirium/);
});

test('4AT maximum 12 of 12 -> possible delirium', () => {
  const r = fourAt({ alertnessAbnormal: true, amt4Errors: 2,
    attentionScore: 2, acuteChange: true });
  assert.equal(r.score, 12);
  assert.match(r.band, /possible delirium/);
});

test('4AT clamps numeric components to 0-2', () => {
  const r = fourAt({ alertnessAbnormal: false, amt4Errors: 99,
    attentionScore: -5, acuteChange: false });
  assert.equal(r.parts.amt, 2);
  assert.equal(r.parts.att, 0);
});
