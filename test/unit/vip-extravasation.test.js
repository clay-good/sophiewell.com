import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vipExtravasation } from '../../lib/scoring-v4.js';

test('vip 0 / ins 0 (tile example) -> no banners', () => {
  const r = vipExtravasation({ vip: 0, insGrade: 0 });
  assert.equal(r.vip, 0);
  assert.equal(r.insGrade, 0);
  assert.equal(r.banners.length, 0);
});

test('vip 3 -> remove cannula banner', () => {
  const r = vipExtravasation({ vip: 3, insGrade: 0 });
  assert.ok(r.banners.some((b) => b.startsWith('VIP >=3')));
});

test('ins grade 3 -> escalate banner', () => {
  const r = vipExtravasation({ vip: 0, insGrade: 3 });
  assert.ok(r.banners.some((b) => b.startsWith('INS grade >=3')));
});

test('ins grade 4 vesicant -> antidote banner', () => {
  const r = vipExtravasation({ vip: 0, insGrade: 4, vesicant: true });
  assert.ok(r.banners.some((b) => b.startsWith('Grade 4 vesicant')));
});

test('ins grade 4 without vesicant -> escalate but no antidote banner', () => {
  const r = vipExtravasation({ vip: 0, insGrade: 4, vesicant: false });
  assert.ok(r.banners.some((b) => b.startsWith('INS grade >=3')));
  assert.ok(!r.banners.some((b) => b.startsWith('Grade 4 vesicant')));
});

test('clamps out-of-range vip and ins', () => {
  const r = vipExtravasation({ vip: 99, insGrade: -1 });
  assert.equal(r.vip, 5);
  assert.equal(r.insGrade, 0);
});
