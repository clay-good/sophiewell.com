// spec-v1067: the one-blank-field gate.
//
// The two sweeps beside this one clear EVERY field. That is the easy half of
// the question, and it can only ever point at one field per calculator, because
// a tile stops answering as soon as a single guard fires. Three separate waves
// of half-fixed calculators came out of that blind spot (spec-v1063 to
// spec-v1065): carb-insulin-bolus dosed insulin from a blank target glucose for
// weeks after three of its five fields were guarded, and news2 read a blank
// temperature as 0 C for months after its four other vitals were fixed.
//
// So this one starts from the calculator's own worked example -- a complete,
// correct patient -- and clears a SINGLE field. That is the state a reader
// actually reaches: nine values to hand and the tenth still in the analyser.
//
// It only clears fields whose label names a quantity that cannot be zero in a
// living patient, because for those a blank read as 0 is never a value the
// reader could have meant. Counts and amounts are left alone: nought units
// transfused, or no sodium added to a bag, are real answers.
//
// A tile fails when clearing such a field CHANGES the answer and the new answer
// neither asks for the value (ASKING) nor says what it is missing (DISCLOSING).
// Dropping the dependent line entirely also passes, because then the number
// computed from a zero is not on screen at all.
//
// The ledger beside it is keyed `tileId|fieldId`, not by tile: exempting one
// field leaves every other field on that calculator still guarded. Every line
// in it was read and judged one at a time.

import { test, expect } from '@playwright/test';
import { ASKING, DISCLOSING } from '../lib/asking-language.js';
import { ONE_BLANK_FIELD_OK } from './one-blank-field-ledger.js';

const SHARDS = 4;
const SHARD_TIMEOUT_MS = 900_000;

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

for (let shard = 0; shard < SHARDS; shard += 1) {
  test(`no tile recomputes from one cleared measurement (shard ${shard + 1} of ${SHARDS})`, async ({ page }) => {
    test.setTimeout(SHARD_TIMEOUT_MS);
    await page.goto('/');
    const ids = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));
    expect(ids.length).toBeGreaterThan(1500);

    const offenders = [];
    for (let i = shard; i < ids.length; i += SHARDS) {
      const id = ids[i];
      await page.goto(`/#${id}`);
      const found = await page.evaluate(async ({ askSrc, discSrc }) => {
        const ASK = new RegExp(askSrc.source, askSrc.flags);
        const DISC = new RegExp(discSrc.source, discSrc.flags);
        // Quantities that are never zero in a living patient. Counts, amounts
        // and differences are deliberately absent.
        const POS = /\b(age|weight|height|length|pulse|heart rate|respiratory rate|systolic|diastolic|blood pressure|temperature|h(a)?emoglobin|h(a)?ematocrit|platelet|white (blood )?cell|sodium|potassium|chloride|creatinine|albumin|glucose|bilirubin|urea|bun|ph\b|gestation|circumference|body surface|serum osmolality)\b/i;
        const labelFor = (elem) => {
          if (elem.id) {
            const l = document.querySelector(`label[for="${CSS.escape(elem.id)}"]`);
            if (l) return l.textContent || '';
          }
          const w = elem.closest('label');
          return w ? w.textContent || '' : '';
        };
        const read = async () => {
          await new Promise((r) => setTimeout(r, 120));
          const q = document.querySelector('#q-results') || document.querySelector('.screener-result');
          return q ? (q.textContent || '').replace(/\s+/g, ' ') : '';
        };
        const nums = [...document.querySelectorAll('#tool-body input[type=number]')];
        const out = [];
        const base = await read();
        // spec-v1070: every judgment here is "did the answer CHANGE", so a
        // baseline read before the tile finished its first render would make
        // every field on it look like a change -- a false failure caused by
        // load, not by the calculator. If there is no answer to compare
        // against, there is nothing this gate can say about the tile.
        if (!base || base.length <= 12) return out;
        for (const n of nums) {
          const lab = labelFor(n).replace(/\s+/g, ' ').trim();
          if (!POS.test(lab)) continue;
          const orig = n.value;
          if (String(orig).trim() === '') continue;
          n.value = '';
          n.dispatchEvent(new Event('input', { bubbles: true }));
          n.dispatchEvent(new Event('change', { bubbles: true }));
          const after = await read();
          n.value = orig;
          n.dispatchEvent(new Event('input', { bubbles: true }));
          n.dispatchEvent(new Event('change', { bubbles: true }));
          await new Promise((x) => setTimeout(x, 60));
          if (after === base) continue;
          if (!after || after.length <= 12) continue;
          if (ASK.test(after) || DISC.test(after)) continue;
          // Still a number on screen? If every number went away with the field,
          // nothing was computed from a zero.
          if (!/(?:^|[^\d.,])\d+(?:\.\d+)?(?![\d.,]*\s*(?:19|20)\d\d)/.test(after.replace(/\(.*?\)/g, ''))) continue;
          out.push({ field: n.id || lab.slice(0, 40), label: lab.slice(0, 40), after: after.slice(0, 150) });
        }
        return out;
      }, { askSrc: { source: ASKING.source, flags: ASKING.flags.replace('g', '') },
        discSrc: { source: DISCLOSING.source, flags: DISCLOSING.flags.replace('g', '') } });

      for (const f of found) {
        const key = `${id}|${f.field}`;
        if (ONE_BLANK_FIELD_OK.has(key)) continue;
        offenders.push(`${key}  (${f.label})\n    -> ${f.after}`);
      }
    }

    expect(
      offenders,
      `${offenders.length} calculator field(s) changed the answer when cleared, without asking for the\n`
      + 'value or saying it was missing. A blank measurement is not a measurement of zero\n'
      + '(docs/spec-v1063.md). Either guard the field -- refuse, disclose that a monotone total is\n'
      + 'now a floor, or ask for the whole panel -- or, if a zero is genuinely what that field means,\n'
      + 'add the `tileId|fieldId` key to test/integration/one-blank-field-ledger.js with the reason:\n'
      + offenders.join('\n'),
    ).toEqual([]);
  });
}
