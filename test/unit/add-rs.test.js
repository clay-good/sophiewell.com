// spec-v104 2.3: Aortic Dissection Detection Risk Score (Rogers 2011).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addRs } from '../../lib/cardio-v104.js';

test('no categories -> 0, low risk', () => {
  const r = addRs({});
  assert.equal(r.total, 0);
  assert.equal(r.risk, 'low');
});

test('one category -> 1, intermediate', () => {
  const r = addRs({ pain: true });
  assert.equal(r.total, 1);
  assert.equal(r.risk, 'intermediate');
});

test('1 -> 2 flip: two categories -> high risk', () => {
  const r = addRs({ predisposing: true, pain: true });
  assert.equal(r.total, 2);
  assert.equal(r.risk, 'high');
});

test('three categories clamp at 3 (max)', () => {
  const r = addRs({ predisposing: true, pain: true, exam: true });
  assert.equal(r.total, 3);
  assert.equal(r.risk, 'high');
});

test('D-dimer < 500 with ADD-RS <= 1 gives the rule-out pathway note', () => {
  const r = addRs({ pain: true, dDimer: 350 });
  assert.match(r.dDimerNote, /ruled out/);
});

test('D-dimer >= 500 with ADD-RS <= 1 -> proceed to imaging', () => {
  const r = addRs({ pain: true, dDimer: 800 });
  assert.match(r.dDimerNote, /proceed to aortic imaging/);
});

test('ADD-RS >= 2 ignores D-dimer (does not rule out)', () => {
  const r = addRs({ predisposing: true, pain: true, dDimer: 100 });
  assert.match(r.dDimerNote, /does not rule out/);
});
