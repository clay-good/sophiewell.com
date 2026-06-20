// spec-v120 2.4: POUND mnemonic (Detsky 2006). Five features -- Pulsatile,
// hOurs (4-72 h), Unilateral, Nausea/vomiting, Disabling; count 0-5; LR ~24
// (>= 4), ~3.5 (exactly 3), ~0.41 (<= 2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { poundMigraine } from '../../lib/neuro-v120.js';

test('no features -> 0/5, migraine unlikely (LR ~0.41)', () => {
  const r = poundMigraine({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /likelihood ratio about 0\.41/);
});

test('two features -> 2/5, still the <= 2 unlikely band', () => {
  const r = poundMigraine({ pulsatile: true, unilateral: true });
  assert.equal(r.total, 2);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /2 or fewer/);
});

test('exactly three features -> 3/5, intermediate (LR ~3.5)', () => {
  const r = poundMigraine({ pulsatile: true, unilateral: true, nausea: true });
  assert.equal(r.total, 3);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /likelihood ratio about 3\.5/);
});

test('four features -> 4/5, migraine likely (LR ~24)', () => {
  const r = poundMigraine({ pulsatile: true, hours: true, unilateral: true, nausea: true });
  assert.equal(r.total, 4);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /strongly favor migraine \(likelihood ratio about 24\)/);
});

test('all five features -> 5/5 (max), migraine likely', () => {
  const r = poundMigraine({ pulsatile: true, hours: true, unilateral: true, nausea: true, disabling: true });
  assert.equal(r.total, 5);
  assert.equal(r.abnormal, true);
});

test('scalar / non-object fuzz arg yields a valid 0/5, never NaN', () => {
  const r = poundMigraine('x');
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(Number.isFinite(r.total), true);
});
