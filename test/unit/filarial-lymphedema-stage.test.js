// spec-v1561 tool 8: Dreyer lymphedema stages, the acute-attack deferral, and "at least".

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filarialLymphedemaStage as r } from '../../lib/filarial-lymphedema-stage-v1561.js';

const none = { attack: 'no', reversible: 'no', folds: 'none', knobs: 'no', mossy: 'no', daily: 'no' };

test('each stage', () => {
  assert.equal(r({ attack: 'no', reversible: 'yes' }).bandLabel, 'Stage 1');
  assert.equal(r(none).bandLabel, 'Stage 2');
  assert.equal(r({ ...none, folds: 'shallow' }).bandLabel, 'Stage 3');
  assert.equal(r({ ...none, knobs: 'yes' }).bandLabel, 'Stage 4');
  assert.equal(r({ ...none, folds: 'deep' }).bandLabel, 'Stage 5');
  assert.equal(r({ ...none, folds: 'shallow', mossy: 'yes' }).bandLabel, 'Stage 6', 'the higher stage wins');
  assert.equal(r({ ...none, folds: 'deep', daily: 'yes' }).bandLabel, 'Stage 7');
});

test('deferral, "at least", refusals', () => {
  assert.equal(r({ ...none, attack: 'yes' }).bandLabel, 'Stage after recovery');
  assert.equal(r({ attack: 'no', reversible: 'no', knobs: 'yes' }).bandLabel, 'At least stage 4');
  assert.equal(r({ attack: 'no', reversible: 'no', knobs: 'yes', mossy: 'no', daily: 'no', folds: 'shallow' }).bandLabel, 'Stage 4');
  assert.equal(r({ reversible: 'no' }).valid, false);
  assert.equal(r({ attack: 'no' }).valid, false);
});
