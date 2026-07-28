// spec-v535: the CaPTHUS score.
// Worked-example tests: the five criteria, the 12 mg/dL calcium unit, the concordance criterion NOT being
// implied by two positive scans, the threshold at 3, the poor negative predictive value framing, and the
// guards. Criteria and threshold transcribed from Kebebew and colleagues 2006 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capthus, CAPTHUS_CRITERIA } from '../../lib/capthus-v535.js';

function score(over = {}) {
  const none = { calcium: 'no', pth: 'no', ultrasound: 'no', sestamibi: 'no', concordant: 'no' };
  return capthus({ ...none, ...over });
}

test('five criteria spelling the mnemonic', () => {
  assert.deepEqual(CAPTHUS_CRITERIA.map((c) => c.letter), ['Ca', 'PTH', 'U', 'S', '+']);
});

test('the calcium threshold is 12 mg/dL, not 3 mg/dL', () => {
  const ca = CAPTHUS_CRITERIA.find((c) => c.key === 'calcium');
  assert.match(ca.text, /12 mg\/dL \(3 mmol\/L\)/);
  assert.match(ca.detail, /Reading the 3 as mg\/dL would award this point to almost every patient/);
});

test('concordance is NOT implied by two individually positive scans', () => {
  const discordant = score({ ultrasound: 'yes', sestamibi: 'yes' });
  assert.equal(discordant.total, 2);            // not 3
  assert.equal(discordant.discordantScans, true);
  assert.equal(discordant.predictsSingleGland, false);
  assert.match(discordant.band, /not concordant, so the concordance point is not awarded/);

  const concordant = score({ ultrasound: 'yes', sestamibi: 'yes', concordant: 'yes' });
  assert.equal(concordant.total, 3);
  assert.equal(concordant.discordantScans, false);
  assert.equal(concordant.predictsSingleGland, true);
});

test('the threshold is 3 or more (the META example)', () => {
  assert.equal(score({ calcium: 'yes', pth: 'yes' }).predictsSingleGland, false);          // 2
  const three = score({ calcium: 'yes', pth: 'yes', ultrasound: 'yes' });
  assert.equal(three.total, 3);
  assert.equal(three.predictsSingleGland, true);
  assert.match(three.bandLabel, /CaPTHUS 3 of 5/);
  assert.deepEqual(three.metLetters, ['Ca', 'PTH', 'U']);
});

test('the ceiling is 5 and the floor is 0', () => {
  const all = score({ calcium: 'yes', pth: 'yes', ultrasound: 'yes', sestamibi: 'yes', concordant: 'yes' });
  assert.equal(all.total, 5);
  assert.equal(all.predictsSingleGland, true);
  const none = score();
  assert.equal(none.total, 0);
  assert.equal(none.predictsSingleGland, false);
});

test('the 100 percent PPV is labeled as derivation-cohort performance', () => {
  const r = score({ calcium: 'yes', pth: 'yes', ultrasound: 'yes' });
  assert.match(r.band, /in the derivation cohort/);
  assert.match(r.band, /external validation runs lower/);
});

test('a low score is framed as an absence of information, not evidence of multigland disease', () => {
  const r = score({ calcium: 'yes' });
  assert.match(r.band, /does not predict multigland disease/);
  assert.match(r.band, /absence of information rather than evidence of four-gland disease/);
  assert.match(r.note, /negative predictive value is poor/);
  assert.match(r.note, /rule-in for a focused approach rather than a rule-out/);
});

test('the copy refuses the diagnosis and operative-indication readings', () => {
  const n = score().note;
  assert.match(n, /does not diagnose primary hyperparathyroidism/);
  assert.match(n, /does not establish that surgery is indicated/);
  assert.match(n, /intraoperative PTH monitoring/);
  assert.match(n, /familial hypocalciuric hypercalcemia/);
  assert.match(n, /parathyroid carcinoma/);
});

test('yes/no parsing and the guards', () => {
  assert.equal(capthus({}).valid, false);
  const partial = capthus({ calcium: 'yes', pth: 'yes' });
  assert.equal(partial.valid, false);
  assert.match(partial.message, /U, S, \+/);
  assert.equal(score({ calcium: 'maybe' }).valid, false);
  assert.equal(capthus({ calcium: true, pth: 1, ultrasound: false, sestamibi: 0, concordant: 'no' }).total, 2);
});
