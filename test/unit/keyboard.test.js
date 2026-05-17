import { test } from 'node:test';
import assert from 'node:assert/strict';
import { _testing } from '../../lib/keyboard.js';

test('shortcuts: includes home and the named utilities', () => {
  // The "s" leader (focus search) was retired with the topbar search input.
  // The "p" leader (Pinned section jump) was retired in spec-v8 §3.2 with
  // the rest of the Pin feature.
  const keys = new Set(_testing.SHORTCUTS.map(([k]) => k));
  for (const k of ['h', 'u', 'b', 'e', 'd', 'w', 'm', 'g', 'i', 'c', 'n', 'f', 'o']) {
    assert.ok(keys.has(k), `missing shortcut letter: ${k}`);
  }
  assert.ok(!keys.has('p'), '"p" leader (Pinned jump) should be retired per spec-v8 §3.2');
});

test('shortcuts: each entry has a label', () => {
  for (const [k, a] of _testing.SHORTCUTS) {
    assert.ok(a.label && a.label.length > 0, `${k}: missing label`);
  }
});
