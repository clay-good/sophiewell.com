// spec-v606: the new Katagiri score.
//
// The load-bearing tests are that the two laboratory tiers share no analyte -- so a single critical value
// outscores every abnormal value combined -- and that the primary-site groups are treatability, not organ.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  katagiri, PRIMARY_SITE_GROUPS, VISCERAL_GROUPS, ABNORMAL_LABS, CRITICAL_LABS,
  BINARY_ITEMS, BANDS, MAX_SCORE,
} from '../../lib/katagiri-v606.js';

const BASE = {
  primarySite: 'slow', visceralMetastases: 'none',
  ...Object.fromEntries([...ABNORMAL_LABS, ...CRITICAL_LABS].map((l) => [l.key, 'no'])),
  ...Object.fromEntries(BINARY_ITEMS.map((b) => [b.key, 'no'])),
};
const at = (over = {}) => katagiri({ ...BASE, ...over });

test('the score runs 0 to 10', () => {
  assert.equal(MAX_SCORE, 10);
  assert.equal(at().total, 0);
  const worst = at({
    primarySite: 'rapid', visceralMetastases: 'disseminated', plateletsLow: 'yes',
    ...Object.fromEntries(BINARY_ITEMS.map((b) => [b.key, 'yes'])),
  });
  assert.equal(worst.total, MAX_SCORE);
});

// THE two-tier laboratory item.
test('the two laboratory tiers share no analyte', () => {
  const abnormalKeys = ABNORMAL_LABS.map((l) => l.key);
  const criticalKeys = CRITICAL_LABS.map((l) => l.key);
  assert.equal(abnormalKeys.filter((k) => criticalKeys.includes(k)).length, 0);
});

test('a single critical value outscores every abnormal value combined', () => {
  const allAbnormal = at(Object.fromEntries(ABNORMAL_LABS.map((l) => [l.key, 'yes'])));
  const oneCritical = at({ plateletsLow: 'yes' });
  assert.equal(allAbnormal.laboratoryPoints, 1, 'three abnormal values still score 1');
  assert.equal(oneCritical.laboratoryPoints, 2, 'one critical value scores 2');
  assert.ok(oneCritical.laboratoryPoints > allAbnormal.laboratoryPoints);
});

test('each tier is any-of', () => {
  for (const l of ABNORMAL_LABS) assert.equal(at({ [l.key]: 'yes' }).laboratoryPoints, 1, l.key);
  for (const l of CRITICAL_LABS) assert.equal(at({ [l.key]: 'yes' }).laboratoryPoints, 2, l.key);
});

test('critical outranks abnormal and the item never reaches 3', () => {
  const both = at({ crpHigh: 'yes', plateletsLow: 'yes' });
  assert.equal(both.laboratoryPoints, 2);
  assert.equal(both.bothLabTiersPresent, true);
  assert.match(both.bandText, /CRITICAL outranks abnormal/);
  const everything = at(Object.fromEntries([...ABNORMAL_LABS, ...CRITICAL_LABS].map((l) => [l.key, 'yes'])));
  assert.equal(everything.laboratoryPoints, 2, 'never 3');
});

test('the tier structure is explained in every result', () => {
  assert.match(at().bandText, /TWO TIERS OF DIFFERENT ANALYTES/);
  assert.match(at().bandText, /SHARE NO ANALYTE/);
});

// THE treatability grouping.
test('the primary-site groups are treatability, and the same organ appears twice', () => {
  const slow = PRIMARY_SITE_GROUPS.find((g) => g.value === 'slow');
  const moderate = PRIMARY_SITE_GROUPS.find((g) => g.value === 'moderate');
  const rapid = PRIMARY_SITE_GROUPS.find((g) => g.value === 'rapid');
  assert.match(slow.examples, /hormone-DEPENDENT breast or prostate/);
  assert.match(moderate.examples, /hormone-INDEPENDENT breast or prostate/);
  assert.match(moderate.examples, /molecularly targeted lung/);
  assert.match(rapid.examples, /non-targeted lung/);
  assert.deepEqual([slow.points, moderate.points, rapid.points], [0, 2, 3]);
});

test('the same organ scores differently by treatability', () => {
  // Breast: slow if hormone-dependent, moderate if not.
  assert.equal(at({ primarySite: 'slow' }).primarySitePoints, 0);
  assert.equal(at({ primarySite: 'moderate' }).primarySitePoints, 2);
  assert.match(at().bandText, /NAMING THE ORGAN DOES NOT|Naming the organ does not determine the score/);
});

test('the primary-site item carries the single largest weight', () => {
  const maxSite = Math.max(...PRIMARY_SITE_GROUPS.map((g) => g.points));
  const maxVisceral = Math.max(...VISCERAL_GROUPS.map((g) => g.points));
  assert.equal(maxSite, 3);
  assert.ok(maxSite > maxVisceral);
  assert.ok(maxSite > 2, 'more than the laboratory item');
});

// The bands.
test('the bands and derivation survival figures are the published ones', () => {
  assert.deepEqual(BANDS.map((b) => b.oneYearSurvival), [91, 49, 6]);
  assert.equal(at().oneYearSurvivalPercent, 91);
  assert.equal(at({ primarySite: 'rapid', visceralMetastases: 'nodular' }).total, 4);
  assert.equal(at({ primarySite: 'rapid', visceralMetastases: 'nodular' }).oneYearSurvivalPercent, 49);
});

// Provenance.
test('the added laboratory item and the non-surgical cohort are stated', () => {
  assert.match(at().bandText, /added the laboratory item|ADDING the laboratory item/i);
  assert.match(at().bandText, /mostly NON-surgically/);
});

// Input handling and scope.
test('every item is required and the tier distinction is named in the message', () => {
  assert.equal(katagiri({}).valid, false);
  assert.match(katagiri({}).message, /DIFFERENT analytes/);
  assert.match(katagiri({ ...BASE, primarySite: 'breast' }).message, /slow, moderate, rapid/);
});

test('the scope note refuses the operative and modality decisions', () => {
  const r = at();
  assert.match(r.note, /does not decide whether to operate/);
  assert.match(r.note, /does not choose between surgery, radiotherapy and systemic treatment/);
  assert.match(r.note, /mechanical stability and fracture risk are separate axes/);
});
