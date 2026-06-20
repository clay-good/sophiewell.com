// spec-v120 2.5: HINTS / HINTS-plus (Kattah 2009). Head-impulse (abnormal =
// peripheral, normal = central), nystagmus (fixed = peripheral, changing =
// central), skew (absent = peripheral, present = central); HINTS-plus adds new
// hearing loss. A benign peripheral pattern needs ALL THREE reassuring; ANY ONE
// central feature flags a central (stroke) cause.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hints } from '../../lib/neuro-v120.js';

test('all three reassuring -> Peripheral (benign) pattern', () => {
  const r = hints({ headImpulse: 'abnormal', nystagmus: 'fixed', skew: 'absent' });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'Peripheral (benign) pattern');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /peripheral \(benign\) pattern/);
});

test('normal head impulse alone -> Central (stroke) pattern (the INFARCT catch)', () => {
  const r = hints({ headImpulse: 'normal', nystagmus: 'fixed', skew: 'absent' });
  assert.equal(r.category, 'Central (stroke) pattern');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /normal head impulse/);
});

test('direction-changing nystagmus alone -> Central', () => {
  const r = hints({ headImpulse: 'abnormal', nystagmus: 'changing', skew: 'absent' });
  assert.equal(r.category, 'Central (stroke) pattern');
  assert.match(r.band, /direction-changing nystagmus/);
});

test('skew present alone -> Central', () => {
  const r = hints({ headImpulse: 'abnormal', nystagmus: 'fixed', skew: 'present' });
  assert.equal(r.category, 'Central (stroke) pattern');
  assert.match(r.band, /skew present/);
});

test('HINTS-plus: new hearing loss with an otherwise benign exam -> Central', () => {
  const r = hints({ headImpulse: 'abnormal', nystagmus: 'fixed', skew: 'absent', hearingLoss: true });
  assert.equal(r.category, 'Central (stroke) pattern');
  assert.match(r.band, /new unilateral hearing loss/);
});

test('multiple central features are all named', () => {
  const r = hints({ headImpulse: 'normal', nystagmus: 'changing', skew: 'present', hearingLoss: true });
  assert.equal(r.category, 'Central (stroke) pattern');
  assert.match(r.detail, /normal head impulse, direction-changing nystagmus, skew present, new unilateral hearing loss/);
});

test('scalar / non-object fuzz arg yields a valid Peripheral default, never throws', () => {
  const r = hints(3);
  assert.equal(r.valid, true);
  assert.equal(r.category, 'Peripheral (benign) pattern');
});
