// spec-v724: Miller classification of gingival recession.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { millerGingivalRecession } from '../../lib/miller-gingival-recession-v724.js';

test('no loss, not to MGJ -> Class I (100% coverage)', () => {
  const r = millerGingivalRecession({ interdentalLoss: 'none', recessionExtent: 'not-to-mgj' });
  assert.equal(r.valid, true);
  assert.equal(r.millerClass, 'I');
  assert.match(r.coverage, /100%/);
  assert.equal(r.abnormal, false);
});

test('no loss, to/beyond MGJ -> Class II', () => {
  const r = millerGingivalRecession({ interdentalLoss: 'none', recessionExtent: 'to-or-beyond-mgj' });
  assert.equal(r.millerClass, 'II');
});

test('interdental loss coronal to recession -> Class III (partial)', () => {
  const r = millerGingivalRecession({ interdentalLoss: 'coronal' });
  assert.equal(r.millerClass, 'III');
  assert.match(r.coverage, /partial/);
  assert.equal(r.abnormal, true);
});

test('interdental loss apical to recession -> Class IV (no coverage)', () => {
  const r = millerGingivalRecession({ interdentalLoss: 'apical' });
  assert.equal(r.millerClass, 'IV');
  assert.match(r.coverage, /no root coverage/);
  assert.equal(r.abnormal, true);
});

test('interdental loss is required; recession extent required only for Class I/II', () => {
  assert.equal(millerGingivalRecession({}).valid, false);
  assert.equal(millerGingivalRecession({}).field, 'interdentalLoss');
  const noExtent = millerGingivalRecession({ interdentalLoss: 'none' });
  assert.equal(noExtent.valid, false);
  assert.equal(noExtent.field, 'recessionExtent');
  // apical/coronal do not need the extent
  assert.equal(millerGingivalRecession({ interdentalLoss: 'apical' }).valid, true);
});
