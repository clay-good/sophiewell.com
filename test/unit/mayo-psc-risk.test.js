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
