// spec-v960: the mTICI reperfusion grade. Every grade here is Table 2 of the Zaidat 2013
// consensus statement, and the disagreement case is the panel's own sentence about the two
// definitions of 2b.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ticiGrade, REPERFUSION_OPTIONS } from '../../lib/tici-v960.js';
import { META } from '../../lib/meta.js';

test('Table 2, grade by grade', () => {
  const expected = [
    ['none', '0'], ['minimal', '1'], ['under-half', '2a'],
    ['half-to-two-thirds', '2b'], ['over-two-thirds', '2b'], ['complete', '3'],
  ];
  for (const [reperfusion, mtici] of expected) {
    assert.equal(ticiGrade({ reperfusion }).mtici, mtici, reperfusion);
  }
});

test('the two scales part on exactly one option, and say so', () => {
  // "TICI 2b has been dichotomized into 2 main variations: (1) more than half (mTICI) and
  // (2) more than two thirds (original TICI) reperfusion."
  const differ = REPERFUSION_OPTIONS.map((o) => o.value).filter((v) => ticiGrade({ reperfusion: v }).scalesDiffer);
  assert.deepEqual(differ, ['half-to-two-thirds']);

  const r = ticiGrade({ reperfusion: 'half-to-two-thirds' });
  assert.equal(r.mtici, '2b');
  assert.equal(r.originalTici, '2a');
  assert.equal(r.successfulReperfusion, true, 'a success on the modified scale');
  assert.match(r.disagreementNote, /THE TWO SCALES DISAGREE HERE/);
  assert.match(r.disagreementNote, /more than two thirds/);
});

test('when the scales agree the result says that too', () => {
  const r = ticiGrade({ reperfusion: 'over-two-thirds' });
  assert.equal(r.scalesDiffer, false);
  assert.equal(r.mtici, r.originalTici);
  assert.match(r.disagreementNote, /Both scales grade this the same/);
});

test('success is 2b to 3 and nothing below it', () => {
  const success = REPERFUSION_OPTIONS.map((o) => o.value).filter((v) => ticiGrade({ reperfusion: v }).successfulReperfusion);
  assert.deepEqual(success, ['half-to-two-thirds', 'over-two-thirds', 'complete']);
  // and a failing grade warns that older trials counted 2a as success
  assert.match(ticiGrade({ reperfusion: 'under-half' }).successNote, /TIMI 2 to 3 or TICI 2a to 3/);
});

test('grade 3 says complete rather than near complete', () => {
  const r = ticiGrade({ reperfusion: 'complete' });
  assert.equal(r.mtici, '3');
  assert.match(r.band, /absence of visualized occlusion in all distal branches/);
  assert.match(r.completeNote, /complete, not near complete/);
});

test('the IMS III outcome figures travel with the grade they belong to', () => {
  assert.match(ticiGrade({ reperfusion: 'complete' }).outcomeNote, /80%/);
  assert.match(ticiGrade({ reperfusion: 'over-two-thirds' }).outcomeNote, /46\.3%/);
  assert.match(ticiGrade({ reperfusion: 'under-half' }).outcomeNote, /19\.4%/);
  // grades 0 and 1 carry no such figure and must not invent one
  assert.equal(ticiGrade({ reperfusion: 'none' }).outcomeNote, '');
});

test('an unrecognised or missing extent asks for the fraction instead of guessing', () => {
  for (const v of ['', null, undefined, 'partial', 'lots']) {
    const r = ticiGrade({ reperfusion: v });
    assert.equal(r.valid, false, String(v));
    assert.match(r.message, /more than half on mTICI, more than two thirds on the original/);
  }
  assert.equal(ticiGrade().valid, false);
});

test('the worked example in META computes what it claims', () => {
  const r = ticiGrade({ reperfusion: META.tici.example.fields['tici-reperf'] });
  assert.equal(r.mtici, '2b');
  assert.equal(r.originalTici, '2a');
  assert.match(META.tici.example.expected, /mTICI 2b.*original TICI 2a/);
});
