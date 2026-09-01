// spec-v958: the VExUS grade. Every case here is traceable to the derivation paper
// (Beaubien-Souligny 2020, Ultrasound J 12:16), including its two worked patients.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vexusGrade, DOPPLER_OPTIONS } from '../../lib/vexus-v958.js';
import { META } from '../../lib/meta.js';

const g = (o) => vexusGrade(o).grade;

test('the paper\'s own Patient #1 is Grade 1', () => {
  // "Normal hepatic triphasic pattern, a non-pulsatile portal flow and continuous intra-renal
  // venous flow and an IVC diameter of > 2.1 cm ... corresponding to Grade 1".
  const r = vexusGrade({ ivcDiameterCm: 2.1, hepaticVein: 'normal', portalVein: 'normal', intrarenalVein: 'normal' });
  assert.equal(r.grade, 1);
  assert.equal(r.ivcDilated, true);
  assert.equal(r.severeCount, 0);
  assert.equal(r.abnormal, false);
});

test('the paper\'s own Patient #2 is Grade 3', () => {
  // "Systolic reversal of the hepatic venous flow, severe portal flow pulsatility and severe
  // alteration in intra-renal venous flow corresponding to Grade 3".
  const r = vexusGrade({ ivcDiameterCm: 2.5, hepaticVein: 'severe', portalVein: 'severe', intrarenalVein: 'severe' });
  assert.equal(r.grade, 3);
  assert.equal(r.severeCount, 3);
  assert.equal(r.abnormal, true);
});

test('one severe territory with a dilated IVC is Grade 2', () => {
  for (const key of ['hepaticVein', 'portalVein', 'intrarenalVein']) {
    assert.equal(g({ ivcDiameterCm: 2.4, [key]: 'severe' }), 2, key);
  }
});

test('a normal IVC is Grade 0 whatever the waveforms show', () => {
  const r = vexusGrade({ ivcDiameterCm: 1.5, hepaticVein: 'severe', portalVein: 'severe', intrarenalVein: 'severe' });
  assert.equal(r.grade, 0);
  assert.equal(r.ivcDilated, false);
  // and it says so rather than silently dropping them
  assert.match(r.stoppedNote, /IVC is under 2 cm, so this grading does not use them/);
});

test('2.0 cm is dilated: the derivation says "at or above 2 cm"', () => {
  assert.equal(g({ ivcDiameterCm: 2, hepaticVein: 'severe' }), 2);
  assert.equal(g({ ivcDiameterCm: 1.99, hepaticVein: 'severe' }), 0);
});

test('MILD findings never raise the grade, and the result says why', () => {
  // The trap. Prototypes B and D combined mild and severe findings; C, the one that
  // performed, counts severe only. Three mild waveforms read the same as three normal ones.
  const mild = vexusGrade({ ivcDiameterCm: 2.4, hepaticVein: 'mild', portalVein: 'mild', intrarenalVein: 'mild' });
  const normal = vexusGrade({ ivcDiameterCm: 2.4, hepaticVein: 'normal', portalVein: 'normal', intrarenalVein: 'normal' });
  assert.equal(mild.grade, 1);
  assert.equal(mild.grade, normal.grade);
  assert.equal(mild.mildCount, 3);
  assert.match(mild.mildNote, /does NOT raise this grade/);
  // a mild finding alongside a severe one still gives exactly Grade 2
  assert.equal(g({ ivcDiameterCm: 2.4, hepaticVein: 'severe', portalVein: 'mild', intrarenalVein: 'mild' }), 2);
});

test('an unrecognised waveform value is read as normal, never as severe', () => {
  assert.equal(g({ ivcDiameterCm: 2.4, hepaticVein: 'catastrophic', portalVein: '', intrarenalVein: null }), 1);
});

test('a missing or non-positive IVC asks for it instead of guessing', () => {
  for (const v of ['', null, undefined, 'abc', 0, -1]) {
    const r = vexusGrade({ ivcDiameterCm: v, hepaticVein: 'severe' });
    assert.equal(r.valid, false, String(v));
    assert.match(r.message, /IVC diameter in centimeters/);
  }
  assert.equal(vexusGrade().valid, false);
});

test('the worked example in META computes what it claims', () => {
  const r = vexusGrade({
    ivcDiameterCm: META.vexus.example.fields['vx-ivc'],
    hepaticVein: META.vexus.example.fields['vx-hepatic'],
    portalVein: META.vexus.example.fields['vx-portal'],
    intrarenalVein: META.vexus.example.fields['vx-renal'],
  });
  assert.equal(r.grade, 2);
  assert.match(META.vexus.example.expected, /Grade 2/);
});

test('the option list is the three the source defines', () => {
  assert.deepEqual(DOPPLER_OPTIONS.map((o) => o.value), ['normal', 'mild', 'severe']);
});

test('every grade returns a band that names it', () => {
  const cases = [
    [{ ivcDiameterCm: 1.5 }, 0], [{ ivcDiameterCm: 2.4 }, 1],
    [{ ivcDiameterCm: 2.4, hepaticVein: 'severe' }, 2],
    [{ ivcDiameterCm: 2.4, hepaticVein: 'severe', portalVein: 'severe' }, 3],
  ];
  for (const [input, grade] of cases) {
    const r = vexusGrade(input);
    assert.equal(r.grade, grade);
    assert.equal(r.bandLabel, `VExUS Grade ${grade}`);
    assert.match(r.band, new RegExp(`Grade ${grade}`));
    assert.ok(r.note.length > 200, 'the explanation travels with the result');
  }
});
