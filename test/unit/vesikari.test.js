// spec-v530: the Vesikari clinical severity score for acute gastroenteritis.
// Worked-example tests: the 0-20 ceiling that only closes if treatment is ONE item, the dehydration row that
// has no 1-point option, both band edges at exactly 7 and exactly 11, and the guards. Items, points, and
// bands transcribed from Ruuska and Vesikari 1990 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vesikari, VESIKARI_ITEMS } from '../../lib/vesikari-v530.js';

function score(over = {}) {
  const base = {
    diarrheaDays: '0', stoolsPerDay: '0', vomitingDays: '0', vomitsPerDay: '0',
    temperature: '0', dehydration: '0', treatment: '0',
  };
  return vesikari({ ...base, ...over });
}

test('seven items', () => {
  assert.equal(VESIKARI_ITEMS.length, 7);
});

test('five items run 0-3, dehydration skips 1, and treatment stops at 2', () => {
  const byKey = Object.fromEntries(VESIKARI_ITEMS.map((i) => [i.key, i.options.map((o) => o.value)]));
  for (const k of ['diarrheaDays', 'stoolsPerDay', 'vomitingDays', 'vomitsPerDay', 'temperature']) {
    assert.deepEqual(byKey[k], ['0', '1', '2', '3'], k);
  }
  assert.deepEqual(byKey.dehydration, ['0', '2', '3']);   // no 1
  assert.deepEqual(byKey.treatment, ['0', '1', '2']);     // one item, max 2
});

test('the ceiling is exactly 20, which only closes because treatment is one item', () => {
  const max = score({
    diarrheaDays: '3', stoolsPerDay: '3', vomitingDays: '3', vomitsPerDay: '3',
    temperature: '3', dehydration: '3', treatment: '2',
  });
  assert.equal(max.total, 20);
  assert.equal(max.severity, 'severe');
  // Six 3-point items plus a 2-point treatment item. Scoring rehydration and hospitalization as two
  // separate items would have produced 23.
  assert.notEqual(max.total, 23);
});

test('the floor is 0 and reads as mild', () => {
  const lo = score();
  assert.equal(lo.valid, true);
  assert.equal(lo.total, 0);
  assert.equal(lo.severity, 'mild');
});

test('dehydration cannot score 1', () => {
  assert.equal(score({ dehydration: '1' }).valid, false);
  assert.equal(score({ dehydration: '2' }).total, 2);
  assert.equal(score({ dehydration: '3' }).total, 3);
});

test('the band edges sit at exactly 7 and exactly 11', () => {
  const six = score({ diarrheaDays: '3', stoolsPerDay: '3' });
  assert.equal(six.total, 6);
  assert.equal(six.severity, 'mild');

  const seven = score({ diarrheaDays: '3', stoolsPerDay: '3', vomitingDays: '1' });
  assert.equal(seven.total, 7);
  assert.equal(seven.severity, 'moderate');

  const ten = score({ diarrheaDays: '3', stoolsPerDay: '3', vomitingDays: '3', vomitsPerDay: '1' });
  assert.equal(ten.total, 10);
  assert.equal(ten.severity, 'moderate');

  const eleven = score({ diarrheaDays: '3', stoolsPerDay: '3', vomitingDays: '3', vomitsPerDay: '2' });
  assert.equal(eleven.total, 11);
  assert.equal(eleven.severity, 'severe');
});

test('a moderate worked example (the META example)', () => {
  const r = score({
    diarrheaDays: '1', stoolsPerDay: '2', vomitingDays: '2', vomitsPerDay: '2',
    temperature: '1', dehydration: '0', treatment: '1',
  });
  assert.equal(r.total, 9);
  assert.equal(r.severity, 'moderate');
  assert.match(r.bandLabel, /Vesikari 9 of 20/);
});

test('the temperature item is labeled as rectal-equivalent', () => {
  const temp = VESIKARI_ITEMS.find((i) => i.key === 'temperature');
  assert.match(temp.text, /rectal-equivalent/);
  assert.match(score().note, /axillary 38\.5 C is not a 2-point fever/);
});

test('the copy separates this from the current-dehydration scales and from the other Vesikari variants', () => {
  const n = score().note;
  assert.match(n, /not a measure of current dehydration/);
  assert.match(n, /Gorelick/);
  assert.match(n, /not the 24-point norovirus modification/);
  assert.match(n, /Schnadower/);
});

test('a missing item is invalid and names it', () => {
  assert.equal(vesikari({}).valid, false);
  const r = vesikari({ diarrheaDays: '1', stoolsPerDay: '1' });
  assert.equal(r.valid, false);
  assert.match(r.message, /Duration of vomiting/);
});

test('an out-of-range score is invalid and explains the two odd items', () => {
  const r = score({ treatment: '3' });
  assert.equal(r.valid, false);
  assert.match(r.message, /dehydration has no 1-point option and treatment stops at 2/);
  assert.equal(score({ temperature: '4' }).valid, false);
});
