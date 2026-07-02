// spec-v193 2.5: cadillacRisk worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cadillacRisk } from '../../lib/acs-v193.js';

test('low-risk zero score', () => {
  const r = cadillacRisk({lvef:55,crcl:90,age:50,killip:'1',timi:'3'});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('high-risk maximal score', () => {
  const r = cadillacRisk({lvef:30,crcl:50,age:70,killip:'2-3',timi:'0-2',anemia:true,threeVessel:true});
  assert.equal(r.score, 18);
  assert.equal(r.abnormal, true);
});

test('intermediate band', () => {
  const r = cadillacRisk({lvef:55,crcl:50,age:70,killip:'1',timi:'3'});
  assert.equal(r.score, 5);
});

test('guards: missing killip invalid', () => {
  const r = cadillacRisk({lvef:55,crcl:90,age:50,timi:'3'});
  assert.equal(r.valid, false);
});
