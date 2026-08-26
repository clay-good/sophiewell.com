// spec-v777: AWOL delirium risk-stratification score.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { awol } from '../../lib/awol-v777.js';

test('no findings -> 0 of 4, about 2 percent', () => {
  const r = awol({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.incidence, 'about 2%');
  assert.equal(r.abnormal, false);
});

test('mildly ill scores no point; moderately ill scores one', () => {
  assert.equal(awol({ illness: 'mildly-ill' }).score, 0);
  assert.equal(awol({ illness: 'moderately-ill' }).score, 1);
  assert.equal(awol({ illness: 'severely-ill' }).score, 1);
  assert.equal(awol({ illness: 'moribund' }).score, 1);
});

test('worked example: age 80 and disoriented -> 2 of 4, about 14 percent', () => {
  const r = awol({ age80: 'true', disoriented: 'true', illness: 'not-ill' });
  assert.equal(r.score, 2);
  assert.equal(r.incidence, 'about 14%');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /AWOL 2 of 4/);
});

test('all four findings -> 4 of 4, about 64 percent', () => {
  const r = awol({ age80: true, spellFail: true, disoriented: true, illness: 'severely-ill' });
  assert.equal(r.score, 4);
  assert.equal(r.incidence, 'about 64%');
});

test('an unknown illness severity is rejected, not treated as zero', () => {
  const r = awol({ illness: 'very-poorly' });
  assert.equal(r.valid, false);
  assert.equal(r.field, 'illness');
});
