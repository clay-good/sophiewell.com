// spec-v1752: an oxygen saturation cannot exceed 100%, and the envelope map no longer hides saturation fields
// (its `ratio` term matched inside "saturation") or room-air SpO2 (its `air`/`room` terms).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { computeCalculator } from '../../mcp/tools.js';
import { EXCLUDE } from '../../scripts/lib/envelope-map.mjs';

test('the exclusion lets saturations and room-air SpO2 through, and still drops ratios and air temperature', () => {
  for (const ok of ['Oxygen saturation %', 'SpO2 on room air (%)']) assert.equal(EXCLUDE.test(ok), false, ok);
  for (const no of ['P/F ratio', 'Air temperature', 'Room temperature']) assert.equal(EXCLUDE.test(no), true, no);
});

// [tool, dom, impossible, real]
const ROWS = [
  ['fullpiers', 'fp-spo2', '150', '100'], ['isaric-4c-mortality', 'is4c-spo2', '150', '100'],
  ['panc3', 'panc3-hct', '750', '60'], ['ecmo-titration', 'ec-hb', '250', '20'], ['ecmo-titration', 'ec-pco', '2000', '120'],
];
for (const [id, dom, bad, real] of ROWS) {
  test(`${id} ${dom}: ${bad} is refused, ${real} answers`, () => {
    const ex = { ...META[id].example.fields };
    assert.notEqual(computeCalculator({ id, inputs: ex }).valid, false, 'example answers');
    assert.equal(computeCalculator({ id, inputs: { ...ex, [dom]: bad } }).valid, false);
    assert.notEqual(computeCalculator({ id, inputs: { ...ex, [dom]: real } }).valid, false);
  });
}
