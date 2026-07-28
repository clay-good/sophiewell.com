// spec-v553: the PUQE-24.
//
// The load-bearing tests are the three structural facts: the scale has no zero, the well-being item never
// enters the total, and the label divergence is disclosed at exactly the one value where it matters.

import test from 'node:test';
import assert from 'node:assert/strict';
import { puqe24, PUQE_ITEMS, PUQE_MIN, PUQE_MAX } from '../../lib/puqe24-v553.js';

const at = (nauseaHours, vomiting, retching, extra = {}) => puqe24({
  nauseaHours: String(nauseaHours), vomiting: String(vomiting), retching: String(retching), ...extra,
});

test('there are three items, each offering 1 to 5', () => {
  assert.equal(PUQE_ITEMS.length, 3);
  for (const item of PUQE_ITEMS) {
    assert.deepEqual(item.options.map((o) => o.value), [1, 2, 3, 4, 5]);
  }
});

test('every item option 1 is "not at all"', () => {
  for (const item of PUQE_ITEMS) {
    assert.equal(item.options[0].text, 'Not at all');
  }
});

// THE floor.
test('the scale runs 3 to 15 with no zero state', () => {
  assert.equal(PUQE_MIN, 3);
  assert.equal(PUQE_MAX, 15);
  assert.equal(at(1, 1, 1).total, 3);
  assert.equal(at(5, 5, 5).total, 15);
});

test('a score of 3 is the floor and says the scale has no zero', () => {
  const r = at(1, 1, 1);
  assert.equal(r.atFloor, true);
  assert.match(r.bandText, /LOWEST POSSIBLE score/);
  assert.match(r.bandText, /there is no zero/);
});

test('an item answer of 0 is rejected, and the message explains the floor', () => {
  const r = at(0, 1, 1);
  assert.equal(r.valid, false);
  assert.match(r.message, /no zero/);
});

// The label divergence, disclosed only where it matters.
test('the alternative bottom-of-scale convention is disclosed only at a total of 3', () => {
  assert.match(at(1, 1, 1).bandText, /no nausea and vomiting of pregnancy/);
  for (const [a, b, c] of [[2, 1, 1], [2, 2, 2], [5, 5, 5]]) {
    assert.doesNotMatch(at(a, b, c).bandText, /no nausea and vomiting of pregnancy/);
  }
});

test('a total of 3 is still reported in the mild band, per the instrument figure', () => {
  assert.equal(at(1, 1, 1).band, 'Mild');
});

// Band boundaries: identical in every source.
test('the band boundaries sit at 7 and 13', () => {
  assert.equal(at(2, 2, 2).total, 6);
  assert.equal(at(2, 2, 2).band, 'Mild');
  assert.equal(at(3, 2, 2).total, 7);
  assert.equal(at(3, 2, 2).band, 'Moderate');
  assert.equal(at(4, 4, 4).total, 12);
  assert.equal(at(4, 4, 4).band, 'Moderate');
  assert.equal(at(5, 4, 4).total, 13);
  assert.equal(at(5, 4, 4).band, 'Severe');
});

// Well-being never enters the total.
test('well-being does not change the total or the band', () => {
  const bare = at(3, 3, 3);
  for (const wellbeing of ['0', '5', '10']) {
    const r = at(3, 3, 3, { wellbeing });
    assert.equal(r.total, bare.total);
    assert.equal(r.band, bare.band);
    assert.equal(r.wellbeing, Number(wellbeing));
  }
});

test('well-being is optional and reported as null when absent', () => {
  assert.equal(at(3, 3, 3).wellbeing, null);
  assert.equal(at(3, 3, 3, { wellbeing: '' }).wellbeing, null);
});

test('well-being states that it runs in the opposite direction', () => {
  const r = at(3, 3, 3, { wellbeing: '2' });
  assert.match(r.bandText, /OPPOSITE direction/);
  assert.match(r.bandText, /higher is better/);
});

test('an out-of-range well-being is refused', () => {
  assert.equal(at(3, 3, 3, { wellbeing: '11' }).valid, false);
  assert.equal(at(3, 3, 3, { wellbeing: '-1' }).valid, false);
  assert.equal(at(3, 3, 3, { wellbeing: '5.5' }).valid, false);
});

// Input handling.
test('a missing item is refused and named', () => {
  const r = puqe24({ nauseaHours: '2', vomiting: '2' });
  assert.equal(r.valid, false);
  assert.match(r.message, /retching/);
});

test('an out-of-range item is refused', () => {
  assert.equal(at(6, 1, 1).valid, false);
  assert.equal(at(1, 1, 2.5).valid, false);
});

test('the scope note refuses to diagnose hyperemesis or indicate treatment', () => {
  const r = at(5, 5, 5);
  assert.match(r.note, /does not diagnose hyperemesis gravidarum/);
  assert.match(r.note, /does not select an antiemetic/);
  assert.match(r.note, /severely dehydrated at a moderate score/);
});
