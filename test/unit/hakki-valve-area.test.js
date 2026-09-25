// spec-v1455: Hakki valve area = CO / sqrt(gradient) (Hakki 1981, Circulation).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hakkiValveArea as h } from '../../lib/hakki-valve-area-v1455.js';

test('cardiac output divided by the square root of the gradient', () => {
  assert.equal(h({ valve: 'aortic', co: 5, grad: 64 }).area, 0.63);
  assert.equal(h({ valve: 'mitral', co: 4, grad: 16 }).area, 1);
});

test('the valve-specific agreement with Gorlin is stated', () => {
  assert.ok(h({ valve: 'aortic', co: 5, grad: 64 }).notes[0].includes('0.96'));
  assert.ok(h({ valve: 'mitral', co: 5, grad: 64 }).notes[0].includes('0.94'));
});

test('the same limits as the Gorlin tool: blank, zero and impossible values refused', () => {
  assert.match(h({ valve: 'aortic', grad: 40 }).message, /Enter the cardiac output/);
  assert.equal(h({ valve: 'aortic', co: 0, grad: 40 }).valid, false);
  assert.equal(h({ valve: 'aortic', co: 5, grad: 900 }).valid, false);
  assert.match(h({ co: 5, grad: 40 }).message, /Choose the valve/);
});
