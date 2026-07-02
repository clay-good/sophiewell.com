// spec-v193 2.2: scaiShock worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scaiShock } from '../../lib/acs-v193.js';

test('stage C from one intervention', () => {
  const r = scaiShock({sbp:80,lactate:3,support:'one'});
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'C');
});

test('stage E from arrest / maximal support', () => {
  const r = scaiShock({sbp:55,lactate:12,support:'maximal',arrest:true});
  assert.equal(r.stage, 'E');
  assert.equal(r.abnormal, true);
});

test('stage B from hypotension without hypoperfusion', () => {
  const r = scaiShock({sbp:85,lactate:1.5,support:'none'});
  assert.equal(r.stage, 'B');
});

test('stage A when no hypotension or hypoperfusion', () => {
  const r = scaiShock({sbp:120,lactate:1,support:'none'});
  assert.equal(r.stage, 'A');
  assert.equal(r.abnormal, false);
});

test('guards: missing support invalid', () => {
  const r = scaiShock({sbp:80,lactate:3});
  assert.equal(r.valid, false);
});
