// spec-v91 §2.3: GAP index for idiopathic pulmonary fibrosis (Ley 2012).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gapIpf } from '../../lib/pulm-v91.js';

test('worked example: male 68, FVC 60%, DLCO 40% -> 5 points, stage II', () => {
  // gender 1 + age>65 (2) + FVC 50-75 (1) + DLCO 36-55 (1) = 5
  const r = gapIpf({ sex: 'male', age: 68, fvcPct: 60, dlcoPct: 40 });
  assert.equal(r.total, 5);
  assert.deepEqual([r.genderPts, r.agePts, r.fvcPts, r.dlcoPts], [1, 2, 1, 1]);
  assert.equal(r.stage, 'II');
  assert.match(r.mortality, /16\.2%/);
});

test('stage edge 3 -> 4 (stage I to II)', () => {
  // female(0) age 62 (>60 ->1) FVC 80(>75 ->0) DLCO 30(<=35 ->2) = 3 -> stage I
  const i = gapIpf({ sex: 'female', age: 62, fvcPct: 80, dlcoPct: 30 });
  assert.equal(i.total, 3);
  assert.equal(i.stage, 'I');
  // male(1) age 62 (1) FVC 80(0) DLCO 30(2) = 4 -> stage II
  const ii = gapIpf({ sex: 'male', age: 62, fvcPct: 80, dlcoPct: 30 });
  assert.equal(ii.total, 4);
  assert.equal(ii.stage, 'II');
});

test('stage edge 5 -> 6 (stage II to III)', () => {
  // male(1) age>65(2) FVC 50-75(1) DLCO 36-55(1) = 5 -> II
  const ii = gapIpf({ sex: 'male', age: 70, fvcPct: 60, dlcoPct: 50 });
  assert.equal(ii.total, 5);
  assert.equal(ii.stage, 'II');
  // male(1) age>65(2) FVC<50(2) DLCO 36-55(1) = 6 -> III
  const iii = gapIpf({ sex: 'male', age: 70, fvcPct: 45, dlcoPct: 50 });
  assert.equal(iii.total, 6);
  assert.equal(iii.stage, 'III');
});

test('cannot-perform DLCO is a first-class 3-point limb (max stage III, 8 pts)', () => {
  const r = gapIpf({ sex: 'male', age: 70, fvcPct: 45, dlcoCannotPerform: true });
  assert.equal(r.dlcoPts, 3);
  assert.equal(r.dlcoCannotPerform, true);
  assert.equal(r.total, 8);
  assert.equal(r.stage, 'III');
  assert.match(r.mortality, /76\.8%/);
});

test('partial input refused; cannot-perform satisfies the DLCO field', () => {
  assert.equal(gapIpf({ sex: 'male', age: 68, fvcPct: 60 }).valid, false);
  assert.equal(gapIpf({ sex: 'male', age: 68, fvcPct: 60, dlcoCannotPerform: true }).valid, true);
});
