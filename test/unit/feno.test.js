import test from 'node:test';
import assert from 'node:assert/strict';
import { feno as f, ADULT_LOW, ADULT_HIGH, CHILD_LOW, CHILD_HIGH } from '../../lib/feno-v888.js';

test('feno: the published cutpoints', () => {
  assert.equal(ADULT_LOW, 25);
  assert.equal(ADULT_HIGH, 50);
  assert.equal(CHILD_LOW, 20);
  assert.equal(CHILD_HIGH, 35);
});

test('feno: the adult bands, read strictly', () => {
  assert.equal(f({ fenoPpb: 24.9 }).bandLabel, 'Low');
  assert.equal(f({ fenoPpb: 25 }).bandLabel, 'Intermediate');
  assert.equal(f({ fenoPpb: 50 }).bandLabel, 'Intermediate');
  assert.equal(f({ fenoPpb: 50.1 }).bandLabel, 'High');
});

test('feno: the child bands, and the same number reading differently', () => {
  assert.equal(f({ fenoPpb: 19.9, ageGroup: 'child' }).bandLabel, 'Low');
  assert.equal(f({ fenoPpb: 20, ageGroup: 'child' }).bandLabel, 'Intermediate');
  assert.equal(f({ fenoPpb: 35.1, ageGroup: 'child' }).bandLabel, 'High');
  // The point of the age split: 30 ppb is intermediate in BOTH groups, and 40 is not.
  assert.equal(f({ fenoPpb: 30 }).bandLabel, 'Intermediate');
  assert.equal(f({ fenoPpb: 30, ageGroup: 'child' }).bandLabel, 'Intermediate');
  assert.equal(f({ fenoPpb: 40 }).bandLabel, 'Intermediate');
  assert.equal(f({ fenoPpb: 40, ageGroup: 'child' }).bandLabel, 'High');
  assert.match(f({ fenoPpb: 40 }).ageNote, /the other age group would read high/);
  assert.match(f({ fenoPpb: 40, ageGroup: 'child' }).ageNote, /the other age group would read intermediate/);
  // And below both low cutpoints the two agree again.
  assert.equal(f({ fenoPpb: 15 }).bandLabel, 'Low');
  assert.equal(f({ fenoPpb: 15, ageGroup: 'child' }).bandLabel, 'Low');
});

test('feno: it measures inflammation, not asthma', () => {
  // The reason the tile exists, so it prints on every result.
  for (const ppb of [10, 30, 90]) {
    assert.match(f({ fenoPpb: ppb }).notAsthmaNote, /not asthma/);
    assert.match(f({ fenoPpb: ppb }).notAsthmaNote, /does not exclude asthma/);
    assert.match(f({ fenoPpb: ppb }).serialNote, /change over time in the same person/);
  }
  assert.match(f({ fenoPpb: 10 }).band, /both unlikely at this moment/);
});

test('feno: the intermediate band is called out as not a weak positive', () => {
  assert.match(f({ fenoPpb: 30 }).intermediateNote, /not a mildly raised result/);
  assert.match(f({ fenoPpb: 30 }).band, /not the same as a weak positive/);
  assert.equal(f({ fenoPpb: 10 }).intermediateNote, null);
  assert.equal(f({ fenoPpb: 90 }).intermediateNote, null);
});

test('feno: the confounders are named, and a lowering one qualifies a low result', () => {
  const withIcs = f({ fenoPpb: 15, onCorticosteroid: true });
  assert.match(withIcs.confounderNote, /which lowers it/);
  assert.match(withIcs.confounderNote, /argues less than a low value without it/);
  const withAtopy = f({ fenoPpb: 60, atopyOrRhinitis: true });
  assert.match(withAtopy.confounderNote, /which raise it/);
  assert.match(withAtopy.confounderNote, /read with that in mind/);
  // With nothing recorded the list is given anyway.
  assert.match(f({ fenoPpb: 30 }).confounderNote, /corticosteroids and active smoking lower it/);
});

test('feno: a missing or out-of-range value is refused, and an unknown age falls back', () => {
  assert.equal(f({}).valid, false);
  assert.equal(f({ fenoPpb: -1 }).valid, false);
  assert.equal(f({ fenoPpb: 501 }).valid, false);
  assert.equal(f({ fenoPpb: 30, ageGroup: 'made-up' }).ageGroup, 'adult');
});

test('feno: the documented example', () => {
  const r = f({ fenoPpb: '30', ageGroup: 'adult' });
  assert.equal(r.bandLabel, 'Intermediate');
  assert.deepEqual(r.cutpoints, { low: 25, high: 50 });
  assert.equal(r.abnormal, false);
});
