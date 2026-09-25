// spec-v1492: the Bolton tooth-size ratios.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING, DISCLOSING } from '../lib/asking-language.js';
import { boltonRatio as br } from '../../lib/bolton-ratio-v1492.js';

const EX = { maxAnterior: '47.5', mandAnterior: '37.4', maxOverall: '96.4', mandOverall: '88.9' };

test('the worked example: both ratios slightly above the mean, within 1 SD', () => {
  const r = br(EX);
  assert.equal(r.anterior, 78.7);
  assert.equal(r.overall, 92.2);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /mandibular excess of 0\.7 mm/);
  assert.match(r.band, /mandibular excess of 0\.9 mm/);
});

test('a maxillary excess below the mean, outside 1 SD', () => {
  const r = br({ maxAnterior: '50', mandAnterior: '36' });
  assert.equal(r.anterior, 72);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /outside 1 SD, a maxillary excess of 3\.4 mm/);
  assert.match(r.notes[0], DISCLOSING);
});

test('half a pair or nothing is asked for; contradictory sums are refused', () => {
  for (const r of [br({}), br({ maxAnterior: '47' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
  assert.equal(br({ ...EX, maxOverall: '45' }).valid, false);
});
