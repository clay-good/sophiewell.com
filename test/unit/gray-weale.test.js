// spec-v524: the Gray-Weale carotid plaque echogenicity classification.
// Worked-example tests: all four types in dark-to-bright order, the echolucent/echogenic grouping, the two
// things every result must disclaim (it is not a stenosis measurement and not an intervention indication),
// the refusal to attach a stroke rate to a type, roman-numeral aliases, and the guards. Types and reference
// structures transcribed from Gray-Weale and colleagues 1988 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grayWeale, GRAY_WEALE_TYPES } from '../../lib/gray-weale-v524.js';

test('four types, ordered dark to bright', () => {
  assert.deepEqual(GRAY_WEALE_TYPES.map((t) => t.value), ['1', '2', '3', '4']);
  assert.match(GRAY_WEALE_TYPES[0].text, /Uniformly echolucent/);
  assert.match(GRAY_WEALE_TYPES[3].text, /Uniformly echogenic/);
});

test('types 1 and 2 group as echolucent, 3 and 4 as echogenic', () => {
  assert.deepEqual(GRAY_WEALE_TYPES.map((t) => t.group),
    ['echolucent', 'echolucent', 'echogenic', 'echogenic']);
  assert.equal(grayWeale({ type: '1' }).group, 'echolucent');
  assert.equal(grayWeale({ type: '2' }).group, 'echolucent');
  assert.equal(grayWeale({ type: '3' }).group, 'echogenic');
  assert.equal(grayWeale({ type: '4' }).group, 'echogenic');
});

test('type 1 is the uniformly echolucent plaque (the META example)', () => {
  const r = grayWeale({ type: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.type, '1');
  assert.equal(r.group, 'echolucent');
  assert.match(r.bandLabel, /Gray-Weale Type 1 \(echolucent\)/);
  assert.match(r.band, /thin echogenic cap/);
});

test('type 4 names the acoustic shadow that dense calcification casts', () => {
  const r = grayWeale({ type: '4' });
  assert.match(r.band, /acoustic shadow/);
});

test('every type disclaims the stenosis and intervention readings', () => {
  for (const t of GRAY_WEALE_TYPES) {
    const r = grayWeale({ type: t.value });
    assert.match(r.band, /not the degree of stenosis/);
    assert.match(r.band, /not an indication for carotid intervention/);
  }
});

test('the echolucent association is stated at group level with no stroke rate attached', () => {
  const r = grayWeale({ type: '2' });
  assert.match(r.band, /at the group level/);
  assert.match(r.note, /no stroke rate is attached to a type/);
  assert.doesNotMatch(r.note, /\d+ ?(percent|%) (stroke|risk)/);
});

test('the note names why the reading is operator dependent', () => {
  const r = grayWeale({ type: '3' });
  assert.match(r.note, /gain settings/);
  assert.match(r.note, /grayscale-median/);
});

test('roman numerals resolve to the canonical type', () => {
  assert.equal(grayWeale({ type: 'I' }).type, '1');
  assert.equal(grayWeale({ type: 'ii' }).type, '2');
  assert.equal(grayWeale({ type: ' IV ' }).type, '4');
  assert.equal(grayWeale({ type: 3 }).type, '3');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(grayWeale({}).valid, false);
  assert.equal(grayWeale({ type: '' }).valid, false);
  assert.equal(grayWeale({ type: '0' }).valid, false);
  assert.equal(grayWeale({ type: '5' }).valid, false);
  assert.equal(grayWeale({ type: 'V' }).valid, false);
});
