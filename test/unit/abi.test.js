// spec-v105 2.1: Ankle-Brachial Index (Aboyans 2012). Per leg ankle / higher
// brachial; lower leg index governs; bands read off the 2-decimal ratio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { abi } from '../../lib/vascular-v105.js';

test('0.90 -> 0.91 band flip: 0.90 is mild-to-moderate PAD', () => {
  const r = abi({ rightAnkle: 90, leftAnkle: 120, rightBrachial: 100, leftBrachial: 100 });
  assert.equal(r.valid, true);
  assert.equal(r.governing.value, 0.9);
  assert.equal(r.governing.band, 'mild-to-moderate PAD');
});

test('0.91 is borderline', () => {
  const r = abi({ rightAnkle: 91, leftAnkle: 120, rightBrachial: 100, leftBrachial: 100 });
  assert.equal(r.governing.value, 0.91);
  assert.equal(r.governing.band, 'borderline');
});

test('normal 1.10 both legs', () => {
  const r = abi({ rightAnkle: 132, leftAnkle: 130, rightBrachial: 120, leftBrachial: 110 });
  assert.equal(r.governing.band, 'normal');
  assert.equal(r.legs[0].value, 1.1);
});

test('non-compressible > 1.40 and severe <= 0.40', () => {
  assert.equal(abi({ rightAnkle: 200, rightBrachial: 120 }).governing.band, 'non-compressible');
  assert.equal(abi({ rightAnkle: 40, rightBrachial: 120 }).governing.band, 'severe PAD');
});

test('higher brachial is the divisor (uses 130 not 100)', () => {
  const r = abi({ rightAnkle: 130, rightBrachial: 100, leftBrachial: 130 });
  assert.equal(r.higherBrachial, 130);
  assert.equal(r.legs[0].value, 1.0);
});

test('blank / zero brachial -> surfaced fallback, no divide-by-zero', () => {
  assert.equal(abi({ rightAnkle: 90 }).valid, false);
  assert.equal(abi({ rightAnkle: 90, rightBrachial: 0 }).valid, false);
});

test('no ankle measured -> surfaced fallback', () => {
  assert.equal(abi({ rightBrachial: 120 }).valid, false);
});
