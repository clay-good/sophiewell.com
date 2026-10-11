// spec-v1634 tool 17: NINJA nephrotoxic medication exposure (Goldstein 2020).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ninjaNephrotoxinExposure as d } from '../../lib/ninja-nephrotoxin-exposure-v1634.js';

test('3 or more on any one limb is exposed; 2 is not', () => {
  assert.equal(d({ nephrotoxinCount: 2, aminoglycosideDays: 2, vancomycinDays: 2 }).exposed, false);
  assert.deepEqual(d({ nephrotoxinCount: 3, aminoglycosideDays: 0, vancomycinDays: 0 }).limbs, ['3 nephrotoxic medications on the same day (3 or more)']);
  assert.equal(d({ nephrotoxinCount: 0, aminoglycosideDays: 3, vancomycinDays: 0 }).exposed, true);
  assert.equal(d({ nephrotoxinCount: 1, aminoglycosideDays: 0, vancomycinDays: 3 }).exposed, true);
  assert.equal(d({ nephrotoxinCount: 4, aminoglycosideDays: 5, vancomycinDays: 6 }).limbs.length, 3);
});

test('what the program does next, and what the tool does not know', () => {
  const r = d({ nephrotoxinCount: 3, aminoglycosideDays: 0, vancomycinDays: 0 });
  assert.match(r.notes[0], /daily serum creatinine/);
  assert.equal(r.abnormal, true);
  const n = d({ nephrotoxinCount: 0, aminoglycosideDays: 0, vancomycinDays: 0 });
  assert.match(n.band, /^Does not meet/);
  assert.match(n.note, /does not mean the kidneys are safe/);
  assert.match(n.note, /reader's call/);
});

test('all three counts are needed; zero is an answer', () => {
  assert.match(d({}).message, /^Enter the number of nephrotoxic medications/);
  assert.match(d({ nephrotoxinCount: 3 }).message, /^Enter the consecutive days of an IV aminoglycoside/);
  assert.match(d({ nephrotoxinCount: 3, aminoglycosideDays: 0 }).message, /^Enter the consecutive days of IV vancomycin/);
  assert.match(d({ nephrotoxinCount: 2.5, aminoglycosideDays: 0, vancomycinDays: 0 }).message, /whole numbers/);
  assert.equal(d({ nephrotoxinCount: -1, aminoglycosideDays: 0, vancomycinDays: 0 }).valid, false);
  assert.equal(d(null).valid, false);
});
