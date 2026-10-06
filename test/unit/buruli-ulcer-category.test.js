// spec-v1561 tool 5: Buruli ulcer category edges (exactly 5 and 15 cm), "at least" with blanks, and doses.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buruliUlcerCategory as r } from '../../lib/buruli-ulcer-category-v1561.js';

const b = { lesions: '1', weight: '30', critical: 'no', bone: 'no' };

test('categories and edges', () => {
  assert.equal(r({ ...b, diameter: '4.9' }).bandLabel, 'Category I');
  assert.equal(r({ ...b, diameter: '5' }).bandLabel, 'Category II');
  assert.equal(r({ ...b, diameter: '15' }).bandLabel, 'Category II');
  assert.equal(r({ ...b, diameter: '15.1' }).bandLabel, 'Category III');
  assert.equal(r({ ...b, diameter: '2', lesions: '2' }).bandLabel, 'Category III');
  assert.equal(r({ ...b, diameter: '2', critical: 'yes' }).bandLabel, 'Category III');
  assert.equal(r({ ...b, diameter: '2', bone: 'yes' }).bandLabel, 'Category III');
  assert.equal(r({ lesions: '1', weight: '30', diameter: '2' }).bandLabel, 'At least category I');
});

test('doses and caps', () => {
  assert.ok(r({ ...b, diameter: '2' }).notes.some((n) => /Rifampicin 300 mg once daily .* clarithromycin 225 mg twice daily/.test(n)));
  assert.ok(r({ ...b, diameter: '2', weight: '80' }).notes.some((n) => /600 mg.*capped at 600 mg.*500 mg twice daily.*capped at 1,000 mg a day/.test(n)));
  assert.ok(r({ ...b, diameter: '2', pregnant: 'yes' }).notes.some((n) => /streptomycin is contraindicated/.test(n)));
  assert.ok(r({ ...b, diameter: '2', weight: '80' }).notes.some((n) => /streptomycin 1000 mg/.test(n)));
});

test('refusals', () => {
  assert.equal(r({ ...b }).valid, false);
  assert.equal(r({ ...b, diameter: '3', weight: '' }).valid, false);
});
