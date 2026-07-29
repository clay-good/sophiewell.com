// spec-v585: the updated RUCAM.
//
// The load-bearing tests are that the R ratio selects the scale (with mixed borrowing the cholestatic one),
// that the same enum key is worth different points on the two scales, and that a timing exclusion produces
// no total at all.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rucam, scaleMaximum, R_HEPATOCELLULAR, R_CHOLESTATIC,
  ONSET_ITEMS, COURSE_ITEMS, RISK_DOMAIN_MAX, AGE_RISK_THRESHOLD,
} from '../../lib/rucam-v585.js';

// R = (500/40) / (120/120) = 12.5 -> hepatocellular
const HEP = {
  alt: '500', altUln: '40', alp: '120', alpUln: '120',
  onset: 'first-5-90', course: 'fall-50-by-8-days',
  ageAtLeast55: 'no', alcoholOrPregnancy: 'no',
  concomitant: 'none-or-incompatible', exclusion: 'all-excluded',
  priorInfo: 'labeled', rechallenge: 'not-done',
};
const at = (over = {}) => rucam({ ...HEP, ...over });
// R = (100/40) / (600/120) = 0.5 -> cholestatic
const chol = (over = {}) => at({ alt: '100', alp: '600', course: 'fall-50-by-180-days', ...over });
// R = (200/40) / (150/120) = 4 -> mixed
const mixed = (over = {}) => at({ alt: '200', alp: '150', course: 'fall-50-by-180-days', ...over });

// THE scale selection.
test('the R ratio selects the pattern at the published boundaries', () => {
  assert.equal(at().pattern, 'hepatocellular');
  assert.equal(chol().pattern, 'cholestatic');
  assert.equal(mixed().pattern, 'mixed');
  // exactly at the boundaries
  assert.equal(at({ alt: '200', alp: '120', altUln: '40', alpUln: '120' }).rRatio, R_HEPATOCELLULAR);
  assert.equal(at({ alt: '200', alp: '120', altUln: '40', alpUln: '120' }).pattern, 'hepatocellular');
  assert.equal(chol({ alt: '80', alp: '120', altUln: '40', alpUln: '120' }).rRatio, R_CHOLESTATIC);
  assert.equal(chol({ alt: '80', alp: '120', altUln: '40', alpUln: '120' }).pattern, 'cholestatic');
});

test('mixed injury is scored on the cholestatic scale, having none of its own', () => {
  const r = mixed();
  assert.equal(r.pattern, 'mixed');
  assert.equal(r.scale, 'cholestatic');
  assert.match(r.bandText, /MIXED IS SCORED ON THE CHOLESTATIC TABLE/);
});

test('the laboratory values are required before any item can be scored', () => {
  const r = rucam({ ...HEP, alt: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /BEFORE any item is answered/);
});

// THE same key, different points.
test('the same onset key is worth different points on the two scales', () => {
  const hepPrior = ONSET_ITEMS.hepatocellular.find((i) => i.value === 'prior-window');
  const cholPrior = ONSET_ITEMS.cholestatic.find((i) => i.value === 'prior-window');
  assert.equal(hepPrior.points, cholPrior.points, 'the points match here');
  assert.match(hepPrior.text, /1 to 15 days/);
  assert.match(cholPrior.text, /1 to 90 days/, 'but the window does not');
});

test('the course domain has different values and different ranges on the two scales', () => {
  const hepPts = COURSE_ITEMS.hepatocellular.map((i) => i.points);
  const cholPts = COURSE_ITEMS.cholestatic.map((i) => i.points);
  assert.equal(Math.max(...hepPts), 3);
  assert.equal(Math.min(...hepPts), -2);
  assert.equal(Math.max(...cholPts), 2);
  assert.equal(Math.min(...cholPts), 0, 'the cholestatic dechallenge cannot go negative');
});

test('a course value from the wrong scale is refused rather than silently scored', () => {
  const r = chol({ course: 'fall-50-by-8-days' });
  assert.equal(r.valid, false);
  assert.match(r.message, /Course after stopping/);
  assert.equal(r.scale, 'cholestatic');
});

// THE exclusion.
test('a timing exclusion produces no total at all', () => {
  for (const v of ['before-starting', 'after-stopping-beyond']) {
    const r = at({ onset: v });
    assert.equal(r.valid, true);
    assert.equal(r.excluded, true);
    assert.equal(r.total, null);
    assert.equal(r.band, 'Case excluded on timing');
    assert.match(r.bandText, /EXCLUSION, NOT A LOW SCORE/);
  }
});

test('the exclusion window differs by scale and the result says which applied', () => {
  assert.match(ONSET_ITEMS.hepatocellular.find((i) => i.value === 'after-stopping-beyond').text, /15 days/);
  assert.match(ONSET_ITEMS.cholestatic.find((i) => i.value === 'after-stopping-beyond').text, /30 days/);
  assert.match(chol({ onset: 'after-stopping-beyond' }).bandText, /cholestatic scale/);
});

// Bands and the unequal ranges behind them.
test('the causality bands sit where the source puts them', () => {
  const band = (over) => at(over).band;
  assert.equal(band({ exclusion: 'alternative-highly-probable', concomitant: 'proven-cause', priorInfo: 'unknown', course: 'fall-under-50-after-30' }), 'Excluded');
  assert.equal(at().total, 9);
  assert.equal(at().band, 'Highly probable');
  assert.equal(at({ priorInfo: 'published' }).total, 8);
  assert.equal(at({ priorInfo: 'published' }).band, 'Probable');
  assert.equal(at({ course: 'fall-50-by-30-days', priorInfo: 'published' }).total, 7);
  assert.equal(at({ rechallenge: 'positive' }).total, 12);
});

test('the two scales have different reachable maxima but share the bands', () => {
  assert.equal(scaleMaximum('hepatocellular'), 14);
  assert.equal(scaleMaximum('cholestatic'), 13);
  assert.notEqual(scaleMaximum('hepatocellular'), scaleMaximum('cholestatic'));
  assert.match(at().bandText, /not equally hard to reach on the two/);
  assert.equal(at().scaleMax, 14);
  assert.equal(chol().scaleMax, 13);
});

// Negative points.
test('negative domains can argue a case out of causality', () => {
  const r = at({ concomitant: 'proven-cause', exclusion: 'alternative-highly-probable' });
  assert.equal(r.points.concomitant, -3);
  assert.equal(r.points.exclusion, -3);
  assert.ok(r.total < at().total - 5);
  assert.match(r.bandText, /argued out of causality as well as into it/);
});

// The reconciled cell.
test('the risk domain is capped at two and the reconciliation is disclosed', () => {
  const both = at({ ageAtLeast55: 'yes', alcoholOrPregnancy: 'yes' });
  assert.equal(both.points.risk, RISK_DOMAIN_MAX);
  assert.equal(at({ ageAtLeast55: 'yes' }).points.risk, 1);
  assert.equal(AGE_RISK_THRESHOLD, 55);
  assert.match(both.bandText, /reconciled rather than recalled/);
});

// Input handling.
test('every domain is required and named when missing', () => {
  const r = rucam({ ...HEP, priorInfo: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /priorInfo/);
});

test('the scope note separates causality from severity and refuses to justify rechallenge', () => {
  const r = at();
  assert.match(r.note, /grades causality, not severity/);
  assert.match(r.note, /never be used to justify readministration/);
  assert.match(r.bandText, /deliberate rechallenge has killed patients|Deliberate readministration/i);
});
