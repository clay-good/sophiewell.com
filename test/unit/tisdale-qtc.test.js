// spec-v101 2.5: Tisdale QT-prolongation risk score (Tisdale 2013).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tisdaleQtc } from '../../lib/cardio-v101.js';

test('no factors -> 0, low', () => {
  const r = tisdaleQtc({});
  assert.equal(r.total, 0);
  assert.equal(r.risk, 'low');
});

test('sepsis + heart failure -> 6, still low (upper edge)', () => {
  const r = tisdaleQtc({ sepsis: true, heartFailure: true });
  assert.equal(r.total, 6);
  assert.equal(r.risk, 'low');
});

test('6 -> 7 flips low to moderate', () => {
  const r = tisdaleQtc({ sepsis: true, heartFailure: true, age68: true });
  assert.equal(r.total, 7);
  assert.equal(r.risk, 'moderate');
});

test('>= 11 is high', () => {
  const r = tisdaleQtc({ sepsis: true, heartFailure: true, hypokalemia: true, qtcProlonged: true, age68: true });
  assert.equal(r.total, 11);
  assert.equal(r.risk, 'high');
});

test('two or more QT drugs scores 6; maximum total is 21', () => {
  const r = tisdaleQtc({ age68: true, female: true, loopDiuretic: true, hypokalemia: true, qtcProlonged: true, acuteMi: true, sepsis: true, heartFailure: true, qtDrugs: 'two-plus' });
  assert.equal(r.total, 21);
  assert.equal(r.risk, 'high');
});

test('one QT drug scores 3', () => {
  const r = tisdaleQtc({ qtDrugs: 'one' });
  assert.equal(r.total, 3);
});
