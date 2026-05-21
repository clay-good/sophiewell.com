import { test } from 'node:test';
import assert from 'node:assert/strict';
import { poss } from '../../lib/scoring-v4.js';

test('poss 0 (S) -> acceptable, sleep easy to arouse', () => {
  const r = poss({ level: 0 });
  assert.equal(r.label, 'S');
  assert.equal(r.acceptable, true);
});

test('poss 1 (tile example) -> acceptable, awake and alert', () => {
  const r = poss({ level: 1 });
  assert.equal(r.label, '1');
  assert.equal(r.acceptable, true);
});

test('poss 2 -> acceptable, slightly drowsy', () => {
  const r = poss({ level: 2 });
  assert.equal(r.label, '2');
  assert.equal(r.acceptable, true);
});

test('poss 3 -> unacceptable, decrease opioid + monitor', () => {
  const r = poss({ level: 3 });
  assert.equal(r.label, '3');
  assert.equal(r.acceptable, false);
  assert.match(r.action, /decrease opioid/i);
});

test('poss 4 -> unacceptable, stop opioid + consider naloxone', () => {
  const r = poss({ level: 4 });
  assert.equal(r.label, '4');
  assert.equal(r.acceptable, false);
  assert.match(r.action, /naloxone/i);
  assert.match(r.action, /rapid response/i);
});

test('poss rejects out-of-range', () => {
  assert.throws(() => poss({ level: 5 }));
  assert.throws(() => poss({ level: -1 }));
  assert.throws(() => poss({ level: 1.5 }));
});
