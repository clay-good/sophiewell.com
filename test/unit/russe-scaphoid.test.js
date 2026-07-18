// spec-v416: Russe classification of scaphoid fractures (horizontal oblique / transverse / vertical
// oblique). Worked-example tests: each orientation and its stability description, the HO/T/VO and numeric
// aliases, and the invalid-type guard. Types transcribed from Russe 1960 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { russeScaphoid } from '../../lib/russe-scaphoid-v416.js';

test('transverse: compressive + shear, intermediate (the META example)', () => {
  const r = russeScaphoid({ type: 'transverse' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'transverse');
  assert.match(r.band, /runs transversely across the scaphoid/);
  assert.match(r.band, /intermediate stability/);
});

test('horizontal oblique: compressive, most stable', () => {
  const r = russeScaphoid({ type: 'horizontal oblique' });
  assert.equal(r.type, 'horizontal oblique');
  assert.match(r.band, /compressive forces predominate/);
  assert.match(r.band, /most stable/);
});

test('vertical oblique: shear, least stable', () => {
  const r = russeScaphoid({ type: 'vertical oblique' });
  assert.equal(r.type, 'vertical oblique');
  assert.match(r.band, /shear forces predominate/);
  assert.match(r.band, /least stable/);
});

test('HO / T / VO and numeric aliases map to the orientations', () => {
  assert.equal(russeScaphoid({ type: 'HO' }).type, 'horizontal oblique');
  assert.equal(russeScaphoid({ type: 'vo' }).type, 'vertical oblique');
  assert.equal(russeScaphoid({ type: 2 }).type, 'transverse');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(russeScaphoid({}).valid, false);
  assert.equal(russeScaphoid({ type: 'comminuted' }).valid, false);
  assert.equal(russeScaphoid({ type: '0' }).valid, false);
});
