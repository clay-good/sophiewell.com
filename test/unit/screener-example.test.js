// The five screener tiles carry their worked example twice: once in
// lib/meta.js, which is what the /tools/<id>/ page prints and what the MCP
// adapter answers with, and once in the instrument config in
// lib/scoring-v4.js, which is what the radio buttons are actually set to.
//
// They drifted. CAGE's page said "Score 2 of 4 = Positive." while the tile
// opened with every item answered No, scoring 0 -- so the page stated a result
// the tool did not produce, and the example demonstrated nothing.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S4 from '../../lib/scoring-v4.js';
import { META } from '../../lib/meta.js';
import { scoreScreener, bandFor } from '../../lib/screener.js';

const SCREENERS = [
  ['phq9', S4.PHQ9_CONFIG],
  ['gad7', S4.GAD7_CONFIG],
  ['auditc', S4.AUDITC_CONFIG],
  ['cage', S4.CAGE_CONFIG],
  ['epds', S4.EPDS_CONFIG],
];

for (const [id, config] of SCREENERS) {
  test(`${id}: the page's example answers are the ones the tile fills in`, () => {
    const documented = Object.values(META[id].example.fields).map(Number);
    assert.deepEqual(config.exampleAnswers, documented);
  });

  test(`${id}: the documented result is the one those answers score`, () => {
    const score = scoreScreener(config.items, config.exampleAnswers);
    const band = bandFor(config.severityBands, score);
    const expected = META[id].example.expected;
    assert.match(expected, new RegExp(`\\b${score}\\b`), `${expected} does not state the score ${score}`);
    assert.ok(band, `no band for ${score}`);
    // The page states the reading in its own words ("Positive", "Mild
    // depression"); it has to name the band's first word at least.
    const word = band.label.split(/[\s:(]/)[0];
    assert.match(expected.toLowerCase(), new RegExp(word.toLowerCase()), `${expected} does not read as "${band.label}"`);
  });
}
