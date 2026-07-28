// spec-v572: the HEAVEN criteria.
//
// The load-bearing test is that no percentage is emitted for intermediate counts: only two figures were
// ever published, and the rest exist as a chart.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  heavenCriteria, HEAVEN_CRITERIA, HEAVEN_MAX, PUBLISHED_ANCHORS, ANCHOR_FLOOR,
  HYPOXEMIA_THRESHOLD, PEDIATRIC_AGE_THRESHOLD,
} from '../../lib/heaven-criteria-v572.js';

const all = (v) => Object.fromEntries(HEAVEN_CRITERIA.map((c) => [c.key, v]));
const withCount = (n) => {
  const o = all('no');
  HEAVEN_CRITERIA.slice(0, n).forEach((c) => { o[c.key] = 'yes'; });
  return o;
};

test('there are six criteria spelling HEAVEN', () => {
  assert.equal(HEAVEN_CRITERIA.length, HEAVEN_MAX);
  assert.equal(HEAVEN_CRITERIA.map((c) => c.letter).join(''), 'HEAVEN');
});

test('the two objective thresholds are the published ones', () => {
  assert.equal(HYPOXEMIA_THRESHOLD, 93);
  assert.equal(PEDIATRIC_AGE_THRESHOLD, 8);
});

test('the count runs 0 to 6', () => {
  assert.equal(heavenCriteria(all('no')).count, 0);
  assert.equal(heavenCriteria(all('yes')).count, HEAVEN_MAX);
});

// THE no-interpolation rule.
test('a published figure exists only at 0 and at 5 or more', () => {
  assert.equal(heavenCriteria(withCount(0)).publishedAnchor, PUBLISHED_ANCHORS.none);
  for (const n of [1, 2, 3, 4]) {
    const r = heavenCriteria(withCount(n));
    assert.equal(r.publishedAnchor, null, `count ${n}`);
    assert.equal(r.hasPublishedFigure, false);
    assert.match(r.bandText, /No first-attempt success figure is published for this count/);
  }
  assert.equal(heavenCriteria(withCount(ANCHOR_FLOOR)).publishedAnchor, PUBLISHED_ANCHORS.fiveOrMore);
  assert.equal(heavenCriteria(withCount(6)).publishedAnchor, PUBLISHED_ANCHORS.fiveOrMore);
});

test('exactly two published figures exist, and neither is attributed to an intermediate count', () => {
  // The two anchors are the only published figures.
  assert.equal(Object.keys(PUBLISHED_ANCHORS).length, 2);
  // At an intermediate count the tile attributes no figure to the patient: the anchors appear only
  // inside the explanatory sentence that says none is published for this count.
  for (const n of [1, 2, 3, 4]) {
    const r = heavenCriteria(withCount(n));
    assert.equal(r.publishedAnchor, null, `count ${n}`);
    assert.equal(r.hasPublishedFigure, false, `count ${n}`);
    assert.match(r.bandText, /No first-attempt success figure is published for this count/);
  }
});

test('the result states that HEAVEN is a count with no band table', () => {
  assert.match(heavenCriteria(all('no')).bandText, /COUNT, not a point score, and it has no band table/);
});

// The judgment criteria.
test('only two elements of the instrument are objective', () => {
  const objective = HEAVEN_CRITERIA.filter((c) => c.objective).map((c) => c.key);
  assert.deepEqual(objective, ['hypoxemia']);
  assert.equal(HEAVEN_CRITERIA.filter((c) => !c.objective).length, 5);
});

test('obesity is left undefined, with no BMI threshold', () => {
  const size = HEAVEN_CRITERIA.find((c) => c.key === 'extremesOfSize');
  assert.match(size.text, /deliberately left undefined/);
  assert.match(size.text, /no body mass index threshold/);
});

// The misleading name.
test('exsanguination is defined as suspected anemia, not bleeding', () => {
  const e = HEAVEN_CRITERIA.find((c) => c.key === 'exsanguination');
  assert.match(e.text, /SUSPECTED ANEMIA/);
  assert.match(e.text, /NOT active bleeding/);
});

// Timing.
test('the result states the criteria are assessed at laryngoscopy, not on arrival', () => {
  assert.match(heavenCriteria(all('no')).bandText, /AT THE MOMENT OF LARYNGOSCOPY, not on arrival/);
});

test('the refusal message also states the timing', () => {
  const o = all('no');
  delete o.neckMobility;
  const r = heavenCriteria(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /AT THE MOMENT OF LARYNGOSCOPY/);
});

// Two endpoints.
test('the result states that two different outcomes have been published', () => {
  assert.match(heavenCriteria(all('no')).bandText, /Two outcomes have been published/);
});

test('the criteria present are listed', () => {
  const r = heavenCriteria(withCount(2));
  assert.equal(r.count, 2);
  assert.equal(r.criteriaPresent.length, 2);
  assert.match(r.criteriaPresent[0], /Hypoxemia/);
});

test('the scope note says a count of zero does not make an airway safe', () => {
  const r = heavenCriteria(all('no'));
  assert.match(r.note, /count of zero does not make an airway safe/);
  assert.match(r.note, /does not replace a difficult-airway plan/);
});
