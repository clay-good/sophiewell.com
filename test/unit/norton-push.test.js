import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nortonPush } from '../../lib/scoring-v4.js';

test('norton 20 (all maxima; tile example) -> low risk', () => {
  const r = nortonPush({
    physicalCondition: 4, mentalCondition: 4, activity: 4, mobility: 4, incontinence: 4,
    lengthWidthBand: 0, exudate: 0, tissueType: 0,
  });
  assert.equal(r.nortonTotal, 20);
  assert.equal(r.nortonBand, 'low risk');
  assert.equal(r.pushTotal, 0);
});

test('norton 19 (lower edge of low) -> low', () => {
  const r = nortonPush({
    physicalCondition: 4, mentalCondition: 4, activity: 4, mobility: 4, incontinence: 3,
  });
  assert.equal(r.nortonTotal, 19);
  assert.equal(r.nortonBand, 'low risk');
});

test('norton 18 (upper edge of medium) -> medium', () => {
  const r = nortonPush({
    physicalCondition: 4, mentalCondition: 4, activity: 4, mobility: 3, incontinence: 3,
  });
  assert.equal(r.nortonTotal, 18);
  assert.equal(r.nortonBand, 'medium risk');
});

test('norton 14 (upper edge of at risk) -> at risk', () => {
  const r = nortonPush({
    physicalCondition: 3, mentalCondition: 3, activity: 3, mobility: 3, incontinence: 2,
  });
  assert.equal(r.nortonTotal, 14);
  assert.equal(r.nortonBand, 'at risk');
});

test('push 17 (all maxima) -> high total', () => {
  const r = nortonPush({
    physicalCondition: 4, mentalCondition: 4, activity: 4, mobility: 4, incontinence: 4,
    lengthWidthBand: 10, exudate: 3, tissueType: 4,
  });
  assert.equal(r.pushTotal, 17);
});

test('push clamps out-of-range', () => {
  const r = nortonPush({
    physicalCondition: 4, mentalCondition: 4, activity: 4, mobility: 4, incontinence: 4,
    lengthWidthBand: 99, exudate: -1, tissueType: 99,
  });
  assert.equal(r.pushTotal, 10 + 0 + 4);
});

test('norton clamps each item to 1-4', () => {
  const r = nortonPush({
    physicalCondition: 0, mentalCondition: 5, activity: 4, mobility: 4, incontinence: 4,
  });
  assert.equal(r.norton.physicalCondition, 1);
  assert.equal(r.norton.mentalCondition, 4);
});

// spec-v1083: two instruments on one tile, so it answers with the half it has.
//
// Norton is a RISK score that runs like the Braden (five items 1-4, higher =
// less risk); PUSH is a WOUND score that runs the other way (0 is a closed
// wound). Sliders parked at 4 and 0 respectively read "Norton 20 of 20 (low
// risk); PUSH 0 of 17" -- no pressure-injury risk and a healed wound, before
// anyone looked at either. They are scored independently, so each half reports
// if its own items were rated and is asked for if they were not.
test('spec-v1083: each half reports only if its own items were rated', () => {
  const N = {
    physicalCondition: 3, mentalCondition: 4, activity: 2, mobility: 2, incontinence: 3,
  };
  const P = { lengthWidthBand: 6, exudate: 2, tissueType: 3 };

  const both = nortonPush({ ...N, ...P });
  assert.equal(both.nortonTotal, 14);
  assert.equal(both.nortonBand, 'at risk');
  assert.equal(both.pushTotal, 11);

  // Norton alone: its score stands, and PUSH is asked for rather than reported
  // as a closed wound.
  const nortonOnly = nortonPush(N);
  assert.equal(nortonOnly.nortonTotal, 14);
  assert.equal(nortonOnly.pushTotal, null);
  assert.match(nortonOnly.text, /PUSH not scored/);
  assert.doesNotMatch(nortonOnly.text, /PUSH 0 of 17/);

  // PUSH alone: the wound is tracked without inventing a risk score.
  const pushOnly = nortonPush(P);
  assert.equal(pushOnly.pushTotal, 11);
  assert.equal(pushOnly.nortonTotal, null);
  assert.match(pushOnly.text, /Norton not scored/);
  assert.doesNotMatch(pushOnly.text, /low risk/);

  const neither = nortonPush({});
  assert.equal(neither.valid, false);
  assert.equal(neither.nortonTotal, null);
  assert.equal(neither.pushTotal, null);
});
