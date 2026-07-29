// spec-v613: the PEDIS classification and score.
//
// The load-bearing tests are the grade-to-score off-by-one (adding grades instead of scores inflates the
// total by exactly 5) and the unequal category weighting, with sensation worth only one point of twelve.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pedis, findGrade, CATEGORIES, MAX_SCORE, MIN_SCORE, GRADE_SUM_AT_MINIMUM, GRADE_SUM_AT_MAXIMUM,
} from '../../lib/pedis-v613.js';

const atGrades = (fn) => {
  const input = {};
  for (const c of CATEGORIES) input[c.key] = String(fn(c));
  return pedis(input);
};
const allLowest = () => atGrades(() => 1);
const allHighest = () => atGrades((c) => c.grades.length);

test('the classification is five categories spelling PEDIS', () => {
  assert.equal(CATEGORIES.length, 5);
  assert.deepEqual(CATEGORIES.map((c) => c.letter), ['P', 'E', 'D', 'I', 'S']);
  assert.deepEqual(CATEGORIES.map((c) => c.name),
    ['Perfusion', 'Extent', 'Depth', 'Infection', 'Sensation']);
});

// THE off-by-one.
test('the score contribution is the grade minus one', () => {
  for (const c of CATEGORIES) {
    for (const g of c.grades) {
      const r = atGrades((cat) => (cat.key === c.key ? g.grade : 1));
      const row = r.perCategory.find((x) => x.key === c.key);
      assert.equal(row.score, g.grade - 1, `${c.name} grade ${g.grade}`);
    }
  }
});

test('the extremes are 0 and 12, while the grade sums are 5 and 17', () => {
  const lo = allLowest();
  const hi = allHighest();
  assert.equal(lo.score, MIN_SCORE);
  assert.equal(lo.score, 0);
  assert.equal(lo.gradeSum, GRADE_SUM_AT_MINIMUM);
  assert.equal(lo.gradeSum, 5);
  assert.equal(hi.score, MAX_SCORE);
  assert.equal(hi.score, 12);
  assert.equal(hi.gradeSum, GRADE_SUM_AT_MAXIMUM);
  assert.equal(hi.gradeSum, 17);
});

test('adding the grades instead of the scores inflates the total by exactly five, always', () => {
  const cases = [allLowest(), allHighest(), atGrades((c) => Math.min(2, c.grades.length))];
  for (const r of cases) {
    assert.equal(r.gradeSum - r.score, CATEGORIES.length, r.profile);
    assert.equal(r.gradeSum - r.score, 5);
  }
});

test('the inflation is spelled out in the result', () => {
  const r = allLowest();
  assert.match(r.bandText, /Adding the grades instead would give 5, which is 5 too high/);
  assert.match(r.bandText, /OFF BY ONE/);
});

// THE unequal weighting.
test('the categories have different numbers of grades', () => {
  assert.deepEqual(CATEGORIES.map((c) => c.grades.length), [3, 4, 4, 4, 2]);
  assert.notEqual(new Set(CATEGORIES.map((c) => c.grades.length)).size, 1);
});

test('sensation is worth only one point of twelve - the least of any category', () => {
  const hi = allHighest();
  const sensation = hi.perCategory.find((r) => r.key === 'sensation');
  assert.equal(sensation.maxScore, 1);
  const others = hi.perCategory.filter((r) => r.key !== 'sensation');
  for (const r of others) assert.ok(r.maxScore > sensation.maxScore, `${r.name} outweighs sensation`);
  assert.match(hi.bandText, /SENSATION CARRIES THE LEAST WEIGHT/);
});

test('extent, depth and infection each carry the most', () => {
  const hi = allHighest();
  const three = hi.perCategory.filter((r) => r.maxScore === 3).map((r) => r.key);
  assert.deepEqual(three, ['extent', 'depth', 'infection']);
  assert.equal(hi.perCategory.find((r) => r.key === 'perfusion').maxScore, 2);
});

// THE two identities.
test('the profile and the score are both returned and kept separate', () => {
  const r = atGrades((c) => (c.key === 'depth' ? 3 : 2 <= c.grades.length ? 2 : 1));
  assert.match(r.profile, /^P\d E\d D\d I\d S\d$/);
  assert.equal(typeof r.score, 'number');
  assert.notEqual(r.profile, String(r.score));
  assert.match(r.bandText, /TWO IDENTITIES/);
  assert.match(r.bandText, /research CLASSIFICATION/);
});

test('the profile letters follow the published grade numbers, not the scores', () => {
  const r = allHighest();
  assert.equal(r.profile, 'P3 E4 D4 I4 S2');
  assert.equal(r.score, 12);
});

test('the extent measurement rule is stated', () => {
  assert.match(allLowest().bandText, /largest diameter multiplied by the second largest/);
  assert.match(allLowest().bandText, /area, not a length/);
});

// Input handling.
test('grades outside a category range are rejected', () => {
  assert.equal(findGrade(CATEGORIES[0], 4), null, 'perfusion has only 3 grades');
  assert.equal(findGrade(CATEGORIES[4], 3), null, 'sensation has only 2 grades');
  assert.equal(findGrade(CATEGORIES[1], 4).grade, 4, 'extent does have a grade 4');
  assert.equal(findGrade(CATEGORIES[0], 0), null);
  assert.equal(findGrade(CATEGORIES[0], '2').grade, 2);
  assert.equal(findGrade(CATEGORIES[0], '2.5'), null);
});

test('the inputs are validated', () => {
  assert.equal(pedis({}).valid, false);
  assert.match(pedis({}).message, /5 still ungraded/);
  assert.match(pedis({}).message, /Perfusion 1 to 3/);
  assert.match(pedis({ perfusion: '9' }).message, /still ungraded/);
});

test('the scope note keeps PEDIS off diagnosis, off treatment and off clinical prognosis', () => {
  const r = allHighest();
  assert.match(r.note, /does not diagnose infection or peripheral arterial disease/);
  assert.match(r.note, /does not decide antibiotics, revascularization or amputation/);
  assert.match(r.note, /prognostic value in ordinary clinical practice is not established/);
});
