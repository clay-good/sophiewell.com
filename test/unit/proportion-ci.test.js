// spec-v186 §2.6: Wilson-score confidence interval for a proportion. n is
// guarded > 0; the interval is clamped to [0, 1].
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { proportionCi } from '../../lib/specialtymath-v186.js';

test('tile example: 8 of 10, 95% Wilson CI', () => {
  const r = proportionCi({ events: 8, n: 10, level: 95 });
  assert.equal(r.valid, true);
  assert.equal(r.proportion, 80);
  assert.equal(r.ciLow, 49);
  assert.equal(r.ciHigh, 94.3);
});

test('the Wilson interval never leaves [0, 100]% at a boundary', () => {
  const zero = proportionCi({ events: 0, n: 20, level: 95 });
  assert.ok(zero.ciLow >= 0 && zero.ciHigh <= 100);
  assert.equal(zero.proportion, 0);
  const all = proportionCi({ events: 20, n: 20, level: 95 });
  assert.ok(all.ciLow >= 0 && all.ciHigh <= 100);
  assert.equal(all.proportion, 100);
});

test('a higher confidence level widens the interval', () => {
  const ci95 = proportionCi({ events: 8, n: 10, level: 95 });
  const ci99 = proportionCi({ events: 8, n: 10, level: 99 });
  assert.ok((ci99.ciHigh - ci99.ciLow) > (ci95.ciHigh - ci95.ciLow));
});

test('guards: events cannot exceed n; n must be > 0', () => {
  assert.equal(proportionCi({ events: 11, n: 10, level: 95 }).valid, false);
  assert.equal(proportionCi({ events: 5, n: 0, level: 95 }).valid, false);
  assert.equal(proportionCi({ events: 5 }).valid, false);
  assert.equal(proportionCi({}).valid, false);
});

// spec-v1746: an entered value outside the range read as blank and was asked for again.
test('spec-v1746: an out-of-range n or events is told its range, a blank is still asked for', () => {
  const EX = { events: '8', n: '10', level: '95' };
  for (const k of ['events', 'n']) {
    const r = proportionCi({ ...EX, [k]: '-999999' });
    assert.equal(r.valid, false);
    assert.match(r.message, /must be/);
  }
  assert.match(proportionCi({ ...EX, events: '' }).message, /^Enter the number of events/);
  assert.equal(proportionCi(EX).valid, true);
});
