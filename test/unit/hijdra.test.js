// spec-v609: the Hijdra sum score.
//
// The load-bearing tests are that the cisternal and ventricular level definitions DIFFER at the same numeric
// value, and that no band is ever returned because the instrument has none.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hijdraScore, CISTERNS, VENTRICLES, CISTERN_LEVELS, VENTRICLE_LEVELS,
  CISTERNAL_MAX, VENTRICULAR_MAX, TOTAL_MAX,
} from '../../lib/hijdra-v609.js';

const SITES = [...CISTERNS, ...VENTRICLES];
function at(overrides = {}, base = 0) {
  const input = {};
  for (const s of SITES) input[s.key] = String(base);
  for (const [k, v] of Object.entries(overrides)) input[k] = String(v);
  return hijdraScore(input);
}

test('the instrument is 10 cisterns and 4 ventricles', () => {
  assert.equal(CISTERNS.length, 10);
  assert.equal(VENTRICLES.length, 4);
  assert.equal(new Set(SITES.map((s) => s.key)).size, 14, 'keys are unique');
});

test('the subtotals and total are 30, 12 and 42', () => {
  assert.equal(CISTERNAL_MAX, 30);
  assert.equal(VENTRICULAR_MAX, 12);
  assert.equal(TOTAL_MAX, 42);
  const worst = at({}, 3);
  assert.equal(worst.cisternal, 30);
  assert.equal(worst.ventricular, 12);
  assert.equal(worst.total, 42);
  assert.equal(at({}, 0).total, 0);
});

// THE finding: same numbers, different meanings.
test('the two halves define the same 0-to-3 values differently', () => {
  assert.deepEqual(CISTERN_LEVELS.map((l) => l.value), VENTRICLE_LEVELS.map((l) => l.value));
  const cisternWords = CISTERN_LEVELS.map((l) => l.text);
  const ventricleWords = VENTRICLE_LEVELS.map((l) => l.text);
  assert.notDeepEqual(cisternWords, ventricleWords);
  assert.equal(CISTERN_LEVELS[1].text, 'Small amount of blood');
  assert.equal(VENTRICLE_LEVELS[1].text, 'Sedimentation of blood in the posterior part');
  assert.equal(CISTERN_LEVELS[2].text, 'Moderately filled with blood');
  assert.equal(VENTRICLE_LEVELS[2].text, 'Partly filled with blood');
});

test('only the 0 and 3 anchors are shared between the halves', () => {
  const shared = CISTERN_LEVELS.filter((c, i) => c.text === VENTRICLE_LEVELS[i].text).map((c) => c.value);
  assert.deepEqual(shared, [0, 3]);
});

test('the anchor difference is stated in every result', () => {
  assert.match(at().bandText, /DIFFERENT ANCHOR DEFINITIONS/);
  assert.match(at().bandText, /sedimentation of blood in the posterior part/i);
});

// THE paired sites.
test('eight of the ten cisternal sites are paired and only two are midline', () => {
  assert.equal(CISTERNS.filter((s) => s.paired).length, 8);
  assert.deepEqual(CISTERNS.filter((s) => !s.paired).map((s) => s.key), ['interhemispheric', 'quadrigeminal']);
  assert.equal(VENTRICLES.filter((s) => s.paired).length, 2);
  assert.deepEqual(VENTRICLES.filter((s) => !s.paired).map((s) => s.key), ['third', 'fourth']);
});

test('scoring a paired structure once instead of twice loses half its points', () => {
  const both = at({ sylvianLateralLeft: 3, sylvianLateralRight: 3 });
  const one = at({ sylvianLateralLeft: 3 });
  assert.equal(both.total, 6);
  assert.equal(one.total, 3);
});

test('the paired warning names the four doubled structures', () => {
  const t = at().bandText;
  assert.match(t, /EIGHT OF THE TEN CISTERNAL SITES ARE PAIRED/);
  assert.match(t, /SIX named structures/);
});

// THE withheld band.
test('no severity band is ever returned', () => {
  for (const base of [0, 1, 2, 3]) assert.equal(at({}, base).band, null, `base ${base}`);
  assert.match(at().bandText, /NO official severity bands/);
  assert.match(at().bandText, /reported and not used to band the result/);
});

test('the reported study thresholds are stated but not applied', () => {
  const t = at({}, 2).bandText;   // total 28, above one threshold and beyond the other
  assert.match(t, /19 or below/);
  assert.match(t, /23 or above/);
  assert.equal(at({}, 2).band, null);
});

// THE outcome-dependent ranking.
test('the result says which scale wins depends on the outcome', () => {
  const t = at().bandText;
  assert.match(t, /0\.78/);
  assert.match(t, /0\.68/);
  assert.match(t, /0\.62/);
  assert.match(t, /DELAYED CEREBRAL ISCHEMIA/);
  assert.match(t, /ranking flips/);
});

test('the subtotals are reported separately, not just the total', () => {
  const r = at({ interhemispheric: 3, third: 2 });
  assert.equal(r.cisternal, 3);
  assert.equal(r.ventricular, 2);
  assert.equal(r.total, 5);
  assert.equal(r.cisternsWithBlood, 1);
  assert.equal(r.ventriclesWithBlood, 1);
});

test('the inputs are validated', () => {
  assert.equal(hijdraScore({}).valid, false);
  assert.match(hijdraScore({}).message, /Score all 14 sites/);
  assert.match(at({ third: 4 }).message, /must be 0, 1, 2 or 3/);
  const partial = {};
  for (const s of SITES.slice(0, 10)) partial[s.key] = '0';
  assert.match(hijdraScore(partial).message, /4 still unscored/);
});

test('the scope note separates blood burden from diagnosis and clinical severity', () => {
  const r = at();
  assert.match(r.note, /does not diagnose subarachnoid hemorrhage/);
  assert.match(r.note, /does not measure clinical severity/);
  assert.match(r.note, /Hunt and Hess and WFNS/);
  assert.match(r.note, /does not decide whether or when to treat vasospasm/);
});
