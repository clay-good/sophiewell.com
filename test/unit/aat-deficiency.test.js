import test from 'node:test';
import assert from 'node:assert/strict';
import { aatDeficiency as aat } from '../../lib/aat-deficiency-v830.js';

test('aat: deficiency is below 100 mg/dL, and 57 is the classical protective threshold', () => {
  assert.equal(aat({ serumLevel: 120 }).deficient, false);
  assert.equal(aat({ serumLevel: 99 }).deficient, true);
  assert.equal(aat({ serumLevel: 99 }).belowProtective, false);
  assert.equal(aat({ serumLevel: 40 }).belowProtective, true);
});

test('aat: the micromol scale uses ITS OWN thresholds, with no conversion', () => {
  // The published pairs (57/11 and 100/20) imply different factors, so nothing is derived.
  assert.equal(aat({ serumLevel: 15, units: 'umol-l' }).deficient, true);
  assert.equal(aat({ serumLevel: 15, units: 'umol-l' }).belowProtective, false);
  assert.equal(aat({ serumLevel: 10, units: 'umol-l' }).belowProtective, true);
  assert.equal(aat({ serumLevel: 25, units: 'umol-l' }).deficient, false);
  assert.equal(aat({ serumLevel: 15, units: 'umol-l' }).units, 'micromol/L');
  // The same NUMBER means different things in the two units, which is the point.
  assert.equal(aat({ serumLevel: 15, units: 'mg-dl' }).belowProtective, true);
});

test('aat: the protective threshold is reported as REFUTED, in both directions', () => {
  const above = aat({ serumLevel: 70 });
  assert.ok(above.thresholdNote.includes('refuted'));
  assert.ok(above.thresholdNote.includes('not reassurance'));
  const below = aat({ serumLevel: 30 });
  assert.ok(below.thresholdNote.includes('not a risk estimate'));
  // No level, no claim about the threshold.
  assert.equal(aat({ genotype: 'zz' }).thresholdNote, null);
});

test('aat: genotype carries the risk statement the evidence supports', () => {
  assert.equal(aat({ genotype: 'zz' }).genotypeRisk, 'severe');
  assert.equal(aat({ genotype: 'rare-severe' }).genotypeRisk, 'severe');
  assert.equal(aat({ genotype: 'mz' }).genotypeRisk, 'intermediate');
  assert.equal(aat({ genotype: 'sz' }).genotypeRisk, 'intermediate');
  assert.equal(aat({ genotype: 'mm' }).genotypeRisk, 'normal');
  assert.ok(aat({ genotype: 'zz' }).genotypeNote.includes('independently associated with COPD'));
  // MZ must not be presented as equivalent to ZZ.
  assert.ok(aat({ genotype: 'mz' }).genotypeNote.includes('not equivalent to ZZ'));
});

test('aat: an untested genotype is named as the missing piece', () => {
  const r = aat({ serumLevel: 70 });
  assert.equal(r.genotypeRisk, null);
  assert.ok(r.genotypeNote.includes('missing piece'));
});

test('aat: testing indications, and when they are flagged as outstanding', () => {
  const r = aat({ copd: true, emphysema: true });
  assert.equal(r.testingIndicated, true);
  assert.equal(r.indications.length, 2);
  assert.ok(r.testingNote.includes('has not been done'));
  // Once a genotype exists the prompt goes away.
  assert.equal(aat({ copd: true, genotype: 'mm' }).testingNote, null);
  assert.equal(aat({}).testingIndicated, false);
});

test('aat: empty, invalid and out-of-range input', () => {
  const empty = aat({});
  assert.equal(empty.valid, true);
  assert.equal(empty.levelBand, null);
  assert.equal(aat({ serumLevel: -1 }).valid, false);
  assert.equal(aat({ serumLevel: 1e308 }).valid, false);
  assert.equal(aat({ units: 'grams' }).valid, false);
  assert.equal(aat({ genotype: 'qq' }).valid, false);
  assert.equal(aat().valid, true);
  assert.doesNotMatch(JSON.stringify(aat({ serumLevel: 25, genotype: 'zz' })), /NaN|Infinity/);
});
