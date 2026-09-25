// spec-v1490: the Hamp furcation degree.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { hampFurcation as hf } from '../../lib/hamp-furcation-v1490.js';

test('the worked example: 4 mm without through-and-through loss is degree II', () => {
  assert.equal(hf({ through: 'no', horizontal: '4' }).band, 'Hamp degree II: horizontal loss of support of 4 mm, more than 3 mm, without through-and-through destruction.');
});

test('each degree, and the 3 mm boundary where the sources disagree', () => {
  assert.equal(hf({ through: 'yes' }).bandLabel, 'Degree III');
  assert.equal(hf({ through: 'no', horizontal: '0' }).abnormal, false);
  assert.equal(hf({ through: 'no', horizontal: '2.5' }).bandLabel, 'Degree I');
  assert.equal(hf({ through: 'no', horizontal: '3' }).bandLabel, 'Degree I or II (3 mm boundary)');
  assert.equal(hf({ through: 'no', horizontal: '3.5' }).bandLabel, 'Degree II');
});

test('a blank that decides the degree is asked for, and impossible depths are refused', () => {
  for (const r of [hf({}), hf({ through: 'no' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
  assert.equal(hf({ through: 'no', horizontal: '40' }).valid, false);
});
