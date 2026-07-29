// spec-v604: the Bilsky ESCC scale.
//
// The load-bearing tests are that the grades are strings that parseInt collapses, and that the low/high
// split falls inside grade 1 rather than at the numeric middle.

import test from 'node:test';
import assert from 'node:assert/strict';
import { bilskyEscc, GRADES, LEVELS, SEQUENCE } from '../../lib/bilsky-escc-v604.js';

const at = (grade, level) => bilskyEscc(level ? { grade, level } : { grade });

test('there are six grades with the published labels', () => {
  assert.deepEqual(GRADES.map((g) => g.grade), ['0', '1a', '1b', '1c', '2', '3']);
});

// THE non-numeric grades.
test('the grade is returned as a string, not a number', () => {
  for (const g of GRADES) {
    const r = at(g.grade);
    assert.equal(typeof r.grade, 'string', g.grade);
    assert.equal(r.grade, g.grade);
  }
});

test('parseInt would collapse three distinct grades into one', () => {
  const subdivided = ['1a', '1b', '1c'];
  const parsed = subdivided.map((g) => parseInt(g, 10));
  assert.deepEqual(parsed, [1, 1, 1], 'this is exactly the loss the scale must avoid');
  // The three are distinct grades with distinct definitions and distinct ranks.
  const ranks = subdivided.map((g) => at(g).ordinalRank);
  assert.equal(new Set(ranks).size, 3);
  const defs = subdivided.map((g) => at(g).definition);
  assert.equal(new Set(defs).size, 3);
});

test('the non-numeric warning appears in every result', () => {
  assert.match(at('0').bandText, /grades are NOT numbers/);
  assert.match(at('0').bandText, /parseInt maps 1a, 1b and 1c all to 1/);
});

test('the ordinal rank is exposed separately and is strictly increasing', () => {
  const ranks = GRADES.map((g) => at(g.grade).ordinalRank);
  assert.deepEqual(ranks, [0, 1, 2, 3, 4, 5]);
});

// THE split.
test('the low/high split falls inside grade 1, not at the numeric middle', () => {
  assert.equal(at('1c').highGrade, false);
  assert.equal(at('2').highGrade, true);
  const low = GRADES.filter((g) => !g.highGrade).map((g) => g.grade);
  const high = GRADES.filter((g) => g.highGrade).map((g) => g.grade);
  assert.deepEqual(low, ['0', '1a', '1b', '1c']);
  assert.deepEqual(high, ['2', '3']);
  assert.equal(low.length, 4, 'four of six grades are low');
  assert.match(at('1c').bandText, /INSIDE grade 1, not at the numeric middle/);
});

test('the boundary is abutment versus compression', () => {
  assert.match(at('1c').definition, /abutment/);
  assert.match(at('2').definition, /compression/);
});

// THE level dependence.
test('the level-specific paralysis threshold differs by region', () => {
  assert.equal(LEVELS.find((l) => l.value === 'c1-t2').paralysisThresholdGrade, '1b');
  assert.equal(LEVELS.find((l) => l.value === 't3-l5').paralysisThresholdGrade, '1c');
  assert.equal(at('1b', 'c1-t2').atOrAboveLevelThreshold, true);
  assert.equal(at('1b', 't3-l5').atOrAboveLevelThreshold, false, 'the same grade, a different answer');
});

test('the level is optional and never changes the grade', () => {
  const withLevel = at('1b', 'c1-t2');
  const without = at('1b');
  assert.equal(withLevel.grade, without.grade);
  assert.equal(withLevel.highGrade, without.highGrade);
  assert.equal(without.atOrAboveLevelThreshold, null);
  assert.equal(without.level, null);
});

// THE neurology caveat.
test('every result states that the grade does not track neurological deficit', () => {
  for (const g of GRADES) {
    assert.match(at(g.grade).bandText, /severity of paralysis was NOT correlated/, g.grade);
  }
  assert.match(at('3').bandText, /grade 3 compression with normal power/);
});

// The imaging requirement.
test('the required sequence and plane are stated', () => {
  assert.match(SEQUENCE, /axial T2/);
  assert.match(at('0').bandText, /most severe canal compromise/);
  assert.match(at('0').bandText, /sagittal image, from computed tomography/);
});

// Input handling and scope.
test('the grade is required and the message says the labels are not numbers', () => {
  const r = bilskyEscc({});
  assert.equal(r.valid, false);
  assert.match(r.message, /LABELS, not numbers/);
  assert.match(bilskyEscc({ grade: '1' }).message, /must be one of/);
  assert.match(bilskyEscc({ grade: '2', level: 'lumbar' }).message, /Spinal level must be one of/);
});

test('the scope note refuses diagnosis and treatment and flags the emergency', () => {
  const r = at('3');
  assert.match(r.note, /does not diagnose cord compression as a clinical syndrome/);
  assert.match(r.note, /does not by itself indicate surgery, radiotherapy or corticosteroids/);
  assert.match(r.note, /time-critical emergency/);
});
