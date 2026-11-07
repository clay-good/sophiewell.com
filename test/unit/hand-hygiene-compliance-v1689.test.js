// spec-v1689: WHO hand hygiene compliance. The figures asserted here are the manual's own
// (Hand Hygiene Technical Reference Manual, 2009, sections III.6 to III.8 and Figure 8).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handHygieneCompliance, MOMENTS } from '../../lib/hand-hygiene-compliance-v1689.js';

const only = (key, actions, opportunities) => handHygieneCompliance({
  [`${key}Actions`]: actions, [`${key}Opportunities`]: opportunities,
});

test("the manual's Figure 8 observation: three actions on six opportunities is 50%", () => {
  // "counted six opportunities ... observed four positive (performed) hand hygiene actions of which
  // three are linked to opportunities". The numerator is the three, so the figure is 50%, not 66.7%.
  const r = only('before-patient', '3', '6');
  assert.equal(r.valid, true);
  assert.equal(r.compliance, 50);
  assert.match(r.band, /50%/);
  assert.match(r.band, /3 performed actions over 6 opportunities/);
});

test('the four actions seen in that example cannot be detected, so the rule is always stated', () => {
  // Figure 8's trap is a COUNTING one, not an arithmetic one: 4 actions over 6 opportunities is a
  // perfectly dividable 66.7%, and nothing in the two numbers reveals that one of the four actions
  // answered no opportunity. The tool cannot refuse it, so it must say what belongs in the
  // numerator -- on every result, not only when something looks wrong.
  const r = only('before-patient', '4', '6');
  assert.equal(r.valid, true);
  assert.equal(r.compliance, 66.7);
  const stated = r.notes.some((n) => /only where it answered an opportunity/.test(n) && /3 of 6 and not 4 of 6/.test(n));
  assert.ok(stated, 'every result must state which actions belong in the numerator');
  // And it is stated for a clean observation too, not just a suspicious one.
  assert.ok(only('before-patient', '3', '6').notes.some((n) => /only where it answered an opportunity/.test(n)));
});

test('compliance never exceeds 100%, which is what refusing above-opportunity actions buys', () => {
  for (const [a, o] of [['7', '6'], ['201', '200'], ['2', '1']]) {
    assert.equal(only('before-patient', a, o).valid, false, `${a} of ${o} should be refused`);
  }
  const equal = only('before-patient', '6', '6');
  assert.equal(equal.valid, true);
  assert.equal(equal.compliance, 100);
});

test('every moment entered is reported with its own denominator beside it', () => {
  const r = handHygieneCompliance({
    'before-patientActions': '40', 'before-patientOpportunities': '50',
    'before-asepticActions': '18', 'before-asepticOpportunities': '20',
    'after-fluidActions': '30', 'after-fluidOpportunities': '30',
    'after-patientActions': '45', 'after-patientOpportunities': '60',
    'after-surroundingsActions': '20', 'after-surroundingsOpportunities': '40',
  });
  assert.equal(r.valid, true);
  // 153 of 200.
  assert.equal(r.actions, 153);
  assert.equal(r.opportunities, 200);
  assert.equal(r.compliance, 76.5);
  assert.equal(r.moments.length, 5);
  assert.deepEqual(r.moments.map((m) => m.compliance), [80, 90, 100, 75, 50]);
  for (const m of r.moments) {
    assert.ok(r.notes.some((n) => n.includes(`${m.compliance}%`) && n.includes(`of ${m.opportunities} opportunities`)),
      `moment ${m.moment} should report its own denominator`);
  }
});

test('a partial observation says it covers only the moments observed', () => {
  const r = handHygieneCompliance({
    'before-patientActions': '8', 'before-patientOpportunities': '10',
    'after-patientActions': '6', 'after-patientOpportunities': '10',
  });
  assert.equal(r.valid, true);
  assert.equal(r.compliance, 70);
  assert.ok(r.notes.some((n) => /covers 2 of the five moments/.test(n)),
    'a two-moment observation must not read as hand hygiene overall');
});

test("the 200-opportunity principle is reported as precision, never as a pass mark", () => {
  const small = only('before-patient', '9', '10');
  // Match the caveat's own words: every per-moment line also carries "of N opportunities".
  assert.ok(small.notes.some((n) => /observation principles ask for data/.test(n)));
  assert.ok(small.notes.some((n) => /not a failing figure/.test(n)),
    'the caveat must not read as a verdict on the compliance figure');
  const atPrinciple = only('before-patient', '150', '200');
  assert.ok(!atPrinciple.notes.some((n) => /observation principles ask for data/.test(n)),
    'at 200 opportunities the precision caveat does not fire');
});

test('no target rate is stated anywhere in the output', () => {
  const r = only('before-patient', '20', '100');
  assert.equal(r.compliance, 20);
  assert.equal(r.abnormal, false, 'the manual sets no threshold, so nothing is flagged abnormal');
  // The output may SAY no target is set; it may not imply one. Drop that disclaimer, then look.
  const all = [r.band, r.bandLabel, r.note, ...r.notes].join(' ')
    .replace(/The manual sets no target rate, so none is shown\./g, '');
  assert.ok(!/target|should be at least|goal of|benchmark|acceptable|pass(?:ing)? (?:mark|rate)|below standard/i.test(all),
    'the manual sets no target rate, so the tool must not imply one');
  assert.match(r.note, /sets no target rate/, 'and it says so outright');
});

test('an unobserved moment is left blank, and zero opportunities is not a zero percent', () => {
  const nothing = handHygieneCompliance({});
  assert.equal(nothing.valid, false);
  assert.match(nothing.message, /at least one of the five moments/);

  const zero = only('before-patient', '0', '0');
  assert.equal(zero.valid, false);
  assert.match(zero.message, /no compliance figure/);
});

test('zero performed actions is a real 0%, not a refusal', () => {
  const r = only('after-surroundings', '0', '12');
  assert.equal(r.valid, true);
  assert.equal(r.compliance, 0);
  assert.match(r.band, /0%/);
});

test('counts must be whole numbers, and a half-entered moment names the missing field', () => {
  assert.match(only('before-patient', '3.5', '6').message, /whole numbers/);
  assert.match(only('before-patient', '', '6').message, /performed actions/);
  assert.match(only('before-patient', '3', '').message, /opportunities/);
});

test('the five moments are the manual\'s five, numbered in its order', () => {
  assert.equal(MOMENTS.length, 5);
  assert.deepEqual(MOMENTS.map((m) => m.n), [1, 2, 3, 4, 5]);
  assert.deepEqual(MOMENTS.map((m) => m.label), [
    'Before touching a patient',
    'Before a clean / aseptic procedure',
    'After body fluid exposure risk',
    'After touching a patient',
    'After touching patient surroundings',
  ]);
});

test('whitespace is not a measured zero', () => {
  const r = only('before-patient', '   ', '  ');
  assert.equal(r.valid, false);
  assert.match(r.message, /at least one of the five moments/);
});
