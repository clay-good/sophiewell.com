import test from 'node:test';
import assert from 'node:assert/strict';
import { cfDiagnosis as cf, CF_DIAGNOSTIC, CF_INTERMEDIATE, OLD_INTERMEDIATE } from '../../lib/cf-diagnosis-v828.js';

test('cf: a diagnosis needs an entry route AND CFTR dysfunction', () => {
  assert.equal(cf({ newbornScreenPositive: true, sweatChloride: 80 }).diagnosis, true);
  assert.equal(cf({ clinicalFeatures: true, sweatChloride: 80 }).diagnosis, true);
  assert.equal(cf({ affectedSibling: true, cftrVariants: 'two-cf-causing' }).diagnosis, true);
  // Neither half alone.
  assert.equal(cf({ newbornScreenPositive: true }).diagnosis, false);
  assert.equal(cf({ sweatChloride: 80 }).diagnosis, false);
});

test('cf: a raised sweat chloride alone is NOT a diagnosis, and the tile says so', () => {
  const r = cf({ sweatChloride: 90 });
  assert.equal(r.cftrDysfunction, true);
  assert.equal(r.diagnosis, false);
  assert.ok(r.routeNote.includes('not a diagnosis'));
  // With a route, the note is gone.
  assert.equal(cf({ sweatChloride: 90, clinicalFeatures: true }).routeNote, null);
});

test('cf: the three sweat chloride bands', () => {
  const bandAt = (v) => cf({ sweatChloride: v }).sweatBand;
  assert.equal(bandAt(29), 'CF unlikely');
  assert.equal(bandAt(30), 'intermediate');
  assert.equal(bandAt(59), 'intermediate');
  assert.equal(bandAt(60), 'consistent with CF');
  assert.equal(CF_DIAGNOSTIC, 60);
  assert.equal(CF_INTERMEDIATE, 30);
});

test('cf: the 30-to-39 range is where 2017 changed the answer', () => {
  // Was "normal" above six months, is intermediate now, at every age.
  assert.equal(OLD_INTERMEDIATE, 40);
  const infant = cf({ newbornScreenPositive: true, sweatChloride: 35, ageMonths: 9 });
  assert.equal(infant.sweatBand, 'intermediate');
  assert.ok(infant.thresholdNote.includes('would have called this normal'));
  assert.ok(infant.thresholdNote.includes('9 months'));

  // At 40 and above the two readings agree, so no note.
  assert.equal(cf({ newbornScreenPositive: true, sweatChloride: 45 }).thresholdNote, null);
  // Below 30 both call it unlikely.
  assert.equal(cf({ newbornScreenPositive: true, sweatChloride: 20 }).thresholdNote, null);
});

test('cf: an intermediate value plus two CF-causing variants supports the diagnosis', () => {
  const withVariants = cf({ newbornScreenPositive: true, sweatChloride: 45, cftrVariants: 'two-cf-causing' });
  assert.equal(withVariants.diagnosis, true);
  assert.ok(withVariants.intermediateNote.includes('supports the diagnosis'));

  const untested = cf({ newbornScreenPositive: true, sweatChloride: 45 });
  assert.equal(untested.diagnosis, false);
  assert.ok(untested.intermediateNote.includes('calls for CFTR genetic analysis'));

  const oneOrNone = cf({ newbornScreenPositive: true, sweatChloride: 45, cftrVariants: 'one-or-none' });
  assert.equal(oneOrNone.diagnosis, false);
  assert.ok(oneOrNone.intermediateNote.includes('CRMS'));
});

test('cf: two CF-causing variants are evidence of dysfunction without any sweat test', () => {
  const r = cf({ clinicalFeatures: true, cftrVariants: 'two-cf-causing' });
  assert.equal(r.cftrDysfunction, true);
  assert.equal(r.diagnosis, true);
  assert.equal(r.sweatBand, null);
});

test('cf: empty, invalid and out-of-range input', () => {
  const empty = cf({});
  assert.equal(empty.valid, true);
  assert.equal(empty.diagnosis, false);
  assert.equal(empty.sweatBand, null);
  assert.equal(cf({ sweatChloride: -1 }).valid, false);
  assert.equal(cf({ sweatChloride: 1e308 }).valid, false);
  assert.equal(cf({ cftrVariants: 'maybe' }).valid, false);
  assert.equal(cf().valid, true);
  assert.doesNotMatch(JSON.stringify(cf({ newbornScreenPositive: true, sweatChloride: 80 })), /NaN|Infinity/);
});
