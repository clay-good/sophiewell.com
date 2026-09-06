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

// spec-v1083: on both of these scales, 0 is a finding.
//
// VIP 0 is "no signs of phlebitis" and INS grade 0 is "no symptoms" -- readings
// about a cannula site somebody looked at. Two sliders resting at 0 asserted a
// clean line before anyone had. They are graded independently, so each reports
// if it was graded and is asked for if it was not.
test('spec-v1083: an ungraded scale is asked for; a graded 0 still reports clean', () => {
  const graded = vipExtravasation({ vip: 0, insGrade: 0 });
  assert.equal(graded.valid, true);
  assert.equal(graded.vip, 0);
  assert.equal(graded.insGrade, 0);
  assert.match(graded.text, /VIP 0 of 5/, 'a site looked at and found clean still says so');

  const neither = vipExtravasation({});
  assert.equal(neither.valid, false);
  assert.equal(neither.vip, null);
  assert.equal(neither.insGrade, null);
  assert.doesNotMatch(neither.text, /VIP 0 of 5/);

  // One half graded: it reports, the other is asked for, and the action banner
  // still fires off the half that was graded.
  const vipOnly = vipExtravasation({ vip: 4 });
  assert.equal(vipOnly.vip, 4);
  assert.equal(vipOnly.insGrade, null);
  assert.match(vipOnly.text, /INS infiltration \/ extravasation not scored/);
  assert.ok(vipOnly.banners.some((b) => b.includes('remove cannula')));
});
