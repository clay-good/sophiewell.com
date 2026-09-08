// spec-v93 §2.3: Truelove & Witts acute ulcerative-colitis severity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trueloveWitts } from '../../lib/hepgi-v93.js';

test('severe: >= 6 bloody stools/day plus systemic criteria', () => {
  const r = trueloveWitts({ stools: 8, bleeding: 'present', temp: 38, heartRate: 100, hemoglobin: 9.5, esr: 40 });
  assert.equal(r.bandKey, 'severe');
  assert.equal(r.systemic.length, 4);
});

test('near-miss: 7 bloody stools but no systemic criterion -> moderate, not severe', () => {
  const r = trueloveWitts({ stools: 7, bleeding: 'present', temp: 37, heartRate: 80, hemoglobin: 13, esr: 10 });
  assert.equal(r.bandKey, 'moderate');
  assert.equal(r.severe, false);
});

test('mild: < 4 stools/day with no systemic criterion', () => {
  const r = trueloveWitts({ stools: 2, bleeding: 'none', temp: 37, heartRate: 70, hemoglobin: 13, esr: 10 });
  assert.equal(r.bandKey, 'mild');
});

test('>= 6 stools without bleeding is not severe', () => {
  const r = trueloveWitts({ stools: 8, bleeding: 'none', temp: 38, heartRate: 100, hemoglobin: 9, esr: 40 });
  assert.equal(r.severe, false);
});

test('missing stool count returns a surfaced guard', () => {
  assert.equal(trueloveWitts({}).valid, false);
});

test('a systemic criterion nobody measured is not one that is absent (spec-v1066)', () => {
  // One of the four systemic criteria is all that separates severe from
  // moderate, so with six bloody stools and every systemic value blank this
  // graded moderate and said "No systemic toxicity criterion met" -- a rule-out
  // on four labs nobody had taken, ahead of an admission decision.
  const blank = trueloveWitts({ stools: 8, bleeding: 'present' });
  assert.deepEqual(blank.unmeasuredSystemic,
    ['a temperature', 'a heart rate', 'a hemoglobin', 'an ESR']);
  assert.match(blank.band, /cannot yet rule severe colitis out/);
  assert.doesNotMatch(blank.band, /No systemic toxicity criterion met\./);

  // It still rules IN on one met criterion, with no caveat appended.
  const severe = trueloveWitts({ stools: 8, bleeding: 'present', heartRate: 110 });
  assert.equal(severe.severe, true);
  assert.doesNotMatch(severe.band, /cannot yet rule/);

  // All four measured and none met: the plain sentence is true again.
  const measured = trueloveWitts({ stools: 8, bleeding: 'present', temp: 37, heartRate: 80, hemoglobin: 12, esr: 10 });
  assert.deepEqual(measured.unmeasuredSystemic, []);
  assert.match(measured.band, /among those entered/);
  assert.doesNotMatch(measured.band, /cannot yet rule/);
});

test('spec-v1120: an unstated rectal bleeding also makes severe unreachable', () => {
  // spec-v1066 guarded the four systemic MEASUREMENTS and left the bleeding
  // select beside them alone. Severe needs six bloody stools AND a systemic
  // criterion, so an unstated bleeding rules severe out exactly as four
  // unmeasured labs did -- and the tile graded moderate for it.
  const r = trueloveWitts({ stools: 6, temp: 38 });
  assert.equal(r.bandKey, 'moderate');
  assert.equal(r.bleedingStated, false);
  assert.ok(r.outstanding.includes('whether there is rectal bleeding'));
  assert.match(r.band, /cannot yet rule severe colitis out/);

  const stated = trueloveWitts({ stools: 6, bleeding: 'present', temp: 38 });
  assert.equal(stated.bandKey, 'severe');
  assert.equal(stated.bleedingStated, true);

  // Stated as absent, severe is genuinely excluded.
  const absent = trueloveWitts({ stools: 6, bleeding: 'absent', temp: 38, heartRate: 80, hemoglobin: 13, esr: 10 });
  assert.equal(absent.bleedingStated, true);
  assert.equal(absent.bandKey, 'moderate');
  assert.doesNotMatch(absent.band, /Not entered/);
});
