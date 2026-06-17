// spec-v96 2.1: Hamilton Depression Rating Scale (HAM-D, 17-item; Hamilton 1960).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hamd } from '../../lib/psych-v96.js';

// 17 items, mixed anchors: items (1-indexed) 1-3,7-11,15 -> 0-4; 4-6,12-14,16-17 -> 0-2.
const ZEROS = () => new Array(17).fill(0);
function withTotal(parts) {
  // parts: { index0: value } overrides on a zero baseline.
  const a = ZEROS();
  for (const [i, v] of Object.entries(parts)) a[Number(i)] = v;
  return a;
}

test('severity band edges 7/8, 16/17, 23/24', () => {
  // item0 (max 4) + item1 (max 4) ... build exact totals from in-range items.
  assert.equal(hamd({ items: withTotal({ 0: 4, 1: 3 }) }).bandLabel, 'no / none'); // 7
  assert.equal(hamd({ items: withTotal({ 0: 4, 1: 4 }) }).bandLabel, 'mild');      // 8
  assert.equal(hamd({ items: withTotal({ 0: 4, 1: 4, 6: 4, 7: 4 }) }).bandLabel, 'mild');     // 16
  assert.equal(hamd({ items: withTotal({ 0: 4, 1: 4, 6: 4, 7: 4, 8: 1 }) }).bandLabel, 'moderate'); // 17
  assert.equal(hamd({ items: withTotal({ 0: 4, 1: 4, 6: 4, 7: 4, 8: 4, 9: 3 }) }).bandLabel, 'moderate'); // 23
  assert.equal(hamd({ items: withTotal({ 0: 4, 1: 4, 6: 4, 7: 4, 8: 4, 9: 4 }) }).bandLabel, 'severe');   // 24
});

test('all 1s totals 17 (moderate) and reports total + band label', () => {
  const r = hamd({ items: new Array(17).fill(1) });
  assert.equal(r.valid, true);
  assert.equal(r.total, 17);
  assert.equal(r.bandLabel, 'moderate');
  assert.ok(r.band.startsWith('HAM-D 17: moderate depression'));
});

test('a blank item withholds the band', () => {
  const a = ZEROS(); a[5] = null;
  const r = hamd({ items: a });
  assert.equal(r.valid, false);
  assert.equal(r.band, '(complete all 17 items)');
});

test('out-of-range item is rejected, not silently clamped into the total', () => {
  const a = ZEROS(); a[3] = 4; // item 4 max is 2
  assert.equal(hamd({ items: a }).valid, false);
  // non-array / wrong length is treated as incomplete
  assert.equal(hamd({ items: 1 }).valid, false);
  assert.equal(hamd({}).valid, false);
});
