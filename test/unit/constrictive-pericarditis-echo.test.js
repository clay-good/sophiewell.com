import test from 'node:test';
import assert from 'node:assert/strict';
import { constrictivePericarditisEcho as cpe } from '../../lib/constrictive-pericarditis-echo-v853.js';

test('cpe: the septal shift is the anchor', () => {
  // Neither supporting finding counts without it, whatever its value.
  assert.equal(cpe({ medialE: 15, hepaticVeinRatio: 2 }).criteriaMet, false);
  assert.equal(cpe({ medialE: 15, hepaticVeinRatio: 2 }).allThreeMet, false);
  assert.ok(cpe({ medialE: 15, hepaticVeinRatio: 2 }).performance.includes('required'));
  // And the shift alone does not satisfy them either.
  assert.equal(cpe({ septalShift: true }).criteriaMet, false);
  assert.ok(cpe({ septalShift: true }).missingNote.includes('does not settle'));
  assert.equal(cpe({ septalShift: true, medialE: 5, hepaticVeinRatio: 0.2 }).criteriaMet, false);
  assert.equal(cpe({ septalShift: true, medialE: 5 }).missingNote, null);
});

test('cpe: the two thresholds', () => {
  assert.equal(cpe({ septalShift: true, medialE: 9 }).medialMet, true);
  assert.equal(cpe({ septalShift: true, medialE: 8.9 }).medialMet, false);
  assert.equal(cpe({ septalShift: true, hepaticVeinRatio: 0.79 }).hepaticVeinMet, true);
  assert.equal(cpe({ septalShift: true, hepaticVeinRatio: 0.78 }).hepaticVeinMet, false);
});

test('cpe: the two readings carry their own published figures', () => {
  const one = cpe({ septalShift: true, medialE: 11 });
  assert.equal(one.criteriaMet, true);
  assert.equal(one.allThreeMet, false);
  assert.ok(one.performance.includes('87 percent sensitive and 91 percent specific'));
  assert.ok(one.performance.includes('97 percent'));

  const all = cpe({ septalShift: true, medialE: 11, hepaticVeinRatio: 0.9 });
  assert.equal(all.allThreeMet, true);
  assert.equal(all.criteriaMet, true);
  assert.ok(all.performance.includes('64 percent sensitive and 97 percent specific'));
  assert.equal(all.supportingMet, 2);
});

test('cpe: a preserved medial velocity is the criterion, not a reassuring number', () => {
  // The error the tile exists to prevent.
  const r = cpe({ septalShift: true, medialE: 11 });
  assert.ok(r.annulusReversusNote.includes('reads as normal or better'));
  assert.ok(r.annulusReversusNote.includes('tethered'));
  assert.equal(cpe({ septalShift: true, medialE: 6 }).annulusReversusNote, null);
});

test('cpe: the reversed relationship between the annuli is named when both are entered', () => {
  const r = cpe({ septalShift: true, medialE: 12, lateralE: 9 });
  assert.ok(r.reversedPairNote.includes('reverse of the normal relationship'));
  assert.equal(cpe({ septalShift: true, medialE: 9, lateralE: 12 }).reversedPairNote, null);
  assert.equal(cpe({ septalShift: true, medialE: 12 }).reversedPairNote, null);
  assert.equal(cpe({ septalShift: true, medialE: 10, lateralE: 10 }).reversedPairNote, null);
});

test('cpe: where the criteria are met, the filling-pressure ratio is called out as inverted', () => {
  assert.ok(cpe({ septalShift: true, medialE: 11 }).paradoxusNote.includes('inversely'));
  assert.equal(cpe({ septalShift: true, medialE: 5 }).paradoxusNote, null);
  assert.equal(cpe({ medialE: 11 }).paradoxusNote, null);
});

test('cpe: the hepatic vein ratio can be given as its two velocities', () => {
  const r = cpe({ septalShift: true, hepaticVeinReversalVelocity: 22, hepaticVeinForwardVelocity: 25 });
  assert.equal(r.hepaticVeinRatio, 0.88);
  assert.equal(r.hepaticVeinMet, true);
  assert.ok(r.derivedNote.includes('0.88'));
  // A directly given ratio wins over the pair.
  assert.equal(cpe({ septalShift: true, hepaticVeinRatio: 0.5, hepaticVeinReversalVelocity: 22, hepaticVeinForwardVelocity: 25 }).hepaticVeinRatio, 0.5);
  assert.equal(cpe({ septalShift: true, hepaticVeinRatio: 0.9 }).derivedNote, null);
});

test('cpe: the scope is stated every time', () => {
  const r = cpe({ septalShift: true, medialE: 11 });
  assert.ok(r.scopeNote.includes('restrictive cardiomyopathy'));
  assert.ok(r.scopeNote.includes('do not stage'));
});

test('cpe: validation', () => {
  assert.equal(cpe({}).valid, false);
  assert.equal(cpe(null).valid, false);
  assert.equal(cpe({ septalShift: true, medialE: 99 }).valid, false);
  assert.equal(cpe({ septalShift: true, lateralE: 99 }).valid, false);
  assert.equal(cpe({ septalShift: true, hepaticVeinRatio: 99 }).valid, false);
  assert.equal(cpe({ septalShift: true, hepaticVeinReversalVelocity: 999 }).valid, false);
  assert.equal(cpe({ septalShift: true, hepaticVeinForwardVelocity: 0 }).valid, false, 'a zero denominator is refused, not divided by');
});

test('cpe: the documented example round-trips', () => {
  const r = cpe({ septalShift: 'true', medialE: '11', lateralE: '9' });
  assert.equal(r.valid, true);
  assert.equal(r.criteriaMet, true);
  assert.ok(r.band.includes('criteria are met'));
  assert.ok(r.reversedPairNote);
});
