// spec-v175 §2.2: Checklist of Nonverbal Pain Indicators (CNPI). 6 behaviours,
// present/absent at rest and with movement; rest 0-6, movement 0-6, combined
// 0-12. The two conditions never conflate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cnpi } from '../../lib/ltcga-v175.js';

const KEYS = ['nonverbalVocal', 'facialGrimace', 'bracing', 'restlessness', 'rubbing', 'verbalVocal'];
function build(rest, move) {
  const o = {};
  KEYS.forEach((k, i) => { o[`${k}Rest`] = rest[i]; o[`${k}Move`] = move[i]; });
  return o;
}
const ABSENT = [0, 0, 0, 0, 0, 0];

test('CNPI all absent -> 0/12, no indicators', () => {
  const r = cnpi(build(ABSENT, ABSENT));
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.restScore, 0);
  assert.equal(r.moveScore, 0);
  assert.match(r.band, /no pain indicators/);
});

test('CNPI rest 0, movement 3 -> 3/12, conditions kept separate', () => {
  const r = cnpi(build(ABSENT, [1, 1, 1, 0, 0, 0]));
  assert.equal(r.restScore, 0);
  assert.equal(r.moveScore, 3);
  assert.equal(r.total, 3);
  assert.equal(r.positive, true);
});

test('CNPI rest 2, movement 4 -> combined 6, never conflated', () => {
  const r = cnpi(build([1, 1, 0, 0, 0, 0], [1, 1, 1, 1, 0, 0]));
  assert.equal(r.restScore, 2);
  assert.equal(r.moveScore, 4);
  assert.equal(r.total, 6);
});

test('CNPI all present both conditions -> 12/12 ceiling', () => {
  const all = [1, 1, 1, 1, 1, 1];
  const r = cnpi(build(all, all));
  assert.equal(r.restScore, 6);
  assert.equal(r.moveScore, 6);
  assert.equal(r.total, 12);
});

test('CNPI blank condition -> complete-the-fields fallback (no movement-from-rest)', () => {
  const o = build(ABSENT, [1, 1, 1, 0, 0, 0]);
  delete o.bracingMove; // leave one movement field blank
  assert.equal(cnpi(o).valid, false);
  assert.equal(cnpi({}).valid, false);
});
