// spec-v464: Crawford thoracoabdominal aortic aneurysm classification (extents I-IV).
// Worked-example tests: each extent and its aortic-segment description, numeric input, invalid-extent guard.
// Extents transcribed from Crawford 1986 (J Vasc Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crawfordTaaa } from '../../lib/crawford-taaa-v464.js';

test('extent II: most extensive (the META example)', () => {
  const r = crawfordTaaa({ extent: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.extent, 'II');
  assert.match(r.band, /the most extensive, involving the entire thoracoabdominal aorta/);
});

test('extent I: left subclavian to above the renals', () => {
  assert.match(crawfordTaaa({ extent: 'I' }).band, /to above the renal arteries/);
});

test('extent III: distal descending thoracic', () => {
  assert.match(crawfordTaaa({ extent: 'III' }).band, /sixth intercostal space/);
});

test('extent IV: the entire abdominal aorta', () => {
  const r = crawfordTaaa({ extent: 'IV' });
  assert.equal(r.extent, 'IV');
  assert.match(r.band, /the entire abdominal aorta/);
});

test('numeric input maps to the extents', () => {
  assert.equal(crawfordTaaa({ extent: 1 }).extent, 'I');
  assert.equal(crawfordTaaa({ extent: 4 }).extent, 'IV');
});

test('a missing or out-of-range extent is invalid', () => {
  assert.equal(crawfordTaaa({}).valid, false);
  assert.equal(crawfordTaaa({ extent: 'V' }).valid, false);
  assert.equal(crawfordTaaa({ extent: '0' }).valid, false);
});
