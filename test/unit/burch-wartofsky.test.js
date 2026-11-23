// spec-v58 §2.9: Burch-Wartofsky point scale.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { burchWartofsky, BURCH_POINTS } from '../../lib/scoring-v6.js';

test('example: total 75, highly suggestive (>=45)', () => {
  const r = burchWartofsky({ temp: 15, cns: 10, gi: 10, hr: 15, chf: 5, afib: true, precipitant: true });
  assert.equal(r.total, 75);
  assert.match(r.band, /Highly suggestive/);
});
test('band boundaries: 25 impending, <25 unlikely', () => {
  assert.match(burchWartofsky({ temp: 15, cns: 10 }).band, /Impending/);
  assert.match(burchWartofsky({ temp: 5, cns: 0 }).band, /unlikely/);
});
test('empty input -> 0 unlikely (no throw)', () => {
  assert.equal(burchWartofsky({}).total, 0);
});

// spec-v1775: the scale is weighted in steps, so a range check alone accepted 7 points as readily as 5 --
// and 7.5 with it. The agent contract has refused those since spec-v637; the page calls the library.
test('a point value the scale has no row for is refused, on the library path', () => {
  const ok = { temp: 15, cns: 10, gi: 10, hr: 15, chf: 5, afib: true, precipitant: true };
  assert.equal(burchWartofsky(ok).total, 75);
  for (const [field, bad] of [['temp', 7], ['temp', 15.5], ['cns', 5], ['gi', 5], ['hr', 7.5], ['chf', 20]]) {
    assert.throws(() => burchWartofsky({ ...ok, [field]: bad }), /must be one of/, `${field} = ${bad}`);
  }
  // Every value the scale does print still scores.
  for (const [field, allowed] of Object.entries(BURCH_POINTS)) {
    for (const v of allowed) assert.equal(typeof burchWartofsky({ ...ok, [field]: v }).total, 'number', `${field} = ${v}`);
  }
  // A blank picker is still nothing selected, which on a points scale is zero.
  assert.equal(burchWartofsky({ ...ok, temp: '' }).total, 60);
});

test('the point sets are the 1993 scale\'s own, and the agent contract reads them from here', () => {
  assert.deepEqual(BURCH_POINTS.temp, [0, 5, 10, 15, 20, 25, 30]);
  assert.deepEqual(BURCH_POINTS.cns, [0, 10, 20, 30]);
  assert.deepEqual(BURCH_POINTS.gi, [0, 10, 20]);
  assert.deepEqual(BURCH_POINTS.hr, [0, 5, 10, 15, 20, 25]);
  assert.deepEqual(BURCH_POINTS.chf, [0, 5, 10, 15]);
});
