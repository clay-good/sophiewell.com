// spec-v139 2.3: Risk of Malignancy Index I/II/III (Jacobs 1990; Tingulstad).
// RMI = U x M x CA-125; U and M scaling differ by variant; > 200 high risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rmiOvarian } from '../../lib/gyn-v139.js';

test('RMI I high: 3 features, postmenopausal, CA-125 80 -> 720', () => {
  const r = rmiOvarian({ variant: '1', multilocular: true, solidAreas: true, ascites: true, postmenopausal: true, ca125: 80 });
  assert.equal(r.valid, true);
  assert.equal(r.u, 3);
  assert.equal(r.m, 3);
  assert.equal(r.rmi, 720);
  assert.equal(r.abnormal, true);
});

test('RMI I low: 1 feature, premenopausal, CA-125 30 -> 30', () => {
  const r = rmiOvarian({ variant: '1', multilocular: true, postmenopausal: false, ca125: 30 });
  assert.equal(r.u, 1);
  assert.equal(r.m, 1);
  assert.equal(r.rmi, 30);
  assert.equal(r.abnormal, false);
});

test('RMI II scaling: 2 features, postmenopausal -> U4 x M4', () => {
  const r = rmiOvarian({ variant: '2', solidAreas: true, bilateral: true, postmenopausal: true, ca125: 20 });
  assert.equal(r.u, 4);
  assert.equal(r.m, 4);
  assert.equal(r.rmi, 320);
});

test('RMI III scaling: 0-1 features -> U1, postmenopausal -> M3', () => {
  const r = rmiOvarian({ variant: '3', solidAreas: true, postmenopausal: true, ca125: 50 });
  assert.equal(r.u, 1);
  assert.equal(r.m, 3);
  assert.equal(r.rmi, 150);
  assert.equal(r.abnormal, false);
});

test('non-positive CA-125 -> valid:false', () => {
  assert.equal(rmiOvarian({ variant: '1', ca125: 0 }).valid, false);
  assert.equal(rmiOvarian({ variant: '1' }).valid, false);
});
