// spec-v520: the Spigelman classification of duodenal polyposis in FAP.
// Worked-example tests: the four parameters and their 1-3 point rows, every stage boundary (4/5, 6/7, 8/9),
// the two facts the tile refuses to paper over (no zero row, so the floor with any adenoma present is 4; and
// the dysplasia options carry both the original and the two-tiered wording), and the guards.
// Parameters, points, and bands transcribed from Spigelman and colleagues 1989 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spigelman, SPIGELMAN_ITEMS } from '../../lib/spigelman-v520.js';

function score({ number = 1, size = 1, histology = 1, dysplasia = 1 } = {}) {
  return spigelman({ number, size, histology, dysplasia });
}

test('four parameters, each with exactly three point rows', () => {
  assert.equal(SPIGELMAN_ITEMS.length, 4);
  for (const item of SPIGELMAN_ITEMS) {
    assert.equal(item.options.length, 3);
    assert.deepEqual(item.options.map((o) => o.value), ['1', '2', '3']);
  }
});

test('no parameter offers a zero row', () => {
  for (const item of SPIGELMAN_ITEMS) {
    assert.ok(!item.options.some((o) => o.value === '0'), `${item.key} must not offer 0`);
  }
});

test('the dysplasia options name both the original grade and the two-tiered equivalent', () => {
  const dysplasia = SPIGELMAN_ITEMS.find((i) => i.key === 'dysplasia');
  assert.match(dysplasia.options[0].text, /mild/);
  assert.match(dysplasia.options[0].text, /low grade/);
  assert.match(dysplasia.options[2].text, /severe/);
  assert.match(dysplasia.options[2].text, /high grade/);
  // The middle grade must say plainly that a two-tiered report will not contain it.
  assert.match(dysplasia.options[1].text, /two-tiered report will not contain it/);
});

test('the lowest total reachable with any adenoma present is 4, and it says so', () => {
  const floor = score();
  assert.equal(floor.valid, true);
  assert.equal(floor.total, 4);
  assert.equal(floor.stage, 'I');
  assert.match(floor.band, /lowest total reachable/);
});

test('over 20 large villous polyps with severe dysplasia score 12, stage IV (the META example)', () => {
  const r = score({ number: 3, size: 3, histology: 3, dysplasia: 3 });
  assert.equal(r.total, 12);
  assert.equal(r.stage, 'IV');
  assert.equal(r.severity, 'severe disease');
  assert.match(r.bandLabel, /Spigelman 12 of 12, stage IV/);
});

test('every stage boundary sits where the source puts it', () => {
  assert.equal(score({ number: 1, size: 1, histology: 1, dysplasia: 1 }).stage, 'I');   // 4
  assert.equal(score({ number: 2, size: 1, histology: 1, dysplasia: 1 }).stage, 'II');  // 5
  assert.equal(score({ number: 2, size: 2, histology: 1, dysplasia: 1 }).stage, 'II');  // 6
  assert.equal(score({ number: 2, size: 2, histology: 2, dysplasia: 1 }).stage, 'III'); // 7
  assert.equal(score({ number: 2, size: 2, histology: 2, dysplasia: 2 }).stage, 'III'); // 8
  assert.equal(score({ number: 3, size: 2, histology: 2, dysplasia: 2 }).stage, 'IV');  // 9
});

test('stages III and IV are both read as severe, II as moderate, I as mild', () => {
  assert.equal(score({ number: 1, size: 1, histology: 1, dysplasia: 1 }).severity, 'mild disease');
  assert.equal(score({ number: 2, size: 2, histology: 1, dysplasia: 1 }).severity, 'moderate disease');
  assert.equal(score({ number: 2, size: 2, histology: 2, dysplasia: 1 }).severity, 'severe disease');
  assert.equal(score({ number: 3, size: 3, histology: 3, dysplasia: 3 }).severity, 'severe disease');
});

test('the result never emits a surveillance interval', () => {
  const r = score({ number: 3, size: 3, histology: 3, dysplasia: 3 });
  const text = `${r.band} ${r.note}`;
  assert.doesNotMatch(text, /every \d+ (year|month)/);
  assert.match(r.band, /not a surveillance interval/);
});

test('string answers are accepted', () => {
  assert.equal(spigelman({ number: '3', size: '2', histology: '2', dysplasia: '2' }).total, 9);
});

test('a missing parameter is invalid', () => {
  assert.equal(spigelman({}).valid, false);
  assert.equal(spigelman({ number: 1, size: 1, histology: 1 }).valid, false);
});

test('a zero, an out-of-range, or a non-integer answer is invalid', () => {
  assert.equal(score({ number: 0 }).valid, false);
  assert.equal(score({ size: 4 }).valid, false);
  assert.equal(score({ histology: 1.5 }).valid, false);
  assert.equal(score({ dysplasia: 'x' }).valid, false);
});
