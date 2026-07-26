// spec-v455: Nunley-Vertullo midfoot (Lisfranc) sprain classification (stages I-III).
// Worked-example tests: each stage and its radiograph description, numeric input, and the invalid-stage guard.
// Stages transcribed from Nunley & Vertullo 2002 (Am J Sports Med) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nunleyVertullo } from '../../lib/nunley-vertullo-v455.js';

test('stage II: 1 to 5 mm diastasis (the META example)', () => {
  const r = nunleyVertullo({ stage: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'II');
  assert.match(r.band, /1 to 5 mm of diastasis/);
  assert.match(r.band, /without loss of arch height/);
});

test('stage I: no diastasis', () => {
  assert.match(nunleyVertullo({ stage: 'I' }).band, /without diastasis or loss of arch height/);
});

test('stage III: > 5 mm with arch-height loss', () => {
  const r = nunleyVertullo({ stage: 'III' });
  assert.equal(r.stage, 'III');
  assert.match(r.band, /more than 5 mm of diastasis with loss of the medial longitudinal arch/);
});

test('numeric input maps to the stages', () => {
  assert.equal(nunleyVertullo({ stage: 1 }).stage, 'I');
  assert.equal(nunleyVertullo({ stage: 3 }).stage, 'III');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(nunleyVertullo({}).valid, false);
  assert.equal(nunleyVertullo({ stage: 'IV' }).valid, false);
  assert.equal(nunleyVertullo({ stage: '0' }).valid, false);
});
