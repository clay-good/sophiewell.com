// spec-v199 2.2: mipss70 worked examples and band crossings.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mipss70 } from '../../lib/myeloid-prognosis-v199.js';

test('low-risk 0-1: anemia only', () => {
  const r = mipss70({ hb: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 1);
  assert.match(r.band, /low-risk/);
  assert.equal(r.abnormal, false);
});

test('intermediate 2-4: anemia + thrombocytopenia', () => {
  const r = mipss70({ hb: true, plt: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /intermediate-risk/);
});

test('high-risk >=5: five clinical items', () => {
  const r = mipss70({ hb: true, wbc: true, plt: true, blasts: true, fibrosis: true });
  assert.equal(r.score, 7);
  assert.match(r.band, /high-risk/);
});

test('HMR select is cumulative: >=2 HMR adds 3', () => {
  assert.equal(mipss70({ hmr: 'one' }).score, 1);
  assert.equal(mipss70({ hmr: 'twoPlus' }).score, 3);
});

test('no factors -> score 0, low', () => {
  const r = mipss70({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});
