// spec-v195 2.2: ventilatoryRatio worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ventilatoryRatio } from '../../lib/vent-v195.js';

test('elevated VR above 1', () => {
  const r = ventilatoryRatio({ve:9000,paco2:50,height:175,sex:'male'});
  assert.equal(r.valid, true);
  assert.equal(r.vr, 1.7);
});

test('near-normal VR', () => {
  const r = ventilatoryRatio({ve:6000,paco2:40,height:175,sex:'male'});
  assert.equal(r.vr, 0.91);
  assert.equal(r.abnormal, false);
});

test('guards: sex required for PBW', () => {
  const r = ventilatoryRatio({ve:9000,paco2:50,height:175});
  assert.equal(r.valid, false);
});
