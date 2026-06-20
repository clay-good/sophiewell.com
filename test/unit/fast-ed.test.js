// spec-v119 2.2: FAST-ED (Lima 2016). Facial 0-1, Arm 0-2, Speech 0-2, Eye 0-2,
// Neglect 0-2; total 0-9; dichotomy >= 4 predicts a large-vessel occlusion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fastEd } from '../../lib/neuro-v119.js';

test('no deficits -> 0/9, below the LVO threshold', () => {
  const r = fastEd({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /below the >= 4/);
});

test('facial + arm-drift + mild speech -> 3/9, just below the >= 4 band-flip', () => {
  const r = fastEd({ facial: '1', arm: '1', speech: '1' });
  assert.equal(r.total, 3);
  assert.equal(r.abnormal, false);
});

test('facial + severe arm + severe speech -> 5/9, crosses the LVO threshold', () => {
  const r = fastEd({ facial: '1', arm: '2', speech: '2', eye: '0', neglect: '0' });
  assert.equal(r.total, 5);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /predicts a large-vessel occlusion/);
});

test('forced eye deviation + neglect alone -> 4/9, the threshold itself', () => {
  const r = fastEd({ eye: '2', neglect: '2' });
  assert.equal(r.total, 4);
  assert.equal(r.abnormal, true);
});

test('all items at maximum -> 9/9', () => {
  const r = fastEd({ facial: '1', arm: '2', speech: '2', eye: '2', neglect: '2' });
  assert.equal(r.total, 9);
  assert.equal(r.abnormal, true);
});

test('out-of-range item levels clamp to the published maxima', () => {
  const r = fastEd({ facial: '9', arm: '9', speech: '9', eye: '9', neglect: '9' });
  assert.equal(r.total, 9);
});
