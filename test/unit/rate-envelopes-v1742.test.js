// spec-v1742: heart-rate and respiratory-rate fields the envelope map could not see (its `rate` exclusion
// hid them). Each answered a rate ten times past lib/bounds.js's envelope; each refuses now, and a high but
// real rate still answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { computeCalculator } from '../../mcp/tools.js';
import { EXCLUDE } from '../../scripts/lib/envelope-map.mjs';

test('the exclusion lets vital-sign rates through and still drops infusion and flow rates', () => {
  for (const ok of ['Heart rate (beats/min)', 'Respiratory rate (breaths/min)', 'Erythrocyte sedimentation rate']) assert.equal(EXCLUDE.test(ok), false, ok);
  for (const no of ['Infusion rate (mL/h)', 'Flow rate (L/min)', 'Dose rate']) assert.equal(EXCLUDE.test(no), true, no);
});

// [tool, dom, impossible, high but real]
const ROWS = [
  ['smart-cop', 'sc-rr', '800', '60'], ['isaric-4c-mortality', 'is4c-rr', '800', '60'], ['rox', 'rx-rr', '800', '60'],
  ['fgsi', 'fgsi-rr', '800', '60'], ['fgsi', 'fgsi-hr', '3000', '220'],
  ['geneva-original', 'gv-hr', '3000', '220'], ['reveal-lite-2', 'rv-hr', '3000', '220'], ['tash-score', 'ta-hr', '3000', '220'],
  ['rabt-score', 'ra-hr', '3000', '220'], ['alt-70', 'al-hr', '3000', '220'], ['shock-index', 'si-hr', '3000', '220'],
  ['wells-pe-geneva', 'gv-hr', '3000', '220'], ['nichd-fhr', 'nf-baseline', '3000', '220'], ['simplified-revised-geneva', 'sg-hr', '3000', '220'],
];
for (const [id, dom, bad, real] of ROWS) {
  test(`${id} ${dom}: ${bad} is refused, ${real} answers`, () => {
    const ex = { ...META[id].example.fields };
    assert.notEqual(computeCalculator({ id, inputs: ex }).valid, false, 'example answers');
    assert.equal(computeCalculator({ id, inputs: { ...ex, [dom]: bad } }).valid, false);
    assert.notEqual(computeCalculator({ id, inputs: { ...ex, [dom]: real } }).valid, false);
  });
}
