// spec-v1772 (public-health-epidemiology tool 6): the herd immunity threshold and the coverage a vaccine of a
// given efficacy must reach. The tests are Table 9.3 of Martcheva's chapter and the worked example in
// Randolph and Barreiro.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { herdImmunityThreshold as h, R0_MAX } from '../../lib/herd-immunity-v1772.js';

// Martcheva M, An Introduction to Mathematical Epidemiology (Springer, 2015), chapter 9, Table 9.3,
// "Diseases and their eradication vaccination levels": disease, R0 range, the threshold in percent, the
// vaccine efficacy range, and the coverage needed in percent.
const TABLE_9_3 = [
  { disease: 'Smallpox', r0: [3, 5], threshold: [67, 80] },
  { disease: 'Measles', r0: [12, 13], threshold: [92, 92] },
  { disease: 'Mumps', r0: [4, 7], threshold: [75, 86] },
  { disease: 'Rubella', r0: [6, 7], threshold: [83, 86] },
  { disease: 'Chickenpox', r0: [9, 10], threshold: [89, 90] },
  { disease: 'Pertussis', r0: [13, 17], threshold: [92, 94] },
  { disease: 'Poliomyelitis', r0: [6, 6], threshold: [83, 83] },
  { disease: 'Diphtheria', r0: [4, 6], threshold: [75, 83] },
];

test('every R0 in Table 9.3 gives the threshold the table prints', () => {
  for (const row of TABLE_9_3) {
    for (const [i, r0] of row.r0.entries()) {
      const r = h({ r0 });
      assert.equal(r.valid, true, row.disease);
      assert.equal(Math.round(r.thresholdPercent), row.threshold[i], `${row.disease} at R0 ${r0}`);
    }
  }
});

test('the worked example in Randolph and Barreiro: R0 of 4 is a threshold of 0.75', () => {
  const r = h({ r0: 4 });
  assert.equal(r.thresholdPercent, 75);
  assert.match(r.band, /^Herd immunity threshold 75% of the population immune, at an R0 of 4\./);
  assert.equal(r.abnormal, false);
});

// The coverage column of Table 9.3, for the rows where the table's own figure and the formula agree. The
// three that do not are the next test.
test('an imperfect vaccine must cover more, as Table 9.3 prints it', () => {
  for (const [r0, efficacy, printed] of [[3, 75, 89], [4, 95, 79], [9, 95, 94], [12, 95, 97], [6, 99, 84], [4, 96, 78]]) {
    const r = h({ r0, efficacy });
    assert.equal(Math.round(r.coverageNeededPercent), printed, `R0 ${r0} at ${efficacy}% efficacy`);
    assert.equal(r.reachable, true);
  }
});

// Recorded rather than reproduced: the table divides its OWN ROUNDED threshold by the efficacy, so three of
// its coverage figures are a percentage point below the formula applied to the unrounded threshold. The
// unrounded figure is the one computed here, and it is the larger of the two in each case.
test('three coverage figures in Table 9.3 come from its rounded threshold, and the unrounded one is used here', () => {
  for (const [r0, efficacy, printed, exact] of [[6, 95, 87, 87.7], [6, 90, 92, 92.6], [6, 87, 95, 95.8]]) {
    const r = h({ r0, efficacy });
    assert.equal(r.coverageNeededPercent, exact, `R0 ${r0} at ${efficacy}%`);
    assert.ok(r.coverageNeededPercent > printed, `${exact} is above the table's ${printed}`);
    assert.equal(Math.round(((1 - 1 / r0) * 100).toFixed(0) / (efficacy / 100)), printed, 'the table\'s own path reproduces its figure');
  }
});

test('an efficacy at or below the threshold cannot reach it at any coverage', () => {
  const r = h({ r0: 13, efficacy: 75 });
  assert.equal(r.reachable, false);
  assert.ok(r.coverageNeededPercent > 100);
  assert.match(r.band, /cannot reach at any coverage/);
  assert.match(r.notes.join(' '), /efficacy above the threshold itself \(92\.3%\)/);
  // Martcheva's condition, at the boundary: an efficacy just above the threshold is reachable.
  assert.equal(h({ r0: 13, efficacy: 92.4 }).reachable, true);
  assert.equal(h({ r0: 13, efficacy: 92.3 }).reachable, false);
});

test('coverage entered is measured against the threshold, or against the coverage the vaccine needs', () => {
  const perfect = h({ r0: 5, coverage: 85 });
  assert.equal(perfect.reachesTarget, true);
  assert.equal(perfect.abnormal, false);
  assert.equal(perfect.gapPoints, -5);
  const imperfect = h({ r0: 4, efficacy: 90, coverage: 70 });
  assert.equal(imperfect.reachesTarget, false);
  assert.equal(imperfect.abnormal, true);
  assert.equal(imperfect.gapPoints, 13.3);
  assert.match(imperfect.band, /Coverage entered falls short\./);
  // The same 70% coverage is enough when the infection spreads less easily.
  assert.equal(h({ r0: 2, efficacy: 90, coverage: 70 }).reachesTarget, true);
});

test('an R0 of 1 or below has no threshold, and says why', () => {
  for (const r0 of [1, 0.9, 0.01]) {
    const r = h({ r0 });
    assert.equal(r.valid, false, String(r0));
    assert.match(r.message, /does not sustain itself/);
  }
});

test('the inputs are validated', () => {
  assert.match(h({}).message, /Enter the basic reproduction number/);
  assert.match(h({ r0: '   ' }).message, /Enter the basic reproduction number/);
  assert.match(h({ r0: -1 }).message, /must be between 0 and 50/);
  assert.match(h({ r0: R0_MAX + 1 }).message, /must be between 0 and 50/);
  assert.match(h({ r0: 0 }).message, /does not sustain itself/);
  assert.match(h({ r0: 4, efficacy: 101 }).message, /vaccine efficacy/i);
  assert.match(h({ r0: 4, efficacy: 0 }).message, /above 0%/);
  assert.match(h({ r0: 4, coverage: 101 }).message, /coverage reached/i);
  // A blank optional field is not a zero.
  assert.equal(h({ r0: 4, efficacy: '', coverage: '' }).valid, true);
  assert.equal(h({ r0: 4, efficacy: '', coverage: '' }).coverageNeededPercent, undefined);
});

test('the answer always carries what the threshold assumes', () => {
  assert.match(h({ r0: 4 }).note, /mixes evenly/);
  assert.match(h({ r0: 4 }).note, /not a guarantee/);
});
