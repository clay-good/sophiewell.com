// spec-v145 2.4: Pittsburgh knee rules (Seaberg 1994/1998). Entry gate is a
// blunt-trauma or fall mechanism; given that, a radiograph is indicated if age
// < 12 or > 50, or inability to take 4 weight-bearing steps. Includes the
// indicated/not-indicated flip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pittsburghKneeRule } from '../../lib/ortho-v145.js';

test('no entry mechanism -> rule does not apply', () => {
  const r = pittsburghKneeRule({ ageOver50: 1, cannotBearWeight: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.applies, false);
  assert.equal(r.indicated, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /applies only to a blunt-trauma or fall/);
});

test('mechanism only, no high-risk criterion -> not indicated', () => {
  const r = pittsburghKneeRule({ mechanism: 1 });
  assert.equal(r.applies, true);
  assert.equal(r.indicated, false);
  assert.match(r.band, /not indicated/);
});

test('mechanism + age > 50 -> indicated (flip)', () => {
  const r = pittsburghKneeRule({ mechanism: '1', ageOver50: 1 });
  assert.equal(r.indicated, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /indicated/);
});

test('mechanism + age < 12 -> indicated', () => {
  const r = pittsburghKneeRule({ mechanism: true, ageUnder12: true });
  assert.equal(r.indicated, true);
});

test('mechanism + cannot bear weight -> indicated', () => {
  const r = pittsburghKneeRule({ mechanism: 1, cannotBearWeight: 1 });
  assert.equal(r.indicated, true);
  assert.match(r.band, /weight-bearing steps/);
});
