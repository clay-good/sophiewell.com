// spec-v629 wave 12: sliding-scale insulin-drip math (lib/insulin-drip.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { insulinDripRate, INSULIN_DRIP_PROTOCOLS } from '../../lib/insulin-drip.js';

test('moderate protocol ladder', () => {
  assert.equal(insulinDripRate({ protocol: 'mod', bg: 90 }).rate, 0);
  assert.equal(insulinDripRate({ protocol: 'mod', bg: 150 }).rate, 1);
  assert.equal(insulinDripRate({ protocol: 'mod', bg: 180 }).rate, 2); // META example
  assert.equal(insulinDripRate({ protocol: 'mod', bg: 250 }).rate, 3);
  assert.equal(insulinDripRate({ protocol: 'mod', bg: 400 }).rate, 4);
});

test('low protocol ladder is gentler (0.5 step)', () => {
  assert.equal(insulinDripRate({ protocol: 'low', bg: 100 }).rate, 0);
  assert.equal(insulinDripRate({ protocol: 'low', bg: 150 }).rate, 0.5);
  assert.equal(insulinDripRate({ protocol: 'low', bg: 200 }).rate, 1);
  assert.equal(insulinDripRate({ protocol: 'low', bg: 250 }).rate, 2);
  assert.equal(insulinDripRate({ protocol: 'low', bg: 300 }).rate, 3);
});

test('boundaries are inclusive at the upper bound', () => {
  // <= 100 -> 0, so exactly 100 is the zero band; 101 crosses up.
  assert.equal(insulinDripRate({ protocol: 'mod', bg: 100 }).rate, 0);
  assert.equal(insulinDripRate({ protocol: 'mod', bg: 101 }).rate, 1);
});

test('accepts numeric-string glucose (DOM contract)', () => {
  const r = insulinDripRate({ protocol: 'mod', bg: '180' });
  assert.equal(r.rate, 2);
  assert.equal(r.bg, 180);
  assert.equal(r.protocolLabel, INSULIN_DRIP_PROTOCOLS.mod);
});

test('null on unknown protocol or non-numeric glucose', () => {
  assert.equal(insulinDripRate({ protocol: 'high', bg: 180 }), null);
  assert.equal(insulinDripRate({ protocol: 'mod', bg: 'x' }), null);
  assert.equal(insulinDripRate({ protocol: 'mod' }), null);
  assert.equal(insulinDripRate({}), null);
  assert.equal(insulinDripRate(), null);
});
