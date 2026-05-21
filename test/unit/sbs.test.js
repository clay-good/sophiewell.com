import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sbs } from '../../lib/scoring-v4.js';

test('sbs -3 (unresponsive) -> deeper than target sedation', () => {
  const r = sbs({ level: -3 });
  assert.equal(r.score, -3);
  assert.equal(r.label, '-3');
  assert.equal(r.band, 'deeper than target sedation');
});

test('sbs -2 (responsive to noxious only) -> deeper than target sedation', () => {
  const r = sbs({ level: -2 });
  assert.equal(r.band, 'deeper than target sedation');
});

test('sbs -1 (responsive to gentle touch) -> target sedation', () => {
  const r = sbs({ level: -1 });
  assert.equal(r.band, 'target sedation');
});

test('sbs 0 (tile example, awake and able to calm) -> target sedation', () => {
  const r = sbs({ level: 0 });
  assert.equal(r.label, '+0');
  assert.equal(r.band, 'target sedation');
});

test('sbs +1 (restless and difficult to calm) -> inadequate sedation / distress', () => {
  const r = sbs({ level: 1 });
  assert.equal(r.band, 'inadequate sedation / distress');
});

test('sbs +2 (agitated) -> inadequate sedation / distress', () => {
  const r = sbs({ level: 2 });
  assert.equal(r.label, '+2');
  assert.equal(r.band, 'inadequate sedation / distress');
});

test('sbs rejects out-of-range', () => {
  assert.throws(() => sbs({ level: 3 }));
  assert.throws(() => sbs({ level: -4 }));
  assert.throws(() => sbs({ level: 0.5 }));
});
