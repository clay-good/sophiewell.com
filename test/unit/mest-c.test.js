// spec-v528: the Oxford classification (MEST-C) of IgA nephropathy.
// Worked-example tests: the five lesions and their score levels, the code output, the deliberate REFUSAL to
// produce a total, the M-score-not-percentage threshold wording, case-insensitive parsing, and the guards.
// Lesion definitions transcribed from the 2009 Oxford classification and the 2016 update (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mestC, MEST_C_LESIONS } from '../../lib/mest-c-v528.js';

const FULL = { M: 'M1', E: 'E0', S: 'S1', T: 'T1', C: 'C0' };

test('five lesions, in the order the acronym spells', () => {
  assert.deepEqual(MEST_C_LESIONS.map((l) => l.key), ['M', 'E', 'S', 'T', 'C']);
});

test('M, E and S are binary; T and C have three levels', () => {
  const byKey = Object.fromEntries(MEST_C_LESIONS.map((l) => [l.key, l]));
  assert.equal(byKey.M.options.length, 2);
  assert.equal(byKey.E.options.length, 2);
  assert.equal(byKey.S.options.length, 2);
  assert.equal(byKey.T.options.length, 3);
  assert.equal(byKey.C.options.length, 3);
});

test('the result is a code, not a score (the META example)', () => {
  const r = mestC(FULL);
  assert.equal(r.valid, true);
  assert.equal(r.code, 'M1 E0 S1 T1 C0');
  assert.equal(r.bandLabel, 'MEST-C M1 E0 S1 T1 C0');
});

test('no total is produced, and the copy says why', () => {
  const r = mestC(FULL);
  assert.equal(r.total, undefined);
  assert.equal(r.score, undefined);
  assert.match(r.band, /not summed/);
  assert.match(r.band, /research proposal rather than the standard biopsy report/);
  assert.match(r.note, /adding five independent lesions .* would flatten information/);
});

test('each lesion is reported separately with its own score', () => {
  const r = mestC(FULL);
  assert.equal(r.lesions.length, 5);
  assert.deepEqual(r.lesions.map((l) => l.score), ['M1', 'E0', 'S1', 'T1', 'C0']);
  assert.equal(r.lesions[0].name, 'Mesangial hypercellularity');
  assert.equal(r.lesions[4].name, 'Cellular or fibrocellular crescents');
});

test('the M threshold is the mesangial score, not a percentage of glomeruli', () => {
  const m = MEST_C_LESIONS.find((l) => l.key === 'M');
  assert.match(m.options[0].text, /score at or below 0\.5/);
  assert.match(m.options[1].text, /score above 0\.5/);
  assert.match(m.detail, /not from a percentage of glomeruli/);
  assert.match(mestC(FULL).note, /rather than from a percentage of glomeruli/);
});

test('the T and C cut points sit where the sources put them', () => {
  const byKey = Object.fromEntries(MEST_C_LESIONS.map((l) => [l.key, l]));
  assert.match(byKey.T.options[0].text, /0 to 25 percent/);
  assert.match(byKey.T.options[1].text, /26 to 50 percent/);
  assert.match(byKey.T.options[2].text, /above 50 percent/);
  assert.match(byKey.C.options[1].text, /above 0 and below 25 percent/);
  assert.match(byKey.C.options[2].text, /25 percent or more/);
});

test('T is a share of cortical area and C a share of glomeruli, and each says so', () => {
  const byKey = Object.fromEntries(MEST_C_LESIONS.map((l) => [l.key, l]));
  assert.match(byKey.T.detail, /cortical area, not of glomeruli/);
  assert.match(byKey.C.detail, /glomeruli sampled/);
});

test('the copy refuses the diagnosis and treatment readings', () => {
  const r = mestC(FULL);
  assert.match(r.note, /does not diagnose IgA nephropathy/);
  assert.match(r.note, /mesangial IgA deposition on immunofluorescence/);
  assert.match(r.note, /not a treatment algorithm/);
});

test('scores are case-insensitive and tolerate surrounding space', () => {
  const r = mestC({ M: 'm0', E: ' e1 ', S: 'S0', T: 't2', C: 'c2' });
  assert.equal(r.code, 'M0 E1 S0 T2 C2');
});

test('a missing lesion is invalid and names which', () => {
  assert.equal(mestC({}).valid, false);
  const r = mestC({ M: 'M1', E: 'E0', S: 'S1' });
  assert.equal(r.valid, false);
  assert.match(r.message, /T \(Tubular atrophy/);
  assert.match(r.message, /C \(Cellular or fibrocellular crescents\)/);
});

test('a score from the wrong lesion, or an out-of-range level, is invalid', () => {
  const wrongLesion = mestC({ ...FULL, M: 'E1' });
  assert.equal(wrongLesion.valid, false);
  assert.match(wrongLesion.message, /expected M0 or M1/);

  const outOfRange = mestC({ ...FULL, M: 'M2' });   // M has no level 2
  assert.equal(outOfRange.valid, false);

  const tTooHigh = mestC({ ...FULL, T: 'T3' });     // T stops at 2
  assert.equal(tTooHigh.valid, false);
});
