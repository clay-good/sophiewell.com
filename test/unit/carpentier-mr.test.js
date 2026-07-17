// spec-v398: Carpentier functional classification of mitral regurgitation (types I/II/IIIa/IIIb).
// Worked-example tests: each type and its mechanism description, roman + numeric + 3a/3b input, the
// ambiguous-bare-III guard, and the invalid-type guard. Types transcribed from Carpentier 1983
// (J Thorac Cardiovasc Surg, the "French correction") (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carpentierMr } from '../../lib/carpentier-mr-v398.js';

test('type II: excessive leaflet motion / prolapse (the META example)', () => {
  const r = carpentierMr({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /excessive leaflet motion/);
  assert.match(r.band, /prolapse or flail/);
});

test('type I: normal motion, annular dilatation or perforation', () => {
  const r = carpentierMr({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /normal leaflet motion/);
  assert.match(r.band, /annular dilatation or leaflet perforation/);
});

test('type IIIa vs IIIb: structural vs functional restriction', () => {
  const a = carpentierMr({ type: 'IIIa' });
  assert.equal(a.type, 'IIIa');
  assert.match(a.band, /both systole and diastole/);
  const b = carpentierMr({ type: 'IIIb' });
  assert.equal(b.type, 'IIIb');
  assert.match(b.band, /systole only/);
});

test('numeric and 3a/3b input map to the types', () => {
  assert.equal(carpentierMr({ type: 2 }).type, 'II');
  assert.equal(carpentierMr({ type: '3a' }).type, 'IIIa');
  assert.equal(carpentierMr({ type: '3B' }).type, 'IIIb');
});

test('a missing, ambiguous, or out-of-range type is invalid', () => {
  assert.equal(carpentierMr({}).valid, false);
  assert.equal(carpentierMr({ type: 'III' }).valid, false);
  assert.equal(carpentierMr({ type: 'IV' }).valid, false);
  assert.equal(carpentierMr({ type: '0' }).valid, false);
});
