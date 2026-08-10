// spec-v683: Effective serum osmolality (tonicity).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { effectiveOsmolality } from '../../lib/effective-osmolality-v683.js';

test('normal case: Na 140, glucose 90 -> 285 mOsm/kg (normal)', () => {
  const r = effectiveOsmolality({ sodium: '140', glucose: '90' });
  assert.equal(r.valid, true);
  assert.equal(r.osmolality, 285);
  assert.equal(r.tier, 'normal');
  assert.equal(r.abnormal, false);
});

test('HHS case: Na 140, glucose 900 -> 330 mOsm/kg (markedly elevated, > 320)', () => {
  const r = effectiveOsmolality({ sodium: '140', glucose: '900' });
  assert.equal(r.osmolality, 330);
  assert.equal(r.tier, 'markedly-elevated');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /330 mOsm\/kg/);
});

test('urea is excluded (formula is 2*Na + glucose/18 only)', () => {
  // Two calls with identical Na/glucose must match regardless of any urea input.
  const a = effectiveOsmolality({ sodium: '138', glucose: '180' });
  const b = effectiveOsmolality({ sodium: '138', glucose: '180', bun: '80' });
  assert.equal(a.osmolality, b.osmolality);
  assert.equal(a.osmolality, 2 * 138 + 180 / 18); // 286
});

test('band edges: <275 low, 275-295 normal, 295-320 elevated, >320 markedly', () => {
  assert.equal(effectiveOsmolality({ sodium: '135', glucose: '0' }).tier, 'low');       // 270
  assert.equal(effectiveOsmolality({ sodium: '140', glucose: '90' }).tier, 'normal');    // 285
  assert.equal(effectiveOsmolality({ sodium: '145', glucose: '180' }).tier, 'elevated'); // 300
  assert.equal(effectiveOsmolality({ sodium: '150', glucose: '400' }).tier, 'markedly-elevated'); // 322.2
});

test('inputs are validated', () => {
  assert.equal(effectiveOsmolality({}).valid, false);
  assert.equal(effectiveOsmolality({}).code, 'MISSING_INPUT');
  assert.equal(effectiveOsmolality({ sodium: '140' }).field, 'glucose');
  assert.equal(effectiveOsmolality({ sodium: '0', glucose: '90' }).field, 'sodium');
});
