// spec-v13 §3.3.2 wave 13-3: BPS boundary examples per Payen JF,
// et al. Crit Care Med. 2001;29(12):2258-2263 (cutoff >5 of 12).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bps } from '../../lib/scoring-v4.js';

test('bps 3 (minimum): acceptable pain', () => {
  const r = bps({ facial: 1, upperLimb: 1, ventilatorCompliance: 1 });
  assert.equal(r.score, 3);
  assert.equal(r.unacceptablePain, false);
});

test('bps 5: still acceptable (cutoff is >5)', () => {
  const r = bps({ facial: 2, upperLimb: 1, ventilatorCompliance: 2 });
  assert.equal(r.score, 5);
  assert.equal(r.unacceptablePain, false);
});

test('bps threshold 6: unacceptable pain', () => {
  const r = bps({ facial: 2, upperLimb: 2, ventilatorCompliance: 2 });
  assert.equal(r.score, 6);
  assert.equal(r.unacceptablePain, true);
});

test('bps maximum 12: unacceptable pain', () => {
  const r = bps({ facial: 4, upperLimb: 4, ventilatorCompliance: 4 });
  assert.equal(r.score, 12);
  assert.equal(r.unacceptablePain, true);
});

test('bps clamps each input to 1-4', () => {
  const r = bps({ facial: 99, upperLimb: 0, ventilatorCompliance: 5 });
  assert.equal(r.parts.facial, 4);
  assert.equal(r.parts.upperLimb, 1);
  assert.equal(r.parts.ventilatorCompliance, 4);
});
