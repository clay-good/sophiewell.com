// spec-v1444: Kanavel's four cardinal signs (Kanavel 1912; limits from open reports).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kanavelSigns as k } from '../../lib/kanavel-signs-v1444.js';

const ALL = { flexed: 'yes', swelling: 'yes', tenderness: 'yes', passive: 'yes' };

test('counts the signs present', () => {
  assert.equal(k(ALL).count, 4);
  assert.match(k(ALL).band, /classic picture/);
  assert.equal(k({ ...ALL, passive: 'no', flexed: 'no' }).count, 2);
  assert.equal(k({ flexed: 'no', swelling: 'no', tenderness: 'no', passive: 'no' }).count, 0);
});

test('fewer than four never reads as excluded', () => {
  const r = k({ ...ALL, passive: 'no' });
  assert.ok(r.notes.some((n) => /does not exclude/.test(n)));
  assert.equal(r.abnormal, true);
});

test('an unexamined sign is asked for', () => {
  assert.match(k({ ...ALL, passive: '' }).message, /pain on passive extension is still needed/);
  assert.equal(k({}).valid, false);
});
