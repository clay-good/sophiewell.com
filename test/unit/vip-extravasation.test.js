import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vipExtravasation } from '../../lib/scoring-v4.js';

test('vip 0 / ins 0 (tile example) -> no banners', () => {
  const r = vipExtravasation({ vip: 0, insGrade: 0 });
  assert.equal(r.vip, 0);
  assert.equal(r.insGrade, 0);
  assert.equal(r.banners.length, 0);
});

test('vip 2 and up -> remove cannula banner (Jackson: resite from grade 2)', () => {
  const r = vipExtravasation({ vip: 3, insGrade: 0 });
  assert.ok(r.banners.some((b) => b.startsWith('VIP 3: remove cannula and resite')));
  assert.ok(vipExtravasation({ vip: 2, insGrade: 0 }).banners.some((b) => /^VIP 2: early stage of phlebitis; remove cannula/.test(b)));
  assert.equal(vipExtravasation({ vip: 1, insGrade: 0 }).banners.length, 0);
  assert.match(vipExtravasation({ vip: 3 }).vipLabel, /medium stage/);
});

test('ins grade 3 -> escalate banner', () => {
  const r = vipExtravasation({ vip: 0, insGrade: 3 });
  assert.ok(r.banners.some((b) => b.startsWith('Infiltration grade 3 or 4')));
  assert.ok(r.banners.every((b) => !/INS 2021/.test(b)));
});

test('a vesicant below grade 4 is called out: any amount is grade 4 on the scale', () => {
  const r = vipExtravasation({ vip: 0, insGrade: 1, vesicant: true });
  assert.ok(r.banners.some((b) => /any amount of blood product, irritant or vesicant is grade 4/.test(b)));
});

test('ins grade 4 vesicant -> antidote banner', () => {
  const r = vipExtravasation({ vip: 0, insGrade: 4, vesicant: true });
  assert.ok(r.banners.some((b) => b.startsWith('Grade 4 vesicant')));
});

test('ins grade 4 without vesicant -> escalate but no antidote banner', () => {
  const r = vipExtravasation({ vip: 0, insGrade: 4, vesicant: false });
  assert.ok(r.banners.some((b) => b.startsWith('Infiltration grade 3 or 4')));
  assert.ok(!r.banners.some((b) => b.startsWith('Grade 4 vesicant')));
});

// spec-v1744: this pinned the clamp; out-of-range grades are now refused.
test('refuses out-of-range vip and ins', () => {
  assert.throws(() => vipExtravasation({ vip: 99, insGrade: 0 }), /VIP score must be between 0 and 5/);
  assert.throws(() => vipExtravasation({ vip: 0, insGrade: -1 }), /INS infiltration grade must be between 0 and 4/);
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

test('vip-extravasation: grades outside VIP 0-5 and INS 0-4 are refused, not clamped (spec-v1744)', () => {
  assert.throws(() => vipExtravasation({ vip: 6, insGrade: 2 }), RangeError);
  assert.throws(() => vipExtravasation({ vip: -1, insGrade: 2 }), RangeError);
  assert.throws(() => vipExtravasation({ vip: 3, insGrade: 5 }), RangeError);
  assert.throws(() => vipExtravasation({ vip: 3, insGrade: -1 }), RangeError);
  assert.throws(() => vipExtravasation({ vip: 2.5, insGrade: 2 }), /whole number/);
  assert.equal(vipExtravasation({ vip: 0, insGrade: 0 }).vip, 0);
  const top = vipExtravasation({ vip: 5, insGrade: 4 });
  assert.equal(top.vip, 5); assert.equal(top.insGrade, 4);
  const ex = vipExtravasation({ vip: 3, insGrade: 2 }); // worked example
  assert.equal(ex.vip, 3); assert.equal(ex.insGrade, 2);
  assert.equal(vipExtravasation({ vip: '', insGrade: 2 }).vipUnrated, true);
});
