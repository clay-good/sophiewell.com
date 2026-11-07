// spec-v1691: the classic Westgard multirule. Rule statements from westgard.com, by the first author.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { westgardMultirule, parseSeries, RULES } from '../../lib/westgard-multirule-v1691.js';

// Level 1: mean 100, SD 2. Level 2: mean 200, SD 4. So 1 SD = 2 and 4 units.
const base = { mean1: '100', sd1: '2', mean2: '200', sd2: '4' };
const run = (c1, c2, prev1 = '', prev2 = '') => westgardMultirule({
  ...base, current1: String(c1), current2: String(c2), previous1: prev1, previous2: prev2,
});

test('a run inside 2s on both levels is in control, with no warning', () => {
  const r = run(101, 202);
  assert.equal(r.valid, true);
  assert.equal(r.rejected, false);
  assert.equal(r.warning, false);
  assert.equal(r.rules.length, 0);
  assert.match(r.band, /in control/i);
});

test('1-3s rejects on a single point past 3s', () => {
  const r = run(107, 200); // level 1 is +3.5 SD
  assert.equal(r.rejected, true);
  assert.deepEqual(r.rules, ['1-3s']);
  assert.ok(r.notes.some((n) => /past 3s/.test(n)));
  // Exactly 3s is not "exceeds" 3s.
  assert.equal(run(106, 200).rules.includes('1-3s'), false);
});

test('1-2s is a WARNING and never rejects on its own', () => {
  const r = run(105, 200); // level 1 is +2.5 SD: past 2s, inside 3s
  assert.equal(r.rejected, false, 'a single point past 2s must not reject the run');
  assert.equal(r.warning, true);
  assert.match(r.bandLabel, /1-2s warning/);
  // And it says why treating it as a rejection is expensive.
  assert.ok(r.notes.some((n) => /9% of good runs/.test(n) && /not a rejection/.test(n)));
});

test('2-2s needs the SAME side: two levels past opposite 2s limits is not 2-2s', () => {
  // Both levels past +2s, within the run -> 2-2s.
  const same = run(105, 209);
  assert.ok(same.rules.includes('2-2s'), 'both levels past +2s is a 2-2s');
  // One past +2s and the other past -2s is R-4s, NOT 2-2s.
  const opposite = run(105, 191);
  assert.ok(opposite.rules.includes('R-4s'));
  assert.equal(opposite.rules.includes('2-2s'), false, 'opposite sides must not read as 2-2s');
});

test('2-2s also fires across two consecutive runs on the same level', () => {
  // Previous run level 1 at +2.5 SD, this run level 1 at +2.5 SD.
  const r = run(105, 200, '105', '200');
  assert.ok(r.rules.includes('2-2s'));
  assert.ok(r.notes.some((n) => /both past \+2s/.test(n)));
});

test('R-4s is within-run only, as the author notes', () => {
  // Opposite sides across runs, not within this run: level 1 was +2.5 SD last run, -2.5 SD now.
  const across = westgardMultirule({
    ...base, current1: '95', current2: '200', previous1: '105', previous2: '200',
  });
  assert.equal(across.rules.includes('R-4s'), false, 'R-4s must not be read between runs');
  // Within this run it does fire.
  assert.ok(run(105, 191).rules.includes('R-4s'));
});

test('4-1s needs four consecutive past the SAME 1s limit, and may cross levels and runs', () => {
  // Series order is oldest run first, level 1 then level 2. Build four in a row past +1s:
  // run1 L1 +1.5, run1 L2 +1.5, run2(current) L1 +1.5, L2 +1.5.
  const r = run(103, 206, '103', '206');
  assert.ok(r.rules.includes('4-1s'));
  assert.ok(r.notes.some((n) => /last four measurements are all past \+1s/.test(n)));

  // Alternating sides is NOT a 4-1s.
  const alternating = run(103, 194, '103', '194');
  assert.equal(alternating.rules.includes('4-1s'), false, 'alternating sides must not read as 4-1s');
});

test('4-1s and 10-x say so when there are not enough measurements to evaluate them', () => {
  const r = run(101, 202);
  assert.ok(r.notes.some((n) => /4-1s rule needs four consecutive/.test(n)));
  assert.ok(r.notes.some((n) => /10-x rule needs ten consecutive/.test(n)));
  assert.equal(r.measurements, 2);
});

test('10-x fires on ten consecutive on one side, and counts two per run', () => {
  // Four previous runs + this run = 10 measurements, all above the mean.
  const prev1 = ['101', '101', '101', '101'].join('\n');
  const prev2 = ['202', '202', '202', '202'].join('\n');
  const r = run(101, 202, prev1, prev2);
  assert.equal(r.measurements, 10);
  assert.ok(r.rules.includes('10-x'));
  assert.ok(r.notes.some((n) => /all above their means/.test(n)));

  // One point below the mean breaks the run of ten.
  const broken = run(101, 202, ['101', '99', '101', '101'].join('\n'), prev2);
  assert.equal(broken.rules.includes('10-x'), false);
});

test('a rule that fires with no 1-2s warning is shown, not suppressed', () => {
  // Ten on one side, all within 1s: 10-x fires and nothing is past 2s.
  const r = run(101, 202, ['101', '101', '101', '101'].join('\n'), ['202', '202', '202', '202'].join('\n'));
  assert.equal(r.warning, false);
  assert.ok(r.rules.includes('10-x'));
  assert.ok(r.notes.some((n) => /computer application applies the rejection rules directly/.test(n)),
    'the classic trigger and the computer reading must both be stated');
});

test('the consecutive order is stated, because it changes whether 4-1s and 10-x fire', () => {
  const r = run(101, 202);
  assert.ok(r.notes.some((n) => /oldest run first/.test(n) && /change whether they fire/.test(n)));
});

test('the three-level rules are declared unevaluated rather than guessed', () => {
  const r = run(101, 202);
  assert.ok(r.notes.some((n) => /2of3-2s/.test(n) && /not been read/.test(n)));
  assert.deepEqual(RULES.map((x) => x.label), ['1-3s', '2-2s', 'R-4s', '4-1s', '10-x']);
});

test('an SD of zero is refused, and the levels must be paired run for run', () => {
  assert.match(westgardMultirule({ ...base, sd1: '0', current1: '100', current2: '200' }).message, /SD above zero/);
  const mismatched = westgardMultirule({
    ...base, current1: '100', current2: '200', previous1: '101\n102', previous2: '202',
  });
  assert.equal(mismatched.valid, false);
  assert.match(mismatched.message, /different numbers of previous runs/);
});

test('a series takes one result per line, and a blank line is not a zero', () => {
  assert.deepEqual(parseSeries('101\n\n102\n', 'L1').values, [101, 102]);
  assert.match(parseSeries('101\nabc', 'Level 1 previous runs').error, /line 2/);
  // A blank series is simply no history.
  assert.deepEqual(parseSeries('', 'L1').values, []);
});

test('a rejected run is called an investigation of the method, not of a patient', () => {
  const r = run(107, 200);
  assert.match(r.note, /signal to investigate the method, not a patient result/);
  assert.equal(r.abnormal, true);
});
