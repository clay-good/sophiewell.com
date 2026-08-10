// spec-v700: MALT-IPI (MALT lymphoma prognostic index).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { maltIpi } from '../../lib/malt-ipi-v700.js';

test('no factors -> 0, low risk (~70% EFS)', () => {
  const r = maltIpi({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.survival, 'about 70%');
  assert.equal(r.abnormal, false);
});

test('one factor -> intermediate (~56% EFS)', () => {
  const r = maltIpi({ elevatedLdh: true });
  assert.equal(r.score, 1);
  assert.equal(r.tier, 'intermediate');
  assert.equal(r.survival, 'about 56%');
  assert.equal(r.abnormal, false);
});

test('two factors -> high (~29% EFS), worked example', () => {
  const r = maltIpi({ ageOver70: 'true', elevatedLdh: 'true' });
  assert.equal(r.score, 2);
  assert.equal(r.tier, 'high');
  assert.equal(r.survival, 'about 29%');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /MALT-IPI 2 of 3/);
});

test('all three -> 3, high', () => {
  const r = maltIpi({ ageOver70: true, advancedStage: true, elevatedLdh: true });
  assert.equal(r.score, 3);
  assert.equal(r.tier, 'high');
});
