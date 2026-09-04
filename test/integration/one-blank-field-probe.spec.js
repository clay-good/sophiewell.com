// spec-v1063: the ONE-BLANK-FIELD finder. A probe, not a gate -- it prints what
// it found and asserts nothing, and playwright.config.js keeps *-probe.spec.js
// out of the CI run.
//
// The two catalog sweeps beside it clear EVERY field, which is a state a reader
// rarely reaches: the tile is visibly unfed and its refusal is easy to write.
// This one starts from the tile's own example -- a complete, correct patient --
// and clears a SINGLE field, which is what actually happens at the bedside when
// nine values are to hand and the tenth is not.
//
// It only clears fields whose label names a quantity that cannot be zero in a
// living patient (an age, a heart rate, a haemoglobin), because for those a
// blank read as 0 is never a value the reader could have meant. Counts and
// amounts are left alone: nought units transfused, or no sodium added to the
// bag, are real answers.
//
// A hit is a field where clearing it CHANGED the answer. That is deliberately
// wider than "is a bug": a tile that responds by dropping the dependent line, or
// by saying which measurement is missing, is behaving correctly and still shows
// up here. Read the WAS/NOW pair and judge. What the run should never contain is
// a tile that quietly recomputes from the zero.
//
//   npx playwright test test/integration/one-blank-field-probe.spec.js --project=chromium
//
// The first run found 84 field/tile pairs, 81 of which moved the answer. The
// eleven tiles fixed in spec-v1063 came out of that list, worst first.
import { test, expect } from '@playwright/test';
import { ASKING } from '../lib/asking-language.js';

const SHARDS = 4;
test.skip(({ browserName }) => browserName !== 'chromium', 'chromium-only');

for (let shard = 0; shard < SHARDS; shard += 1) {
  test(`probe impossible-zero (shard ${shard + 1})`, async ({ page }) => {
    test.setTimeout(1_800_000);
    await page.goto('/');
    const ids = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));
    const hits = [];
    for (let i = shard; i < ids.length; i += SHARDS) {
      const id = ids[i];
      await page.goto(`/#${id}`);
      const found = await page.evaluate(async (askSrc) => {
        const ASK = new RegExp(askSrc.source, askSrc.flags);
        const POS = /\b(age|weight|height|length|pulse|heart rate|respiratory rate|systolic|diastolic|blood pressure|temperature|h(a)?emoglobin|h(a)?ematocrit|platelet|white (blood )?cell|sodium|potassium|chloride|creatinine|albumin|glucose|bilirubin|urea|bun|ph\b|gestation|circumference|body surface|serum osmolality)\b/i;
        const labelFor = (el) => {
          if (el.id) {
            const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
            if (l) return l.textContent || '';
          }
          const w = el.closest('label');
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
        for (const n of nums) {
          const lab = labelFor(n).replace(/\s+/g, ' ').trim();
          if (!POS.test(lab)) continue;
          const orig = n.value;
          if (String(orig).trim() === '') continue;
          n.value = '';
          n.dispatchEvent(new Event('input', { bubbles: true }));
          n.dispatchEvent(new Event('change', { bubbles: true }));
          const r = await read();
          n.value = orig;
          n.dispatchEvent(new Event('input', { bubbles: true }));
          n.dispatchEvent(new Event('change', { bubbles: true }));
          await new Promise((x) => setTimeout(x, 60));
          if (!r || r.length <= 12) continue;
          if (ASK.test(r)) continue;
          if (!/(?:^|[^\d.,])\d+(?:\.\d+)?(?![\d.,]*\s*(?:19|20)\d\d)/.test(r.replace(/\(.*?\)/g, ''))) continue;
          if (r === base) continue;
          out.push(`${lab.slice(0, 40)} :: WAS ${base.slice(0, 900)} :: NOW ${r.slice(0, 900)}`);
        }
        return out;
      }, { source: ASKING.source, flags: ASKING.flags.replace('g', '') });
      for (const f of found) hits.push(`${id} | ${f}`);
    }
    console.log(`PROBEHITS shard${shard} n=${hits.length}\n` + hits.join('\n'));
    expect(true).toBe(true);
  });
}
