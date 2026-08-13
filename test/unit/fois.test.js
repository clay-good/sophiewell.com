// spec-v727: Functional Oral Intake Scale (FOIS).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fois } from '../../lib/fois-v727.js';

test('Level 1 -> no oral intake (tube-dependent, flagged)', () => {
  const r = fois({ level: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.level, 1);
  assert.equal(r.tubeDependent, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /FOIS Level 1/);
});

test('Level 4 -> total oral, single consistency (not tube-dependent)', () => {
  const r = fois({ level: '4' });
  assert.equal(r.level, 4);
  assert.equal(r.tubeDependent, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /single consistency/);
});

test('Level 7 -> total oral, no restrictions', () => {
  const r = fois({ level: '7' });
  assert.equal(r.level, 7);
  assert.match(r.band, /no restrictions/);
});

test('the tube-feeding boundary is level 3 vs 4', () => {
  assert.equal(fois({ level: '3' }).tubeDependent, true);
  assert.equal(fois({ level: '4' }).tubeDependent, false);
});

test('level is required and validated 1-7', () => {
  assert.equal(fois({}).valid, false);
  assert.equal(fois({}).field, 'level');
  assert.equal(fois({ level: '0' }).valid, false);
  assert.equal(fois({ level: '8' }).valid, false);
});
