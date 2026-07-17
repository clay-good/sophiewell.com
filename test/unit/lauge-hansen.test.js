// spec-v402: Lauge-Hansen classification of rotational ankle fractures (SA/SER/PAB/PER/PD).
// Worked-example tests: each mechanism and its injury-sequence description, spelled-out input, and the
// invalid-mechanism guard. Patterns transcribed from Lauge-Hansen 1950 (Arch Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { laugeHansen } from '../../lib/lauge-hansen-v402.js';

test('SER: supination-external-rotation, the most common (the META example)', () => {
  const r = laugeHansen({ mechanism: 'SER' });
  assert.equal(r.valid, true);
  assert.equal(r.mechanism, 'SER');
  assert.match(r.band, /supination-external-rotation/);
  assert.match(r.band, /Weber B/);
});

test('SA: supination-adduction, lateral avulsion then medial vertical', () => {
  const r = laugeHansen({ mechanism: 'SA' });
  assert.equal(r.mechanism, 'SA');
  assert.match(r.band, /transverse avulsion fracture of the lateral malleolus/);
});

test('PAB and PER: pronation mechanisms correlate with Weber C', () => {
  assert.match(laugeHansen({ mechanism: 'PAB' }).band, /Weber C/);
  const per = laugeHansen({ mechanism: 'PER' });
  assert.equal(per.mechanism, 'PER');
  assert.match(per.band, /Maisonneuve/);
});

test('PD: pronation-dorsiflexion axial-load / pilon pattern', () => {
  const r = laugeHansen({ mechanism: 'PD' });
  assert.equal(r.mechanism, 'PD');
  assert.match(r.band, /pilon-type/);
});

test('spelled-out mechanism names map to the codes', () => {
  assert.equal(laugeHansen({ mechanism: 'supination-external-rotation' }).mechanism, 'SER');
  assert.equal(laugeHansen({ mechanism: 'pronation abduction' }).mechanism, 'PAB');
});

test('a missing or unknown mechanism is invalid', () => {
  assert.equal(laugeHansen({}).valid, false);
  assert.equal(laugeHansen({ mechanism: 'XYZ' }).valid, false);
  assert.equal(laugeHansen({ mechanism: 'SUP' }).valid, false);
});
