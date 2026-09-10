// Probe (not a gate): spec-v1208 -- one field, two sentences, two ranges.
//
// spec-v1207 guarded `refeeding-risk` against an impossible BMI, and the page
// then said this, in two live regions stacked above the answer:
//
//   Check the highlighted value: BMI (kg/m^2) is 9999, outside the 5 to 80
//     this field accepts.
//   Input above the plausible range for body mass index (5 to 200 kg/m^2);
//     verify the units.
//
// Both sentences are correct about their own source and they disagree about the
// field. The browser's warning reads the input's `min`/`max` attributes, which a
// view module writes by hand; the second reads `lib/bounds.js`. Two copies of one
// rule, which is the drift this repo keeps finding (spec-v1198 settled which one
// wins: a view's ceilings ARE lib/bounds.js's).
//
// The check needs no label-to-envelope mapping, which is the hard and error-prone
// part of `scripts/probe-envelope-unbounded.mjs`. It does not have to decide which
// quantity a field holds -- when both sentences fire, THE PAGE ITSELF has already
// declared they are about the same field. It only has to read the two ranges and
// compare them.
//
// A row is a defect, not a suspect: there is no reading under which one field
// having two published ranges is right.
//
// Reported, never asserted -- run it by name:
//
//   RUN_PROBES=1 npx playwright test test/integration/two-ranges-one-field.spec.js --project=chromium
import { test } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

// "outside the 5 to 80 this field accepts" -- the attribute range.
const ATTR_RANGE = /outside the (-?[\d.]+) to (-?[\d.]+) this field accepts/;
// "the plausible range for body mass index (5 to 200 kg/m^2)" -- the envelope.
const ENVELOPE_RANGE = /plausible range for [^(]*\((-?[\d.]+) to (-?[\d.]+)/;

test('no field publishes two different ranges', async ({ page }) => {
  test.setTimeout(1_800_000);
  await page.goto('/');
  const all = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));
  // Scoping exists so the probe can be negative-tested against a known clash
  // without a 1,700-tile run: PROBE_TILES=refeeding-risk,saps-ii
  const only = (process.env.PROBE_TILES || '').split(',').map((s) => s.trim()).filter(Boolean);
  const ids = only.length ? all.filter((id) => only.includes(id)) : all;

  const clashes = [];
  let tilesWithMax = 0;
  let fieldsDriven = 0;
  let bothSpoke = 0;

  for (const id of ids) {
    await page.goto(`/#${id}`);
    await page.waitForTimeout(40);
    const targets = await page.evaluate(() => [...document.querySelectorAll('#tool-body input[type=number]')]
      .filter((n) => n.hasAttribute('max'))
      .map((n) => ({ fid: n.id, max: Number(n.getAttribute('max')) }))
      .filter((t) => t.fid && Number.isFinite(t.max)));
    if (!targets.length) continue;
    tilesWithMax += 1;

    for (const t of targets) {
      fieldsDriven += 1;
      // The tile opens with its worked example applied, so every OTHER field
      // already holds a value -- which matters, because the envelope check runs
      // after the missing-value branch and a half-empty form never reaches it.
      const seen = await page.evaluate(async ({ fid, max }) => {
        const e = document.getElementById(fid);
        const before = e.value;
        e.value = String(Math.max(Math.abs(max) * 10, 10) + 7);
        e.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 40));
        const w = document.querySelector('.range-warning');
        const res = document.querySelector('#q-results');
        const out = {
          attr: w ? (w.textContent || '').replace(/\s+/g, ' ') : '',
          body: res ? (res.textContent || '').replace(/\s+/g, ' ') : '',
        };
        e.value = before;
        e.dispatchEvent(new Event('input', { bubbles: true }));
        return out;
      }, t);

      const a = ATTR_RANGE.exec(seen.attr);
      const b = ENVELOPE_RANGE.exec(seen.body);
      if (!a || !b) continue;
      bothSpoke += 1;
      if (a[1] !== b[1] || a[2] !== b[2]) {
        clashes.push(`${id} / ${t.fid}: field says ${a[1]}-${a[2]}, envelope says ${b[1]}-${b[2]}`);
      }
    }
  }

  // The reach is the point (spec-v1202): a clean report is a claim about how
  // much of the catalog could have been asked, not about the catalog.
  console.log(`tiles swept: ${ids.length} of ${all.length}; tiles with a numeric field declaring a max: ${tilesWithMax}`);
  console.log(`fields driven past their max: ${fieldsDriven}`);
  console.log(`fields where BOTH the attribute warning and an envelope spoke: ${bothSpoke}`);
  console.log(`fields publishing two different ranges: ${clashes.length}`);
  for (const line of clashes) console.log(`  ${line}`);
});
