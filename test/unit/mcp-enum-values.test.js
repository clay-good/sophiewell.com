// The values an agent is told it may pass, against the values the tool offers.
//
// An MCP field declares `values: [...]`. That list is the whole contract: an
// agent reads it, picks one, and passes it. Nothing checked it against the
// select a human uses, and two of them had drifted apart:
//
//   flamm-vbac/fv-eff    declared low / mid / high, and `flammVbac` keys on
//                        lt25 / mid / gt75. Two of the three documented values
//                        came back "Choose the ... categories".
//   flamm-vbac/fv-vb     omitted `beforeAfter`, worth 4 points -- the most any
//                        item in the score contributes. An agent reading the
//                        list could not express the most favorable history.
//   bars-akathisia       declared 0-5 on three items that are 0-3, while their
//                        own labels said "(0-3)". `barsAkathisia` clamps 4 and
//                        5 to 3 silently, so the caller gets a score built from
//                        a number it did not send.
//
// The select in `views/` is the second opinion. Where it can be read, every
// declared value has to appear in it.
//
// The extractor reads source text and sometimes binds the wrong array to a DOM
// id. That failure looks completely different: a wrong binding shares NO value
// with the registry, where a real drift shares most of them. So a field is
// only checked once the two lists overlap at all -- which is exactly the
// condition under which the select is demonstrably the right one.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';
import { loadOptionLabels } from '../../scripts/lib/option-labels.mjs';

// A value the registry declares and the select does not offer, on purpose.
// Each one is a alias the calculator accepts and the picklist folds into a
// neighbouring option, so an agent passing it gets the right answer.
const ALIASES = new Map([
  // `cauchyFrostbite` maps `normal` and `not-done` to the same grade, and the
  // select offers them as one row, "Not done / normal uptake".
  ['cauchy-frostbite/cf-bone', ['normal']],
]);

test('every value an agent may pass is a value the tool offers', async () => {
  const options = await loadOptionLabels();
  const drift = [];
  let checked = 0;

  for (const calc of allCalculators()) {
    const byDom = options.get(calc.id);
    if (!byDom || !Array.isArray(calc.fields)) continue;
    for (const field of calc.fields) {
      if (field.kind !== 'enum') continue;
      const select = byDom.get(field.dom);
      const declared = (field.values || []).map(String);
      if (!select || declared.length < 2) continue;

      const present = declared.filter((v) => select.has(v));
      if (!present.length) continue; // the extractor bound the wrong array
      checked += 1;

      const allowed = ALIASES.get(`${calc.id}/${field.dom}`) || [];
      const missing = declared.filter((v) => !select.has(v) && !allowed.includes(v));
      if (missing.length) {
        drift.push(
          `${calc.id}/${field.dom}: declares ${missing.join(', ')}, ` +
            `which the select does not offer (it has ${[...select.keys()].filter(Boolean).join(', ')})`,
        );
      }
    }
  }

  // If this drops sharply, the extractor stopped resolving rather than the
  // catalog getting cleaner, and the check above is quietly passing on nothing.
  assert.ok(checked >= 700, `only ${checked} enum fields could be checked against a select, expected 700+`);
  assert.deepEqual(drift, [], `the registry offers an agent a value the tool does not:\n  ${drift.join('\n  ')}`);
});
