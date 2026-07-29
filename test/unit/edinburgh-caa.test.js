// spec-v610: the Edinburgh CT criteria for CAA-associated lobar ICH.
//
// The load-bearing test enumerates all eight combinations of the three findings and pins that the simplified
// version can only ever read LOWER than the original, never higher, and that APOE e4 accounts for every
// difference.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  edinburghCaa, enumerateCombinations, originalCategory, simplifiedCategory,
  LOW, MEDIUM, HIGH, ORDER,
} from '../../lib/edinburgh-caa-v610.js';

const at = (sah, flp, apoe) => edinburghCaa({
  subarachnoidExtension: sah, fingerLikeProjections: flp, apoe,
});

// THE enumeration.
test('exactly three of the eight combinations disagree', () => {
  const rows = enumerateCombinations();
  assert.equal(rows.length, 8);
  assert.equal(rows.filter((r) => !r.agree).length, 3);
});

test('the original is higher in every disagreement - the simplified can never read higher', () => {
  const disagreements = enumerateCombinations().filter((r) => !r.agree);
  for (const r of disagreements) {
    assert.equal(r.originalHigher, true, JSON.stringify(r));
    assert.ok(ORDER.indexOf(r.original) > ORDER.indexOf(r.simplified));
  }
});

test('APOE e4 accounts for every difference', () => {
  const disagreements = enumerateCombinations().filter((r) => !r.agree);
  assert.ok(disagreements.every((r) => r.apoe), 'every disagreement has APOE e4 present');
  const withoutApoe = enumerateCombinations().filter((r) => !r.apoe);
  assert.ok(withoutApoe.every((r) => r.agree), 'with APOE negative the two versions always agree');
});

// THE gate, not a count.
test('subarachnoid extension is a gate: neither version reaches high without it', () => {
  for (const flp of [false, true]) {
    for (const apoe of [false, true]) {
      assert.notEqual(originalCategory(false, flp, apoe), HIGH, `flp=${flp} apoe=${apoe}`);
      assert.notEqual(simplifiedCategory(false, flp), HIGH, `flp=${flp}`);
    }
  }
});

test('finger-like projections plus APOE e4 without subarachnoid extension is NOT high risk', () => {
  // This is exactly what the "count any two of three" restatement gets wrong.
  assert.equal(originalCategory(false, true, true), MEDIUM);
  assert.notEqual(originalCategory(false, true, true), HIGH);
  assert.match(at('no', 'yes', 'positive').bandText, /IT IS NOT A COUNT/);
});

test('finger-like projections never count on their own in either version', () => {
  assert.equal(originalCategory(false, true, false), LOW);
  assert.equal(originalCategory(false, false, false), LOW);
  assert.equal(simplifiedCategory(false, true), LOW);
  assert.equal(simplifiedCategory(false, false), LOW);
});

// The published rules.
test('the rule-out and rule-in criteria are flagged', () => {
  const ruledOut = at('no', 'yes', 'negative');
  assert.equal(ruledOut.ruleOutMet, true);
  assert.equal(ruledOut.ruleInMet, false);
  const ruledIn = at('yes', 'yes', 'negative');
  assert.equal(ruledIn.ruleInMet, true);
  assert.equal(ruledIn.ruleOutMet, false);
  assert.equal(at('yes', 'no', 'positive').ruleInMet, true);
});

// APOE unknown.
test('an unknown APOE result yields the simplified version only, never a guessed original', () => {
  const r = at('yes', 'no', 'unknown');
  assert.equal(r.original, null);
  assert.equal(r.apoeKnown, false);
  assert.equal(r.simplified, MEDIUM);
  assert.equal(r.disagree, false);
  assert.match(r.bandText, /NOT computed because the APOE e4 status is unknown/);
});

test('the disagreement is called out when it happens and not otherwise', () => {
  assert.match(at('yes', 'no', 'positive').bandText, /THE TWO VERSIONS DISAGREE HERE/);
  assert.doesNotMatch(at('yes', 'yes', 'positive').bandText, /THE TWO VERSIONS DISAGREE HERE/);
  assert.equal(at('yes', 'no', 'positive').disagree, true);
  assert.equal(at('yes', 'yes', 'positive').disagree, false);
});

// THE source's own hole, disclosed at one combination only.
test('the source hole is disclosed only at finger-like projections alone', () => {
  const hole = at('no', 'yes', 'negative');
  assert.match(hole.bandText, /DISCLOSURE AT THIS COMBINATION ONLY/);
  assert.equal(hole.simplified, LOW);
  for (const other of [at('no', 'no', 'negative'), at('yes', 'yes', 'negative'), at('no', 'yes', 'positive')]) {
    assert.doesNotMatch(other.bandText, /DISCLOSURE AT THIS COMBINATION ONLY/);
  }
});

test('the categories are ordered low, medium, high', () => {
  assert.deepEqual(ORDER, [LOW, MEDIUM, HIGH]);
});

test('the inputs are validated', () => {
  assert.equal(edinburghCaa({}).valid, false);
  assert.match(edinburghCaa({}).message, /"unknown" if it is not back/);
  assert.match(at('maybe', 'no', 'unknown').message, /must be yes or no/);
  assert.match(at('no', 'no', 'e4e4').message, /positive, negative or unknown/);
});

test('the scope note keeps the criteria off diagnosis and off treatment', () => {
  const r = at('yes', 'yes', 'positive');
  assert.match(r.note, /does not diagnose the hemorrhage/);
  assert.match(r.note, /deep or infratentorial/);
  assert.match(r.note, /only pathology does/);
  assert.match(r.note, /does not replace the MRI-based Boston criteria/);
  assert.match(r.note, /does not decide anticoagulation/);
});
