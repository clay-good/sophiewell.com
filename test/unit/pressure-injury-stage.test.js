// spec-v359: NPIAP pressure injury staging (Stage 1-4, Unstageable, DTPI). Worked-example tests: each
// stage and its description, the severe flag on 3/4/unstageable/DTPI, roman + 'u'/'dti' aliases +
// case-insensitive input, and the invalid-stage guard. Definitions transcribed from Edsberg et al. 2016
// (JWOCN), cross-verified against NPIAP references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pressureInjuryStage } from '../../lib/pressure-injury-stage-v359.js';

test('Stage 3: full-thickness skin loss, flagged (the META example)', () => {
  const r = pressureInjuryStage({ stage: '3' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'Stage 3');
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /full-thickness skin loss/);
});

test('Stages 1-2 are partial / superficial and not flagged', () => {
  assert.match(pressureInjuryStage({ stage: '1' }).band, /non-blanchable erythema/);
  assert.match(pressureInjuryStage({ stage: '2' }).band, /partial-thickness/);
  for (const s of ['1', '2']) {
    assert.equal(pressureInjuryStage({ stage: s }).severe, false, s);
  }
});

test('Stage 4, Unstageable, and DTPI are full-thickness / serious and flagged', () => {
  assert.match(pressureInjuryStage({ stage: '4' }).band, /fascia, muscle, tendon/);
  assert.match(pressureInjuryStage({ stage: 'unstageable' }).band, /slough or eschar/);
  assert.match(pressureInjuryStage({ stage: 'dtpi' }).band, /deep red, maroon, or purple/);
  for (const s of ['4', 'unstageable', 'dtpi']) {
    assert.equal(pressureInjuryStage({ stage: s }).severe, true, s);
  }
});

test('roman, u/dti aliases, and case-insensitive input map to the stages', () => {
  assert.equal(pressureInjuryStage({ stage: 'III' }).stage, 'Stage 3');
  assert.equal(pressureInjuryStage({ stage: 'u' }).stage, 'Unstageable');
  assert.equal(pressureInjuryStage({ stage: 'DTI' }).stage, 'Deep Tissue Pressure Injury');
  assert.equal(pressureInjuryStage({ stage: 'Unstageable' }).stage, 'Unstageable');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(pressureInjuryStage({}).valid, false);
  assert.equal(pressureInjuryStage({ stage: '5' }).valid, false);
  assert.equal(pressureInjuryStage({ stage: 'V' }).valid, false);
});
