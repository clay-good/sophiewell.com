import { test } from 'node:test';
import assert from 'node:assert/strict';
import { _testing } from '../../lib/keyboard.js';

test('shortcuts: includes home, search, and the named utilities', () => {
  const keys = new Set(_testing.SHORTCUTS.map(([k]) => k));
  for (const k of ['h', 's', 'p', 'u', 'b', 'e', 'd', 'w', 'm', 'g', 'i', 'c', 'n', 'f', 'o']) {
    assert.ok(keys.has(k), `missing shortcut letter: ${k}`);
  }
});

test('shortcuts: each entry has a label', () => {
  for (const [k, a] of _testing.SHORTCUTS) {
    assert.ok(a.label && a.label.length > 0, `${k}: missing label`);
  }
});
