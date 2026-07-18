// spec-v427: Vaughan Williams antiarrhythmic classification (Ia/Ib/Ic/II/III/IV).
// Worked-example tests: each class and its mechanism, alias input, and the invalid-class guard.
// Classes transcribed from Vaughan Williams 1984 (J Clin Pharmacol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vaughanWilliams } from '../../lib/vaughan-williams-v427.js';

test('class III: potassium-channel blockers (the META example)', () => {
  const r = vaughanWilliams({ cls: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.cls, 'III');
  assert.match(r.band, /potassium-channel blockers/);
  assert.match(r.band, /amiodarone/);
});

test('class Ia: Na-channel blocker, moderate', () => {
  const r = vaughanWilliams({ cls: 'Ia' });
  assert.equal(r.cls, 'Ia');
  assert.match(r.band, /quinidine/);
});

test('class Ib: weak block, shorten repolarization', () => {
  assert.match(vaughanWilliams({ cls: 'Ib' }).band, /lidocaine/);
});

test('class II: beta-adrenergic blockers', () => {
  assert.match(vaughanWilliams({ cls: 'II' }).band, /beta-adrenergic blockers/);
});

test('class IV: non-dihydropyridine calcium-channel blockers', () => {
  const r = vaughanWilliams({ cls: 'IV' });
  assert.equal(r.cls, 'IV');
  assert.match(r.band, /verapamil, diltiazem/);
});

test('aliases: case-insensitive and 1a/2 forms map to the classes', () => {
  assert.equal(vaughanWilliams({ cls: '1c' }).cls, 'Ic');
  assert.equal(vaughanWilliams({ cls: '2' }).cls, 'II');
});

test('a missing or out-of-range class is invalid', () => {
  assert.equal(vaughanWilliams({}).valid, false);
  assert.equal(vaughanWilliams({ cls: 'V' }).valid, false);
  assert.equal(vaughanWilliams({ cls: 'Id' }).valid, false);
});
