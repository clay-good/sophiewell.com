import test from 'node:test';
import assert from 'node:assert/strict';
import { polypSurveillance as p, HISTOLOGY } from '../../lib/polyp-surveillance-v882.js';

const exam = { completeToCecum: true, adequatePreparation: true };

test('polyp-surveillance: the published histology vocabulary', () => {
  assert.deepEqual(HISTOLOGY.map((h) => h.value), ['none', 'hyperplastic-small', 'tubular-adenoma', 'villous']);
});

test('polyp-surveillance: the count bands', () => {
  const ta = { ...exam, histology: 'tubular-adenoma', largestSizeMm: 6 };
  assert.equal(p({ ...ta, adenomaCount: 1 }).interval, '7 to 10 years');
  assert.equal(p({ ...ta, adenomaCount: 2 }).interval, '7 to 10 years');
  assert.equal(p({ ...ta, adenomaCount: 3 }).interval, '3 to 5 years');
  assert.equal(p({ ...ta, adenomaCount: 4 }).interval, '3 to 5 years');
  assert.equal(p({ ...ta, adenomaCount: 5 }).interval, '3 years');
  assert.equal(p({ ...ta, adenomaCount: 10 }).interval, '3 years');
  assert.equal(p({ ...ta, adenomaCount: 11 }).interval, '1 year');
});

test('polyp-surveillance: normal and small hyperplastic are both ten years', () => {
  assert.equal(p({ ...exam, histology: 'none' }).interval, '10 years');
  assert.equal(p({ ...exam, histology: 'hyperplastic-small' }).interval, '10 years');
  assert.equal(p({ ...exam, histology: 'none' }).abnormal, false);
});

test('polyp-surveillance: size, histology and dysplasia each shorten it alone', () => {
  const one = { ...exam, adenomaCount: 1 };
  assert.equal(p({ ...one, histology: 'tubular-adenoma', largestSizeMm: 10 }).interval, '3 years');
  assert.equal(p({ ...one, histology: 'villous', largestSizeMm: 6 }).interval, '3 years');
  assert.equal(p({ ...one, histology: 'tubular-adenoma', largestSizeMm: 6, highGradeDysplasia: true }).interval, '3 years');
  // Just under the line stays in the count band.
  assert.equal(p({ ...one, histology: 'tubular-adenoma', largestSizeMm: 9 }).interval, '7 to 10 years');
  assert.match(p({ ...one, histology: 'tubular-adenoma', largestSizeMm: 12 }).sizeNote, /count is 1, and the interval is still three years/);
  assert.match(p({ ...one, histology: 'tubular-adenoma', largestSizeMm: 9 }).sizeNote, /under the 10 mm line/);
});

test('polyp-surveillance: no interval applies without a complete, adequate examination', () => {
  // The reason the tile exists.
  const findings = { histology: 'tubular-adenoma', adenomaCount: 1, largestSizeMm: 6 };
  const noPrep = p({ ...findings, completeToCecum: true });
  assert.equal(noPrep.interval, null);
  assert.match(noPrep.band, /preparation was not adequate/);
  assert.match(noPrep.band, /early repeat colonoscopy/);
  const noCecum = p({ ...findings, adequatePreparation: true });
  assert.match(noCecum.band, /did not reach the cecum/);
  assert.match(noCecum.examNote, /no number from the table applies/);
  assert.match(p({ ...findings, ...exam }).examNote, /Both are recorded here/);
});

test('polyp-surveillance: the piecemeal row outranks everything, including the precondition', () => {
  const r = p({ histology: 'tubular-adenoma', adenomaCount: 1, largestSizeMm: 25, piecemealTwentyMm: true });
  assert.equal(r.interval, '6 months');
  assert.match(r.piecemealNote, /check that the resection was complete/);
  assert.match(r.piecemealNote, /outranks every other row/);
  // Even against a finding that would otherwise be one year.
  assert.equal(p({ ...exam, histology: 'tubular-adenoma', adenomaCount: 20, piecemealTwentyMm: true }).interval, '6 months');
  assert.equal(p({ ...exam, histology: 'tubular-adenoma', adenomaCount: 1, largestSizeMm: 6 }).piecemealNote, null);
});

test('polyp-surveillance: the scope caveat is on every result', () => {
  for (const input of [{}, { ...exam, histology: 'none' }, { piecemealTwentyMm: true }]) {
    assert.match(p(input).scopeOfTableNote, /average-risk surveillance after polypectomy/);
    assert.match(p(input).scopeOfTableNote, /inflammatory bowel disease/);
    assert.match(p(input).scopeNote, /does not decide when a patient is scheduled/);
  }
});

// spec-v1193. The line this replaces read:
//
//   assert.equal(p({ histology: 'made-up' }).histology, 'none');
//
// `none` is the first row of the histology table and it means "No polyps found",
// so a histology nobody had entered selected the TEN-year interval and named "a
// normal examination" as the reason. The worked example -- one 12 mm adenoma --
// is three years.
test('polyp-surveillance: a blank histology is not a normal examination', () => {
  const exam3y = { ...exam, adenomaCount: 1, largestSizeMm: 12, histology: 'tubular-adenoma' };
  assert.equal(p(exam3y).interval, '3 years');

  const blank = { ...exam3y };
  delete blank.histology;
  const r = p(blank);
  assert.equal(r.valid, false);
  assert.match(r.message, /Choose the worst histology found/);
  assert.match(r.message, /not "no polyps found"/);
  assert.equal(r.interval, undefined, 'no interval is selected without it');

  // An unrecognised value fell into the same row, so it refuses too.
  assert.equal(p({ ...exam3y, histology: 'made-up' }).valid, false);

  // The standing caveats survive the refusal.
  assert.match(r.scopeOfTableNote, /average-risk surveillance after polypectomy/);
  assert.match(r.scopeNote, /does not decide when a patient is scheduled/);
});

test('polyp-surveillance: the histology is only asked for where the table applies', () => {
  // Rule 13: piecemeal resection of a lesion 20 mm or larger is its own track,
  // and it outranks everything -- so the answer holds whatever the histology is.
  const piecemeal = p({ ...exam, piecemealTwentyMm: true });
  assert.equal(piecemeal.valid, true);
  assert.equal(piecemeal.interval, '6 months');
  assert.match(piecemeal.recordedNote, /no histology entered/);

  // An incomplete examination selects no interval at all, for the same reason.
  const incomplete = p({ completeToCecum: false, adequatePreparation: true });
  assert.equal(incomplete.valid, true);
  assert.equal(incomplete.interval, null);
});

test('polyp-surveillance: the ranges are checked', () => {
  assert.equal(p({ adenomaCount: 201 }).valid, false);
  assert.equal(p({ largestSizeMm: 201 }).valid, false);
  assert.equal(p({ adenomaCount: 'abc' }).adenomaCount, null);
  // Adenomatous histology with no count selects nothing rather than guessing.
  assert.equal(p({ ...exam, histology: 'tubular-adenoma' }).interval, null);
});

test('polyp-surveillance: the documented example', () => {
  const r = p({ ...exam, histology: 'tubular-adenoma', adenomaCount: '1', largestSizeMm: '12' });
  assert.equal(r.interval, '3 years');
  assert.match(r.band, /an adenoma of 12 mm/);
});
