// spec-v1071: a calculator that refuses must take its working with it.
//
// 121 calculators ship a live "show your work" panel that re-fills whenever the
// inputs change. Separately, the blank-field waves (spec-v1063 onward) taught a
// growing number of them to REFUSE when a measurement they need is missing.
//
// Those two features met badly. The refusal path is an early `return`, and it
// returned before the call that re-fills the panel -- so the answer read "Enter
// an age to calculate" while the panel underneath went on displaying the last
// complete calculation. `cockcroft-gault` printed "Enter an age to calculate"
// above "CrCl = (140 - 60) x 80 kg / (72 x 1 mg/dL) = 88.89 mL/min", still
// showing the age that had just been cleared and the number the guard existed to
// withhold. Ten calculators did this; six of them long before those waves.
//
// This gate clears one filled number field on every tile that has a steps panel
// and fails if the tile refuses in its answer while its panel still shows the
// working it showed before.

import { test, expect } from '@playwright/test';
import { ASKING } from '../lib/asking-language.js';

// The one calculator that legitimately asks and answers at the same time.
// Keyed `tileId|fieldId` like the one-blank-field ledger beside it, so
// exempting this field leaves every other field on the tile guarded.
const ANSWERS_AND_ASKS = new Set([
  // Centor scores four criteria on its own and then asks for an age only to add
  // the McIsaac modifier. Clearing the age leaves a real Centor score on screen
  // ("Centor: 4 - High (~56%)") beside the prompt, and the working shown is that
  // score's working, which is correct and must not be cleared.
  'centor|ce-age',
]);

const SHARDS = 2;
const SHARD_TIMEOUT_MS = 900_000;

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

for (let shard = 0; shard < SHARDS; shard += 1) {
  test(`a refusing calculator clears its working (shard ${shard + 1} of ${SHARDS})`, async ({ page }) => {
    test.setTimeout(SHARD_TIMEOUT_MS);
    await page.goto('/');
    const ids = await page.evaluate(async () => {
      const { META } = await import('/lib/meta.js');
      return Object.keys(META).filter((id) => {
        const d = META[id] && META[id].derivation;
        if (!d) return false;
        return (Array.isArray(d.components) && d.components.length > 0) || typeof d.substituted === 'function';
      });
    });
    expect(ids.length).toBeGreaterThan(50);

    const offenders = [];
    for (let i = shard; i < ids.length; i += SHARDS) {
      const id = ids[i];
      await page.goto(`/#${id}`);
      const r = await page.evaluate(async () => {
        const read = async () => {
          await new Promise((x) => setTimeout(x, 140));
          return {
            answer: (document.querySelector('#q-results')?.textContent || '').replace(/\s+/g, ' '),
            steps: (document.querySelector('[data-derivation-steps]')?.textContent || '').replace(/\s+/g, ' '),
          };
        };
        const before = await read();
        if (!before.steps) return null;
        const n = [...document.querySelectorAll('#tool-body input[type=number]')]
          .find((x) => String(x.value).trim() !== '');
        if (!n) return null;
        const field = n.id || '(unnamed)';
        n.value = '';
        n.dispatchEvent(new Event('input', { bubbles: true }));
        n.dispatchEvent(new Event('change', { bubbles: true }));
        const after = await read();
        return { field, before, after };
      });
      if (!r) continue;
      // spec-v1071: free of charge, since this sweep already clears a field on
      // every tile with a steps panel and reads the answer. A JavaScript runtime
      // error must never reach the live region: safe() catches exceptions and
      // prints err.message AS THE ANSWER, so a renderer that reads a property of
      // a result the library withheld shows the reader "Cannot read properties
      // of undefined (reading 'sbp')" under the prompt. That is exactly what
      // mews and news2 did.
      // "is not defined" is deliberately NOT in this list. It is how a
      // ReferenceError reads, but it is also ordinary English: rope-score
      // refuses with "The score is not defined without it, and age supplies up
      // to 5 of its 10 points", which a sweep using that phrase flags as a
      // crash. eslint's no-undef (spec-v1067) catches undefined identifiers
      // statically anyway. The three left are unambiguous V8 runtime errors.
      if (/Cannot read propert|is not a function|undefined is not/.test(r.after.answer)) {
        offenders.push(`${id}|${r.field}  A JAVASCRIPT ERROR REACHED THE ANSWER\n    ${r.after.answer.slice(0, 120)}`);
        continue;
      }
      // Only tiles that actually refuse are in scope. A tile that still answers
      // is the one-blank-field gate's business, not this one.
      if (!ASKING.test(r.after.answer)) continue;
      if (r.after.steps !== r.before.steps) continue;
      if (ANSWERS_AND_ASKS.has(`${id}|${r.field}`)) continue;
      offenders.push(`${id}|${r.field}\n    answer: ${r.after.answer.slice(0, 80)}\n    working: ${r.after.steps.slice(0, 110)}`);
    }

    expect(
      offenders,
      `${offenders.length} calculator(s) refused in the answer while the "show your work" panel below\n`
      + 'still displayed the calculation it showed before the field was cleared -- including, in the\n'
      + 'original ten, the very number the refusal was withholding. On the refusal path, call\n'
      + 'clearDerivationSteps(deriv) before returning (docs/spec-v1071.md):\n'
      + offenders.join('\n'),
    ).toEqual([]);
  });
}
