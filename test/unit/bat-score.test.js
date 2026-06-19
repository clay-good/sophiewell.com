// spec-v118 2.3: BAT score (Morotti 2018). Blend sign +1, Any hypodensity +2,
// Timing onset-to-NCCT < 2.5 h +2; total 0-5; dichotomy >= 3 predicts expansion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { batScore } from '../../lib/neuro-v118.js';

test('no markers -> 0/5, below threshold', () => {
  const r = batScore({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /below the BAT >= 3/);
});

test('blend sign alone -> 1/5 (low, below threshold)', () => {
  const r = batScore({ blend: true });
  assert.equal(r.total, 1);
  assert.equal(r.abnormal, false);
});

test('hypodensity alone -> 2/5, still below the >= 3 band-flip', () => {
  const r = batScore({ hypodensity: true });
  assert.equal(r.total, 2);
  assert.equal(r.abnormal, false);
});

test('blend + hypodensity -> 3/5, crosses the expansion-prediction threshold', () => {
  const r = batScore({ blend: true, hypodensity: true });
  assert.equal(r.total, 3);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /predicts hematoma expansion/);
  assert.match(r.band, /0\.50/);
});

test('all three markers -> 5/5', () => {
  const r = batScore({ blend: true, hypodensity: true, timing: true });
  assert.equal(r.total, 5);
  assert.equal(r.abnormal, true);
});

test('timing + hypodensity -> 4/5 high band', () => {
  const r = batScore({ hypodensity: true, timing: true });
  assert.equal(r.total, 4);
  assert.equal(r.abnormal, true);
});
