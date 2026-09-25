// spec-v1482: Cairo classification of gingival recession (Cairo et al 2011).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { cairoRecession as cr } from '../../lib/cairo-recession-v1482.js';

test('the worked example and each type', () => {
  assert.equal(cr({ buccalCal: '3', interproximalCal: '2' }).band, 'Cairo RT2: interproximal attachment loss (2 mm) no greater than the buccal loss (3 mm).');
  assert.equal(cr({ buccalCal: 3, interproximalCal: 0 }).type, 'RT1');
  assert.equal(cr({ buccalCal: 3, interproximalCal: 3 }).type, 'RT2');
  assert.equal(cr({ buccalCal: 3, interproximalCal: 3.5 }).type, 'RT3');
});

test('blanks and impossible values are asked for', () => {
  for (const r of [cr({}), cr({ buccalCal: 3 }), cr({ buccalCal: 0, interproximalCal: 0 }), cr({ buccalCal: 3, interproximalCal: -1 })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});
