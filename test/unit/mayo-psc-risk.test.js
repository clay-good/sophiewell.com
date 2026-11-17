// spec-v196 2.5: mayoPscRisk worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mayoPscRisk } from '../../lib/liver-v196.js';

test('high-risk band with variceal bleed', () => {
  const r = mayoPscRisk({age:55,bilirubin:5,albumin:3,ast:120,variceal:true});
  assert.equal(r.valid, true);
  assert.equal(r.value, 3.82);
  assert.equal(r.abnormal, true);
});

test('low-risk band', () => {
  const r = mayoPscRisk({age:45,bilirubin:1,albumin:4.2,ast:40});
  assert.equal(r.value, -0.19);
  assert.equal(r.abnormal, false);
});

test('guards: AST must be positive for log', () => {
  const r = mayoPscRisk({age:55,bilirubin:5,albumin:3,ast:0});
  assert.equal(r.valid, false);
});

// spec-v1753: the envelope lib/bounds.js declares; 1.5 times its ceiling was answered, ten times was refused.
test('spec-v1753: a bilirubin past the 60 mg/dL envelope is refused', () => {
  const ex = { age: 55, bilirubin: 5, albumin: 3.0, ast: 120, variceal: true };
  const past = mayoPscRisk({ ...ex, bilirubin: 90 });
  assert.equal(past.valid, false);
  assert.match(past.message, /bilirubin/);
  assert.equal(mayoPscRisk({ ...ex, bilirubin: 60 }).valid, true);
  assert.equal(mayoPscRisk(ex).value, 3.82);
});
