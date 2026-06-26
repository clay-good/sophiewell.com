// spec-v155 2.4: Wagner (Meggitt-Wagner) diabetic foot ulcer grade (Wagner
// 1981). A deterministic input -> class mapping, grade 0-5 by depth/extent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wagnerDfu } from '../../lib/suites-v155.js';

test('tile example: grade 3 -> deep ulcer with abscess or osteomyelitis', () => {
  const r = wagnerDfu({ grade: 3 });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 3);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /grade 3/);
  assert.match(r.band, /abscess or osteomyelitis/);
});

test('grade-2/3 abnormal flip (deep infection/gangrene flags at >= 3)', () => {
  assert.equal(wagnerDfu({ grade: 2 }).abnormal, false);
  assert.equal(wagnerDfu({ grade: 3 }).abnormal, true);
  assert.equal(wagnerDfu({ grade: 4 }).abnormal, true);
  assert.match(wagnerDfu({ grade: 4 }).band, /gangrene/);
});

test('every grade 0-5 resolves to one defined cell', () => {
  for (let g = 0; g <= 5; g += 1) {
    const r = wagnerDfu({ grade: g });
    assert.equal(r.valid, true);
    assert.equal(r.grade, g);
    assert.ok(r.band && !/NaN|undefined/.test(r.band));
  }
  assert.equal(wagnerDfu({ grade: 0 }).abnormal, false);
  assert.match(wagnerDfu({ grade: 0 }).band, /intact skin/);
});

test('out-of-range / blank / non-integer -> valid:false', () => {
  assert.equal(wagnerDfu({ grade: 6 }).valid, false);
  assert.equal(wagnerDfu({ grade: -1 }).valid, false);
  assert.equal(wagnerDfu({ grade: 2.5 }).valid, false);
  assert.equal(wagnerDfu({ grade: '' }).valid, false);
  assert.equal(wagnerDfu({}).valid, false);
  assert.match(wagnerDfu({}).message, /Choose the Wagner grade/);
});
