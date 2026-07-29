// spec-v584: the EBMT (Gratwohl) risk score.
//
// The load-bearing tests are the first-CR suppression of the timing item and the one-directional sex item.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ebmtScore, AGE_BANDS, STAGE_BANDS, DONOR_TYPES,
  TIME_THRESHOLD_MONTHS, EBMT_MAX, EBMT_MAX_FIRST_CR,
} from '../../lib/ebmt-score-v584.js';

const BEST = {
  ageBand: 'under-20', diseaseStage: 'early', firstCompleteRemission: 'no',
  monthsFromDiagnosis: '3', donorType: 'hla-identical-sibling', femaleDonorMaleRecipient: 'no',
};
const at = (over = {}) => ebmtScore({ ...BEST, ...over });

test('the range and bands are the published ones', () => {
  assert.equal(EBMT_MAX, 7);
  assert.equal(at().total, 0);
  assert.equal(at().riskGroup, 'Low risk');
  assert.equal(at({ ageBand: 'over-40' }).riskGroup, 'Low risk');           // 2
  assert.equal(at({ ageBand: 'over-40', diseaseStage: 'intermediate' }).riskGroup, 'Intermediate risk'); // 3
  const worst = at({ ageBand: 'over-40', diseaseStage: 'late', monthsFromDiagnosis: '36', donorType: 'unrelated', femaleDonorMaleRecipient: 'yes' });
  assert.equal(worst.total, EBMT_MAX);
  assert.equal(worst.riskGroup, 'Poor risk');
});

test('the item points sum to the published maximum', () => {
  const maxAge = Math.max(...AGE_BANDS.map((a) => a.points));
  const maxStage = Math.max(...STAGE_BANDS.map((s) => s.points));
  const maxDonor = Math.max(...DONOR_TYPES.map((d) => d.points));
  assert.equal(maxAge + maxStage + 1 + maxDonor + 1, EBMT_MAX);
});

// THE disappearing item.
test('first complete remission suppresses the timing item entirely', () => {
  const late = at({ monthsFromDiagnosis: '36' });
  assert.equal(late.points.time, 1);
  const firstCR = at({ firstCompleteRemission: 'yes', monthsFromDiagnosis: '36' });
  assert.equal(firstCR.points.time, 0, 'three years in first CR still scores 0');
  assert.equal(firstCR.timeItemSuppressed, true);
  assert.match(firstCR.bandText, /DOES NOT APPLY/);
});

test('the maximum reachable score in first CR is six, not seven', () => {
  const r = at({
    ageBand: 'over-40', diseaseStage: 'late', firstCompleteRemission: 'yes',
    monthsFromDiagnosis: '120', donorType: 'unrelated', femaleDonorMaleRecipient: 'yes',
  });
  assert.equal(r.total, EBMT_MAX_FIRST_CR);
  assert.equal(r.maxReachable, EBMT_MAX_FIRST_CR);
  assert.equal(EBMT_MAX_FIRST_CR, EBMT_MAX - 1);
});

test('the interval is not required in first CR and is required outside it', () => {
  const suppressed = ebmtScore({ ...BEST, firstCompleteRemission: 'yes', monthsFromDiagnosis: '' });
  assert.equal(suppressed.valid, true);
  const needed = ebmtScore({ ...BEST, monthsFromDiagnosis: '' });
  assert.equal(needed.valid, false);
  assert.match(needed.message, /only needed outside first complete remission/);
});

// The timing partition.
test('exactly twelve months scores zero, closing the hole one rendering leaves', () => {
  assert.equal(at({ monthsFromDiagnosis: String(TIME_THRESHOLD_MONTHS) }).points.time, 0);
  assert.equal(at({ monthsFromDiagnosis: String(TIME_THRESHOLD_MONTHS + 0.1) }).points.time, 1);
  assert.match(at().bandText, /leaves an interval of exactly 12 months unclassified/);
});

// THE one-directional item.
test('only a female donor into a male recipient scores', () => {
  assert.equal(at({ femaleDonorMaleRecipient: 'yes' }).points.sex, 1);
  assert.equal(at({ femaleDonorMaleRecipient: 'no' }).points.sex, 0);
  assert.match(at().bandText, /not a "sex mismatch" item/);
});

// The donor hole.
test('only the two published donor categories exist and the gap is stated', () => {
  assert.deepEqual(DONOR_TYPES.map((d) => d.value), ['hla-identical-sibling', 'unrelated']);
  const bad = ebmtScore({ ...BEST, donorType: 'haploidentical' });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /hla-identical-sibling, unrelated/);
  assert.match(at().bandText, /HAPLOIDENTICAL AND CORD-BLOOD DONORS HAVE NO DEFINED VALUE/);
});

// The disease-specific override.
test('the aplastic anemia override is surfaced', () => {
  assert.match(at().bandText, /Severe aplastic anemia always scores 0/);
  assert.match(STAGE_BANDS[0].detail, /ALWAYS early/);
});

// Input handling.
test('every categorical item is required', () => {
  assert.equal(ebmtScore({}).valid, false);
  assert.equal(ebmtScore({ ...BEST, ageBand: '' }).valid, false);
  assert.equal(ebmtScore({ ...BEST, femaleDonorMaleRecipient: '' }).valid, false);
});

test('the scope note refuses the transplant decision and names the complementary index', () => {
  const r = at();
  assert.match(r.note, /does not decide whether to transplant/);
  assert.match(r.note, /not a reason to withhold transplantation/);
  assert.match(r.note, /which is what the HCT-CI does/);
});
