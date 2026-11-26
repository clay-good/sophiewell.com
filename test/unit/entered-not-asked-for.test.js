// spec-v1806: a value the reader ENTERED is not answered with "Enter it".
//
// The local `pos`/`nonneg`/`item010` helpers in these libraries return null below their floor or above
// their ceiling -- the SAME null a blank field gives -- so a count typed as 999999 or a lab typed as
// -999999 fell into the missing-value branch and the reader was told to enter a value they had just
// entered. Nothing said what was wrong with it. `scripts/probe-entered-asked-for.mjs` found them, and
// spec-v1722 and spec-v1723 fixed the first waves.
//
// The fix is the range check first, so the refusal NAMES the quantity and its edges. One case per shape
// below; the finder holds the rest of the catalog.
import test from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { computeCalculator } from '../../mcp/tools.js';

// [tool, field, an impossible value, a word the refusal must now contain]
const CASES = [
  ['basfi', 'basfi-i1', '999999', /item 1/i],
  ['basdai', 'basdai-q1', '999999', /fatigue/i],
  ['hiscr', 'hs-bab', '999999', /baseline abscess count/i],
  ['vacs-index', 'vacs-cd4', '-999999', /CD4 count/i],
  ['isaric-4c-mortality', 'is4c-com', '-999999', /comorbidities/i],
  ['forns-index', 'fo-ggt', '-999999', /ggt/i],
  ['gahs', 'ga-urea', '-999999', /urea/i],
  ['homa-ir', 'hir-insulin', '-999999', /insulin/i],
  ['gelf-criteria', 'gelf-hgb', '-999999', /hemoglobin/i],
];

for (const [id, dom, bad, names] of CASES) {
  test(`${id}: an entered ${bad} is refused by range, not asked for again`, () => {
    const ex = META[id].example.fields;
    assert.equal(computeCalculator({ id, inputs: ex }).valid, true, 'the worked example still computes');
    const r = computeCalculator({ id, inputs: { ...ex, [dom]: bad } });
    assert.equal(r.valid, false, `${bad} should be refused`);
    const said = String(r.message || (r.result && r.result.band) || '');
    // It names the quantity...
    assert.match(said, names, said);
    // ...and says the value is out of range rather than asking for one.
    assert.match(said, /must be|out of range|plausible range/i, said);
    // And it is NOT the sentence a blank field gets, which is the whole defect.
    const blank = { ...ex }; delete blank[dom];
    const blankSaid = String((() => { const b = computeCalculator({ id, inputs: blank }); return b.message || (b.result && b.result.band) || ''; })());
    assert.notEqual(said, blankSaid, 'an entered value must not get the blank-field sentence');
  });
}
