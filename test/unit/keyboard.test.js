import { test } from 'node:test';
import assert from 'node:assert/strict';
import { _testing } from '../../lib/keyboard.js';

test('shortcuts: includes home and the surviving named utilities', () => {
  // The "s" leader (focus search) was retired with the topbar search input.
  // The "p" leader (Pinned section jump) was retired in spec-v8 §3.2 with
  // the rest of the Pin feature.
  // The "i" (ICD-10), "c" (CPT), "n" (NDC), "f" (Medicare Fee Lookup),
  // "o" (Out-of-Pocket Estimator), and the HCPCS branch of "h" were retired
  // when their tiles were removed in spec-v29 wave 29-2 §2.1 / §2.2.
  const keys = new Set(_testing.SHORTCUTS.map(([k]) => k));
  for (const k of ['h', 'u', 'b', 'e', 'd', 'w', 'm', 'g']) {
    assert.ok(keys.has(k), `missing shortcut letter: ${k}`);
  }
  for (const k of ['p', 'i', 'c', 'n', 'f', 'o']) {
    assert.ok(!keys.has(k), `"${k}" leader should be retired`);
  }
});

test('shortcuts: each entry has a label', () => {
  for (const [k, a] of _testing.SHORTCUTS) {
    assert.ok(a.label && a.label.length > 0, `${k}: missing label`);
  }
});
