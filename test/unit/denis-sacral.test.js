// spec-v376: Denis classification of a sacral fracture (zones I-III). Worked-example tests: each zone
// and its anatomic/neurologic description, the neuro-risk flag on zones II-III, roman + numeric +
// case-insensitive input, and the invalid-zone guard. Zones transcribed from Denis et al. 1988 (CORR),
// cross-verified against orthopedic/spine references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { denisSacral } from '../../lib/denis-sacral-v376.js';

test('zone III: central canal, highest neuro risk, flagged (the META example)', () => {
  const r = denisSacral({ zone: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.zone, 'III');
  assert.equal(r.neuroRisk, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /central sacral canal/);
  assert.match(r.band, /bowel, bladder/);
});

test('zone I is alar (lateral to the foramina), lowest risk, not flagged', () => {
  const r = denisSacral({ zone: 'I' });
  assert.equal(r.neuroRisk, false);
  assert.match(r.band, /alar region, lateral to the sacral foramina/);
});

test('zone II is foraminal, intermediate, flagged', () => {
  const r = denisSacral({ zone: 'II' });
  assert.equal(r.neuroRisk, true);
  assert.equal(r.zone, 'II');
  assert.match(r.band, /through the sacral foramina/);
});

test('numeric and case-insensitive input map to the zones', () => {
  assert.equal(denisSacral({ zone: 3 }).zone, 'III');
  assert.equal(denisSacral({ zone: '2' }).zone, 'II');
  assert.equal(denisSacral({ zone: 'i' }).zone, 'I');
});

test('a missing or out-of-range zone is invalid', () => {
  assert.equal(denisSacral({}).valid, false);
  assert.equal(denisSacral({ zone: 'IV' }).valid, false);
  assert.equal(denisSacral({ zone: '0' }).valid, false);
});
