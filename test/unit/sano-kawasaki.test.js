// spec-v681: Sano score for IVIG resistance in Kawasaki disease.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { sanoKawasaki } from '../../lib/sano-kawasaki-v681.js';

const LOW = { ast: '30', bilirubin: '0.4', crp: '2' };

test('no criteria met -> 0, low risk', () => {
  const r = sanoKawasaki(LOW);
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.abnormal, false);
});

test('each criterion counts one point at its threshold', () => {
  assert.equal(sanoKawasaki({ ...LOW, ast: '200' }).score, 1);
  assert.equal(sanoKawasaki({ ...LOW, bilirubin: '0.9' }).score, 1);
  assert.equal(sanoKawasaki({ ...LOW, crp: '7' }).score, 1);
});

test('just-below thresholds do not count', () => {
  assert.equal(sanoKawasaki({ ...LOW, ast: '199' }).score, 0);
  assert.equal(sanoKawasaki({ ...LOW, bilirubin: '0.89' }).score, 0);
  assert.equal(sanoKawasaki({ ...LOW, crp: '6.9' }).score, 0);
});

test('high risk requires >= 2 of 3', () => {
  const one = sanoKawasaki({ ...LOW, ast: '250' });
  assert.equal(one.score, 1);
  assert.equal(one.abnormal, false);
  const two = sanoKawasaki({ ...LOW, ast: '250', crp: '9' });
  assert.equal(two.score, 2);
  assert.equal(two.tier, 'high');
  assert.equal(two.abnormal, true);
  assert.match(two.band, /Sano 2 of 3/);
});

test('all three met -> 3', () => {
  const r = sanoKawasaki({ ast: '300', bilirubin: '1.5', crp: '12' });
  assert.equal(r.score, 3);
  assert.equal(r.tier, 'high');
});

test('inputs are validated', () => {
  assert.equal(sanoKawasaki({}).valid, false);
  assert.equal(sanoKawasaki({}).code, 'MISSING_INPUT');
  assert.equal(sanoKawasaki({ ast: '100', bilirubin: '0.5' }).field, 'crp');
  assert.equal(sanoKawasaki({ ast: '-1', bilirubin: '0.5', crp: '2' }).field, 'ast');
});

// spec-v1746: an entered value outside the range read as blank and was asked for again.
test('spec-v1746: sano-kawasaki names the range of an impossible entry and still asks for a blank one', () => {
  const ex = { ast: 250, bilirubin: 0.5, crp: 9 };
  assert.equal(sanoKawasaki(ex).valid, true);
  const asked = { ast: 'Enter AST in IU/L.', bilirubin: 'Enter total bilirubin in mg/dL.', crp: 'Enter CRP in mg/dL.' };
  for (const [k, sentence] of Object.entries(asked)) {
    const r = sanoKawasaki({ ...ex, [k]: -999999 });
    assert.equal(r.valid, false);
    assert.equal(r.field, k);
    assert.match(r.message, /must be at least 0/);
    assert.equal(sanoKawasaki({ ...ex, [k]: '' }).message, sentence);
  }
});
