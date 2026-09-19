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
  test.setTimeout(1_500_000);
  const rows = candidates().filter((r) => {
    const n = Number(r.ex);
    const b = envelope(r);
    return r.ex !== undefined && String(r.ex).trim() !== '' && Number.isFinite(n) && n >= b.min && n <= b.max;
  });
  expect(rows.length).toBeGreaterThan(600);

  const bad = [];
  let driven = 0;
  let sliders = 0;
  let absent = 0;
  for (const r of rows) {
    // A fresh load per row: returning to the same hash keeps the last row's impossible value.
    await page.goto('/');
    await page.goto(`/#${r.id}`);
    const over = String(envelope(r).max * 10);
    const got = await page.evaluate(async ({ dom, over, unit, example }) => {
      const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
      let f = null;
      for (let i = 0; i < 40 && !f; i++) { f = document.getElementById(dom); if (!f) await wait(50); }
      if (!f) return { absent: true };
      if (f.type === 'range') return { slider: true };
      // Wait for the worked example to have TAKEN, in app.js's sense (valueTook): a select filled by
      // a fetch gets its example value re-applied when the options land, and that re-apply stops as
      // soon as anyone else edits a field -- so editing first would race the page's own restore.
      const took = ([id, v]) => {
        const n = document.getElementById(id);
        if (!n) return false;
        if (n.type === 'checkbox') return true;
        if (n.tagName === 'SELECT' && n.options.length && ![...n.options].some((o) => o.value === String(v))) return true;
        return String(n.value) === String(v);
      };
      let settled = false;
      for (let i = 0; i < 100 && !settled; i++) { settled = Object.entries(example).every(took); if (!settled) await wait(50); }
      if (!settled) return { unsettled: Object.entries(example).filter((e) => !took(e)).map(([id]) => id) };
      const fire = (el) => { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
      const sel = document.getElementById(`${dom}-unit`);
      if (sel && unit) {
        const want = String(unit).toLowerCase().replace(/\s+/g, '');
        const opt = [...sel.options].find((o) => [o.value, o.text].some((s) => String(s).toLowerCase().replace(/\s+/g, '') === want));
        if (opt) { sel.value = opt.value; fire(sel); }
      }
      const read = () => {
        const q = document.querySelector('#q-results') || document.querySelector('.screener-result') || document.querySelector('main');
        return (q ? q.innerText : '').replace(/\s+/g, ' ').trim();
      };
      // The worked example's answer first (some tools fetch a table before they can compute), then
      // the value, then a reading that differs from the example's.
      for (let i = 0; i < 60 && !read(); i++) await wait(50);
      const before = read();
      f.value = over;
      fire(f);
      for (let i = 0; i < 40 && read() === before; i++) await wait(50);
      await wait(100);
      return { text: read() };
    }, { dom: r.dom, over, unit: r.unit, example: META[r.id].example.fields });
    if (got.absent) { absent++; continue; }
    if (got.unsettled) { bad.push(`${r.id}: the worked example never took (${got.unsettled.join(', ')})`); continue; }
    if (got.slider) { sliders++; continue; }
    driven++;
    const leak = LEAK.exec(got.text);
    if (leak) bad.push(`${r.id}|${r.dom} = ${over}: prints "${leak[0].trim()}": ${got.text.slice(0, 120)}`);
    else if (!REFUSED.test(got.text)) bad.push(`${r.id}|${r.dom} = ${over}: not refused: ${got.text.slice(0, 120)}`);
  }
  console.log(`envelope-refused-on-page: ${driven} driven, ${sliders} sliders, ${absent} not on the page, of ${rows.length}`);
  expect(driven).toBeGreaterThan(500);
  expect(bad).toEqual([]);
});
