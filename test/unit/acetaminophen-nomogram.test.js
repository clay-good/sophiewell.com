// spec-v56 §2.4: Rumack-Matthew acetaminophen nomogram interpreter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acetaminophenNomogram } from '../../lib/medication-v5.js';

test('treatment line is 150 at 4 h, 75 at 8 h, 37.5 at 12 h', () => {
  assert.equal(acetaminophenNomogram({ hours: 4, levelUgMl: 0 }).treatmentLine, 150);
  assert.equal(acetaminophenNomogram({ hours: 8, levelUgMl: 0 }).treatmentLine, 75);
  assert.equal(acetaminophenNomogram({ hours: 12, levelUgMl: 0 }).treatmentLine, 37.5);
});

test('above the line -> NAC indicated', () => {
  const r = acetaminophenNomogram({ hours: 4, levelUgMl: 160 });
  assert.equal(r.aboveLine, true);
  assert.match(r.interpretation, /NAC.*indicated/);
});

test('below the line -> NAC not indicated', () => {
  const r = acetaminophenNomogram({ hours: 8, levelUgMl: 70 });
  assert.equal(r.aboveLine, false);
  assert.match(r.interpretation, /not indicated/);
});

test('exactly on the line counts as above (treat)', () => {
  const r = acetaminophenNomogram({ hours: 8, levelUgMl: 75 });
  assert.equal(r.aboveLine, true);
});

test('REFUSES outside the 4-24 h window (validity guard)', () => {
  assert.throws(() => acetaminophenNomogram({ hours: 2, levelUgMl: 200 }), /hours/);
  assert.throws(() => acetaminophenNomogram({ hours: 30, levelUgMl: 5 }), /hours/);
});
