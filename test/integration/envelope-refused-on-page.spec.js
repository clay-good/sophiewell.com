// spec-v1407: the page refuses what the agent surface refuses.
//
// scripts/probe-envelope-unbounded.mjs drives every field mapped to a lib/bounds.js envelope to
// ten times its ceiling through compute_calculator, and test/unit/probe-envelope-unbounded.test.js
// holds that surface at zero. The page is a different renderer. When spec-v1406 fixed 97 library
// functions, a hand-run browser sweep found seven the fixes did not reach on the page: headings
// built from the refusal's nulls ("PECARN risk tier: null", "PESI null - Class null") and a view
// helper that printed "Complete the remaining fields" instead of the library's sentence.
//
// This is that sweep, kept. Each mapped field that has a worked example is loaded with the example
// applied, its unit select (if any) set to the field's canonical unit, and driven to ten times its
// ceiling. The page must say why it refused, name a range, and print no null or undefined.
//
// spec-v1410: one page load per TOOL, not per field. The per-field version loaded the page twice
// for every one of 664 fields and took 25 minutes on a CI runner sharing itself with the other
// catalog sweeps -- over its cap on one run and under it on the next, which is a gate that fails by
// duration rather than by defect. Fields of the same tool are now driven in one load, each restored
// to its example value before the next is driven, so every field is read from the page the reader
// would be looking at.
//
// A range slider cannot hold a value past its own max, so the browser clamps it and there is
// nothing to refuse; those fields are counted and skipped.
import { test, expect } from '@playwright/test';
import { candidates, envelope } from '../../scripts/lib/envelope-map.mjs';
import { META } from '../../lib/meta.js';

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

// The catalog's refusals, in the words they use: the shared envelope sentence, gradeFault's, and
// each older tool's own ("PCE valid for ages 40-79 only", "core temp C must be 0-38", "above ~7,
// beyond recorded extremes", "Enter a serum sodium between 80 and 200 mmol/L").
const REFUSED = /plausible range|beyond (?:a plausible|recorded)|outside (?:that|the) range|valid for ages|must be (?:a number|between|greater|at least|no more|[\d.]+\s*(?:-|to)\s*[\d.]+)|between -?[\d.]+ and -?[\d.]+|no more than|Check the value/i;
const LEAK = /(?:^|[^A-Za-z])(?:null|undefined|NaN|-?Infinity)(?![A-Za-z])/;

test('a value past its envelope is refused on the page, with a range and no null', async ({ page }) => {
  test.setTimeout(2_400_000);
  const rows = candidates().filter((r) => {
    const n = Number(r.ex);
    const b = envelope(r);
    return r.ex !== undefined && String(r.ex).trim() !== '' && Number.isFinite(n) && n >= b.min && n <= b.max;
  });
  expect(rows.length).toBeGreaterThan(600);

  const byTool = new Map();
  for (const r of rows) {
    if (!byTool.has(r.id)) byTool.set(r.id, []);
    byTool.get(r.id).push({ dom: r.dom, unit: r.unit, over: String(envelope(r).max * 10) });
  }

  const bad = [];
  let driven = 0;
  let sliders = 0;
  let absent = 0;
  for (const [id, fields] of byTool) {
    await page.goto(`/#${id}`);
    const got = await page.evaluate(async ({ fields, example }) => {
      const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
      const fire = (el) => { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
      const read = () => {
        const q = document.querySelector('#q-results') || document.querySelector('.screener-result') || document.querySelector('main');
        return (q ? q.innerText : '').replace(/\s+/g, ' ').trim();
      };
      // Wait for the worked example to have TAKEN, in app.js's sense (valueTook): a select filled by
      // a fetch gets its example value re-applied when the options land, and that re-apply stops as
      // soon as anyone else edits a field -- so editing first would race the page's own restore.
      const took = ([fid, v]) => {
        const n = document.getElementById(fid);
        if (!n) return false;
        if (n.type === 'checkbox') return true;
        if (n.tagName === 'SELECT' && n.options.length && ![...n.options].some((o) => o.value === String(v))) return true;
        return String(n.value) === String(v);
      };
      let settled = false;
      for (let i = 0; i < 100 && !settled; i++) { settled = Object.entries(example).every(took); if (!settled) await wait(50); }
      if (!settled) return { unsettled: Object.entries(example).filter((e) => !took(e)).map(([fid]) => fid) };
      // And for its answer: some tools fetch a table before they can compute anything.
      for (let i = 0; i < 60 && !read(); i++) await wait(50);

      const out = [];
      for (const { dom, unit, over } of fields) {
        const f = document.getElementById(dom);
        if (!f) { out.push({ dom, absent: true }); continue; }
        if (f.type === 'range') { out.push({ dom, slider: true }); continue; }
        const sel = document.getElementById(`${dom}-unit`);
        const unitWas = sel ? sel.value : null;
        if (sel && unit) {
          const want = String(unit).toLowerCase().replace(/\s+/g, '');
          const opt = [...sel.options].find((o) => [o.value, o.text].some((s) => String(s).toLowerCase().replace(/\s+/g, '') === want));
          if (opt) { sel.value = opt.value; fire(sel); }
        }
        const was = f.value;
        const before = read();
        f.value = over;
        fire(f);
        for (let i = 0; i < 40 && read() === before; i++) await wait(50);
        await wait(100);
        out.push({ dom, over, text: read() });
        // Put the example back, so the next field of this tool is driven from the reader's page
        // rather than from the last refusal.
        f.value = was;
        fire(f);
        if (sel && unitWas !== null && sel.value !== unitWas) { sel.value = unitWas; fire(sel); }
        for (let i = 0; i < 40 && read() !== before; i++) await wait(50);
      }
      return { out };
    }, { fields, example: META[id].example.fields });

    if (got.unsettled) { bad.push(`${id}: the worked example never took (${got.unsettled.join(', ')})`); continue; }
    for (const row of got.out) {
      if (row.absent) { absent++; continue; }
      if (row.slider) { sliders++; continue; }
      driven++;
      const leak = LEAK.exec(row.text);
      if (leak) bad.push(`${id}|${row.dom} = ${row.over}: prints "${leak[0].trim()}": ${row.text.slice(0, 120)}`);
      else if (!REFUSED.test(row.text)) bad.push(`${id}|${row.dom} = ${row.over}: not refused: ${row.text.slice(0, 120)}`);
    }
  }
  console.log(`envelope-refused-on-page: ${driven} driven, ${sliders} sliders, ${absent} not on the page,`
    + ` of ${rows.length} field(s) across ${byTool.size} tool(s)`);
  expect(driven).toBeGreaterThan(500);
  expect(bad).toEqual([]);
});
