// spec-v523: the Scadding stage of pulmonary sarcoidosis on chest radiograph.
// Worked-example tests: all five stages and their defining features, the alias forms (1-4, lowercase), the
// three things the tile refuses to let the numbering imply (severity scale, sequence, lung function), and
// the guards. Stage definitions transcribed from Scadding 1961 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scadding, SCADDING_STAGES } from '../../lib/scadding-v523.js';

test('five stages, 0 through IV', () => {
  assert.deepEqual(SCADDING_STAGES.map((s) => s.value), ['0', 'I', 'II', 'III', 'IV']);
});

test('stage 0 is a normal film, and the copy says that is not "no sarcoidosis"', () => {
  const r = scadding({ stage: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, '0');
  assert.match(r.band, /Normal chest radiograph/);
  assert.match(r.band, /does not exclude sarcoidosis/);
});

test('stage I is adenopathy with clear lungs (the META example)', () => {
  const r = scadding({ stage: 'I' });
  assert.equal(r.stage, 'I');
  assert.match(r.band, /Bilateral hilar lymphadenopathy with clear lung fields/);
  assert.match(r.bandLabel, /Scadding Stage I/);
});

test('stage II is adenopathy WITH infiltrates; stage III is infiltrates WITHOUT adenopathy', () => {
  assert.match(scadding({ stage: 'II' }).band, /together with parenchymal infiltrates/);
  const three = scadding({ stage: 'III' });
  assert.match(three.band, /without hilar lymphadenopathy/);
  // The whole point of III: it is not II plus more.
  assert.match(three.band, /not stage II plus more/);
});

test('stage IV is fibrosis, and the III/IV boundary is named as reader-dependent', () => {
  const r = scadding({ stage: 'IV' });
  assert.equal(r.stage, 'IV');
  assert.match(r.band, /Fibrosis/);
  assert.match(r.band, /end-stage change/);
});

test('every stage disclaims the severity, sequence, and lung-function readings', () => {
  for (const s of SCADDING_STAGES) {
    const r = scadding({ stage: s.value });
    assert.match(r.band, /not a severity scale, not a sequence, and not a measure of lung function/);
  }
});

test('the note refuses to attach a remission percentage to a stage', () => {
  const r = scadding({ stage: 'II' });
  assert.match(r.note, /no remission percentage is attached to a stage/);
  assert.doesNotMatch(r.note, /\d+ ?(percent|%) of patients (remit|will remit)/);
});

test('the note names the extrathoracic blind spot', () => {
  const r = scadding({ stage: 'I' });
  assert.match(r.note, /cardiac involvement/);
  assert.match(r.note, /only the chest/);
});

test('arabic numerals and lowercase resolve to the canonical stage', () => {
  assert.equal(scadding({ stage: 1 }).stage, 'I');
  assert.equal(scadding({ stage: '2' }).stage, 'II');
  assert.equal(scadding({ stage: 'iii' }).stage, 'III');
  assert.equal(scadding({ stage: ' iv ' }).stage, 'IV');
  assert.equal(scadding({ stage: 0 }).stage, '0');
});

test('a missing or unknown stage is invalid', () => {
  assert.equal(scadding({}).valid, false);
  assert.equal(scadding({ stage: '' }).valid, false);
  assert.equal(scadding({ stage: 'V' }).valid, false);
  assert.equal(scadding({ stage: 5 }).valid, false);
});
