// spec-v13 §3.2.1 wave 13-2: RASS boundary examples per Sessler CN,
// et al. Am J Respir Crit Care Med. 2002;166(10):1338-1344.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rass } from '../../lib/scoring-v4.js';

test('rass 0: alert and calm; in PADIS 2018 target band', () => {
  const r = rass({ level: 0 });
  assert.equal(r.level, 0);
  assert.match(r.descriptor, /Alert and calm/);
  assert.match(r.band, /target band/);
});

test('rass -2: light sedation; in target band', () => {
  const r = rass({ level: -2 });
  assert.match(r.band, /target band/);
});

test('rass +4: combative; agitated band', () => {
  const r = rass({ level: 4 });
  assert.match(r.band, /agitated/);
});

test('rass -5: unarousable; deeper than target band', () => {
  const r = rass({ level: -5 });
  assert.match(r.band, /deeper/);
});

test('rass clamps out-of-range to -5..+4', () => {
  assert.equal(rass({ level: 99 }).level, 4);
  assert.equal(rass({ level: -99 }).level, -5);
});
