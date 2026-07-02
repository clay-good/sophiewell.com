// spec-v193 2.3: zwollePci worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zwollePci } from '../../lib/acs-v193.js';

test('low-risk early-discharge candidate', () => {
  const r = zwollePci({killip:'1',timi:'3',age:55});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('high-risk full-point case', () => {
  const r = zwollePci({killip:'3-4',timi:'0-1',age:70,threeVessel:true,anterior:true,longIschemia:true});
  assert.equal(r.score, 16);
  assert.equal(r.abnormal, true);
});

test('age 60 boundary adds 2', () => {
  const r = zwollePci({killip:'1',timi:'3',age:60});
  assert.equal(r.score, 2);
});

test('guards: missing killip invalid', () => {
  const r = zwollePci({timi:'3',age:55});
  assert.equal(r.valid, false);
});
