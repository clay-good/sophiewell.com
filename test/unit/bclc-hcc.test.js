// spec-v187 §2.1: BCLC stage mapping ECOG, tumor burden, and Child-Pugh.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bclcHcc } from '../../lib/onc-staging-v187.js';

test('tile example: intermediate burden, preserved function -> stage B', () => {
  const r = bclcHcc({ ecog: '0', child: 'A', burden: 'intermediate' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'B');
  assert.match(r.strategy, /chemoembolization/);
});

test('very-early single nodule -> stage 0; early -> stage A', () => {
  assert.equal(bclcHcc({ ecog: '0', child: 'A', burden: 'very-early' }).stage, '0');
  assert.equal(bclcHcc({ ecog: '0', child: 'A', burden: 'early' }).stage, 'A');
});

test('performance status or vascular spread -> stage C; Child C / PS >= 3 -> stage D', () => {
  assert.equal(bclcHcc({ ecog: '1', child: 'A', burden: 'early' }).stage, 'C');
  assert.equal(bclcHcc({ ecog: '0', child: 'A', burden: 'advanced' }).stage, 'C');
  assert.equal(bclcHcc({ ecog: '3', child: 'A', burden: 'early' }).stage, 'D');
  assert.equal(bclcHcc({ ecog: '0', child: 'C', burden: 'very-early' }).stage, 'D');
});

test('guards: all three inputs required', () => {
  assert.equal(bclcHcc({ ecog: '0', child: 'A' }).valid, false);
  assert.equal(bclcHcc({ ecog: '9', child: 'A', burden: 'early' }).valid, false);
  assert.equal(bclcHcc({}).valid, false);
});
