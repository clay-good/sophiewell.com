// spec-v790: 2018 Lake Louise Criteria for myocarditis on cardiac MRI.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { lakeLouiseCmr } from '../../lib/lake-louise-cmr-v790.js';

const T2 = ['t2Mapping', 't2Edema', 't2Ratio'];
const T1 = ['t1Mapping', 'ecv', 'lge'];

test('nothing selected -> not met, and it says neither prong', () => {
  const r = lakeLouiseCmr({});
  assert.equal(r.valid, true);
  assert.equal(r.met, false);
  assert.equal(r.missing, 'neither prong');
  assert.equal(r.abnormal, false);
});

test('two markers from the SAME prong do not meet the criteria', () => {
  const allT2 = lakeLouiseCmr({ t2Mapping: true, t2Edema: true, t2Ratio: true });
  assert.equal(allT2.met, false);
  assert.equal(allT2.missing, 'no T1-based marker (injury)');

  const allT1 = lakeLouiseCmr({ t1Mapping: true, ecv: true, lge: true });
  assert.equal(allT1.met, false);
  assert.equal(allT1.missing, 'no T2-based marker (edema)');
});

test('one marker from each prong meets the criteria, in every pairing', () => {
  for (const a of T2) {
    for (const b of T1) {
      const r = lakeLouiseCmr({ [a]: true, [b]: true });
      assert.equal(r.met, true, `${a} + ${b}`);
      assert.equal(r.abnormal, true, `${a} + ${b}`);
    }
  }
});

test('worked example: raised T2 time plus non-ischemic late enhancement', () => {
  const r = lakeLouiseCmr({ t2Mapping: 'true', lge: 'true' });
  assert.equal(r.met, true);
  assert.equal(r.t2Markers.length, 1);
  assert.equal(r.t1Markers.length, 1);
  assert.match(r.band, /criteria met/i);
});

test('every marker belongs to exactly one prong', () => {
  for (const a of T2) {
    const r = lakeLouiseCmr({ [a]: true });
    assert.equal(r.t2Met, true, a);
    assert.equal(r.t1Met, false, a);
  }
  for (const b of T1) {
    const r = lakeLouiseCmr({ [b]: true });
    assert.equal(r.t1Met, true, b);
    assert.equal(r.t2Met, false, b);
  }
});
