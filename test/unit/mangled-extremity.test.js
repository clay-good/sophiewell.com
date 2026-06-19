// spec-v109 2.3: MESS (Johansen 1990). Ischemia subscore doubled when ischemia
// time > 6 h; total >= 7 historically associated with amputation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mangledExtremity } from '../../lib/traumaclass-v109.js';

test('missing skeletal or ischemia -> fallback', () => {
  assert.equal(mangledExtremity({}).valid, false);
  assert.equal(mangledExtremity({ skeletal: 3 }).valid, false);
  assert.equal(mangledExtremity({ skeletal: 0, ischemia: 2 }).valid, false);
});

test('sums all four components', () => {
  const r = mangledExtremity({ skeletal: 2, ischemia: 1, shock: 1, age: 1 });
  assert.equal(r.total, 5); // 2 + 1 + 1 + 1
  assert.equal(r.doubled, false);
  assert.equal(r.amp, false);
});

test('band flip: ischemia-time doubling pushes the total across 7', () => {
  const under = mangledExtremity({ skeletal: 3, ischemia: 2, shock: 0, age: 0 });
  assert.equal(under.total, 5); // 3 + 2
  assert.equal(under.amp, false);
  const over = mangledExtremity({ skeletal: 3, ischemia: 2, ischemiaOver6h: true, shock: 0, age: 0 });
  assert.equal(over.total, 7); // 3 + (2*2)
  assert.equal(over.doubled, true);
  assert.equal(over.amp, true);
  assert.match(over.band, /MESS 7 \(ischemia subscore doubled/);
});

test('maximal score is bounded to 14', () => {
  const r = mangledExtremity({ skeletal: 4, ischemia: 3, ischemiaOver6h: true, shock: 2, age: 2 });
  assert.equal(r.total, 14); // 4 + 6 + 2 + 2
});

test('shock and age default to 0 when omitted', () => {
  const r = mangledExtremity({ skeletal: 1, ischemia: 1 });
  assert.equal(r.total, 2);
});
