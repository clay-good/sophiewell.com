import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCopyAll } from '../../lib/clipboard.js';

test('formatCopyAll: empty array yields empty string', () => {
  assert.equal(formatCopyAll([]), '');
});

test('formatCopyAll: label/value/units format', () => {
  const out = formatCopyAll([
    { label: 'eGFR (CKD-EPI 2021)', value: 87, units: 'mL/min/1.73m^2' },
    { label: 'Cockcroft-Gault', value: 75, units: 'mL/min' },
  ]);
  assert.equal(out, 'eGFR (CKD-EPI 2021): 87 mL/min/1.73m^2\nCockcroft-Gault: 75 mL/min');
});

test('formatCopyAll: omits units when not provided', () => {
  assert.equal(formatCopyAll([{ label: 'BMI', value: 22.9 }]), 'BMI: 22.9');
});

test('formatCopyAll: skips empty entries', () => {
  const out = formatCopyAll([{ label: 'A', value: 1 }, null, undefined, {}]);
  assert.equal(out, 'A: 1');
});

test('formatCopyAll: throws on non-array', () => {
  assert.throws(() => formatCopyAll('nope'));
});
