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

test('one ankle pressure is one leg, not the lower of two (spec-v1067)', () => {
  // With only one ankle entered there is no "lower of the two" -- there is one
  // index and one uncalculated leg. Claiming the comparison was made let a
  // normal single leg read as "normal (1.00-1.40)" for a patient whose other
  // leg nobody had measured, and peripheral artery disease is often one-sided.
  const rightMissing = abi({ leftAnkle: 132, rightBrachial: 110, leftBrachial: 110 });
  assert.equal(rightMissing.onlyOneLeg, true);
  assert.match(rightMissing.band, /the only leg calculated/);
  assert.doesNotMatch(rightMissing.band, /lower index governs/);
  assert.match(rightMissing.band, /right ankle pressure was not entered/);
  assert.match(rightMissing.band, /does not exclude disease in it/);

  // When the one calculated leg is already abnormal the verdict rules in, so no
  // exclusion caveat is owed -- the missing side is still named.
  const leftMissing = abi({ rightAnkle: 99, rightBrachial: 110, leftBrachial: 110 });
  assert.equal(leftMissing.onlyOneLeg, true);
  assert.match(leftMissing.band, /left ankle pressure was not entered/);
  assert.doesNotMatch(leftMissing.band, /does not exclude disease in it/);

  // Both legs: the original sentence, unchanged.
  const both = abi({ rightAnkle: 99, leftAnkle: 132, rightBrachial: 110, leftBrachial: 110 });
  assert.equal(both.onlyOneLeg, false);
  assert.match(both.band, /lower index governs/);
  assert.doesNotMatch(both.band, /not entered/);
});
