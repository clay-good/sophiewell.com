import test from 'node:test';
import assert from 'node:assert/strict';
import { acromegalyBiochem as acro, IGF1_CONFIRMATORY, NADIR_CONVENTIONAL, NADIR_ULTRASENSITIVE } from '../../lib/acromegaly-biochem-v835.js';

const matched = { ageAndSexMatched: true };

test('acromegaly: IGF-1 above 1.3x with typical features is confirmatory', () => {
  assert.equal(IGF1_CONFIRMATORY, 1.3);
  assert.equal(acro({ ...matched, igf1TimesUln: 2.0, typicalFeatures: true }).verdict, 'Confirmatory of acromegaly');
  // Without typical features it is not the confirmatory route.
  assert.notEqual(acro({ ...matched, igf1TimesUln: 2.0 }).verdict, 'Confirmatory of acromegaly');
  assert.notEqual(acro({ ...matched, igf1TimesUln: 1.2, typicalFeatures: true }).verdict, 'Confirmatory of acromegaly');
});

test('acromegaly: exclusion needs a normal IGF-1 AND a suppressed nadir', () => {
  assert.equal(acro({ ...matched, igf1TimesUln: 0.8, ogttGhNadir: 0.3 }).verdict, 'Acromegaly excluded');
  // Either alone is not exclusion.
  assert.equal(acro({ ...matched, ogttGhNadir: 0.3 }).verdict, null);
  assert.notEqual(acro({ ...matched, igf1TimesUln: 0.8 }).verdict, 'Acromegaly excluded');
});

test('acromegaly: discordance is a result in its own right', () => {
  const raisedSuppressed = acro({ ...matched, igf1TimesUln: 1.5, ogttGhNadir: 0.3 });
  assert.equal(raisedSuppressed.verdict, 'Discordant, further evaluation needed');
  assert.ok(raisedSuppressed.discordanceNote.includes('does not exclude'));

  const normalUnsuppressed = acro({ ...matched, igf1TimesUln: 0.8, ogttGhNadir: 3 });
  assert.equal(normalUnsuppressed.verdict, 'Discordant, further evaluation needed');
});

test('acromegaly: the nadir threshold DEPENDS ON THE ASSAY', () => {
  assert.equal(NADIR_CONVENTIONAL, 1.0);
  assert.equal(NADIR_ULTRASENSITIVE, 0.4);
  // A nadir of 0.7 is suppressed on a conventional assay and not on an ultrasensitive one.
  const conv = acro({ ...matched, igf1TimesUln: 0.8, ogttGhNadir: 0.7, assay: 'conventional' });
  assert.equal(conv.suppressed, true);
  assert.equal(conv.verdict, 'Acromegaly excluded');

  const ultra = acro({ ...matched, igf1TimesUln: 0.8, ogttGhNadir: 0.7, assay: 'ultrasensitive' });
  assert.equal(ultra.suppressed, false);
  assert.notEqual(ultra.verdict, 'Acromegaly excluded');
  assert.ok(ultra.assayNote.includes('The assay decides this'));

  // Outside the 0.4-1.0 window the assays agree and no note is raised.
  assert.equal(acro({ ...matched, igf1TimesUln: 0.8, ogttGhNadir: 0.2 }).assayNote, null);
  assert.equal(acro({ ...matched, igf1TimesUln: 0.8, ogttGhNadir: 3 }).assayNote, null);
});

test('acromegaly: a random growth hormone is NOT a diagnostic test', () => {
  // A high random level supports nothing.
  const high = acro({ ...matched, igf1TimesUln: 1.5, randomGh: 8 });
  assert.ok(high.randomNote.includes('does not support the diagnosis'));
  assert.ok(high.randomNote.includes('only to EXCLUSION'));
  // A low one can contribute to exclusion, with a normal IGF-1.
  assert.equal(acro({ ...matched, igf1TimesUln: 0.8, randomGh: 0.2 }).verdict, 'Acromegaly excluded');
  // But not with a raised IGF-1.
  assert.notEqual(acro({ ...matched, igf1TimesUln: 1.5, randomGh: 0.2 }).verdict, 'Acromegaly excluded');
});

test('acromegaly: an IGF-1 not age- and sex-matched is called out', () => {
  const r = acro({ igf1TimesUln: 1.5 });
  assert.ok(r.referenceNote.includes('falls with age'));
  assert.equal(acro({ ...matched, igf1TimesUln: 1.5 }).referenceNote, null);
});

test('acromegaly: empty, invalid and out-of-range input', () => {
  const empty = acro({});
  assert.equal(empty.valid, true);
  assert.equal(empty.verdict, null);
  assert.equal(empty.randomNote, null);
  assert.equal(acro({ igf1TimesUln: -1 }).valid, false);
  assert.equal(acro({ ogttGhNadir: 1e308 }).valid, false);
  assert.equal(acro({ assay: 'guess' }).valid, false);
  assert.equal(acro().valid, true);
  assert.doesNotMatch(JSON.stringify(acro({ ...matched, igf1TimesUln: 2, typicalFeatures: true })), /NaN|Infinity/);
});
