// spec-v1177: an out-of-range value is not an absent one.
//
// spec-v1176 measured this: `pos(v, lo, hi)` -- one helper, 18 identical copies
// across lib/, 411 call sites passing bounds -- returns `null` for a blank, for
// a non-number AND for a value outside its bounds. Every caller reads null as
// "missing", so 124 of the 194 fields that refuse an out-of-range value ask the
// reader for a value they just entered.
//
// A serum albumin of 40 is the g/L figure an SI lab report prints for 4.0 g/dL.
// These three answered it with "Enter serum albumin (g/dL)", and retyping the
// same number produced the same sentence.
//
// The migration is per-GUARD, not per-helper: `pos` is unchanged, so the other
// 408 call sites keep working, and each guard asks boundsAdvisory first so the
// specific fault wins over the general one.
import test from 'node:test';
import assert from 'node:assert/strict';

import { boundsAdvisory } from '../../lib/bounds.js';
import { naples, far } from '../../lib/prognostic-v231.js';
import { agr } from '../../lib/proteins-v274.js';

const NAPLES = { albumin: 3.5, cholesterol: 180, nlr: 3, lmr: 3 };
const FAR = { fibrinogen: 300, albumin: 4 };
const AGR = { albumin: 4, totalProtein: 7 };

test('spec-v1176 recommended a new helper; boundsAdvisory already was one', () => {
  // Recorded because spec-v1176 shipped saying "add rangeFault to lib/bounds.js".
  // It is already there, under another name, and its sentence already carries
  // the thing the reader needs to hear.
  assert.match(boundsAdvisory('albumin', 40), /plausible range for serum albumin/);
  assert.match(boundsAdvisory('albumin', 40), /verify the units/);
  assert.equal(boundsAdvisory('albumin', 4), null);
});

test('an albumin in g/L is named as out of range, not asked for again', () => {
  for (const [name, fn, args] of [
    ['naples', naples, NAPLES], ['far', far, FAR], ['agr', agr, AGR],
  ]) {
    const r = fn({ ...args, albumin: 40 });
    assert.equal(r.valid, false, name);
    assert.match(r.message, /plausible range/, name);
    assert.match(r.message, /verify the units/, name);
    assert.doesNotMatch(r.message, /^Enter /, `${name}: the old message asked for the value again`);
  }
});

test('a blank albumin still reads as missing, and a real one still answers', () => {
  for (const [name, fn, args] of [
    ['naples', naples, NAPLES], ['far', far, FAR], ['agr', agr, AGR],
  ]) {
    const blank = fn({ ...args, albumin: '' });
    assert.equal(blank.valid, false, name);
    assert.match(blank.message, /^Enter /, `${name}: a blank IS missing and should say so`);
    assert.equal(fn(args).valid, true, name);
  }
});
