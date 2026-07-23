// spec-v506: Jerger tympanogram classification (types A, As, Ad, B, C).
// Worked-example tests: each type, the As/Ad compliance split, the canal-volume caveat on type B,
// case-insensitive input, invalid-type guard. Types transcribed from Jerger 1970 (Arch Otolaryngol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jergerTympanogram } from '../../lib/jerger-tympanogram-v506.js';

test('type B: flat tracing (the META example)', () => {
  const r = jergerTympanogram({ type: 'B' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'B');
  assert.match(r.band, /a flat tracing with no identifiable peak/);
});

test('type A: normal peak, pressure, and compliance', () => {
  assert.match(jergerTympanogram({ type: 'A' }).band, /a normal peak, at normal middle-ear pressure with normal compliance/);
});

test('As and Ad split on compliance at normal pressure', () => {
  const as = jergerTympanogram({ type: 'As' });
  const ad = jergerTympanogram({ type: 'Ad' });
  assert.equal(as.type, 'As');
  assert.equal(ad.type, 'Ad');
  assert.match(as.band, /reduced compliance/);
  assert.match(ad.band, /abnormally high compliance/);
});

test('type B names both canal-volume readings rather than asserting one cause', () => {
  const b = jergerTympanogram({ type: 'B' }).band;
  assert.match(b, /normal ear-canal volume/);
  assert.match(b, /large canal volume/);
});

test('type C: peak at significantly negative pressure', () => {
  assert.match(jergerTympanogram({ type: 'C' }).band, /significantly negative pressure/);
});

test('input is case-insensitive for the two-letter types', () => {
  assert.equal(jergerTympanogram({ type: 'as' }).type, 'As');
  assert.equal(jergerTympanogram({ type: 'AD' }).type, 'Ad');
  assert.equal(jergerTympanogram({ type: 'c' }).type, 'C');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(jergerTympanogram({}).valid, false);
  assert.equal(jergerTympanogram({ type: 'D' }).valid, false);
  assert.equal(jergerTympanogram({ type: '1' }).valid, false);
});
