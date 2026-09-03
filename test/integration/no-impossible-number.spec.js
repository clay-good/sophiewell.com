// The page never states a number that does not exist.
//
// `fmt()` in lib/num.js prints "--" for a non-finite result, and
// scripts/check-output-safety.mjs bans the pattern that leaks a literal
// `undefined`. Neither covers a renderer that interpolates a raw number: on 81
// tiles a large enough input reached the page intact and the tile read it out
// with full confidence --
//
//   "Cardiac power output Infinity W: above the 0.6 W cardiogenic-shock
//    threshold (Fincke 2004)."
//
// The MCP surface already refuses these (computeCalculator's firstNonFinite
// guard, held by test/mcp/mcp-fuzz.test.js). This is the same guard on the
// browser, and the same sweep: drive every tile's number fields to the values
// that historically overflow and assert nothing impossible is stated.
import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

// Float64-saturating, negative (logs and roots), and zero (division).
const EDGES = ['1e308', '-1', '0'];
const NON_FINITE = /(?:^|[^A-Za-z])(?:NaN|-?Infinity)(?![A-Za-z])/;

test('no tile states NaN or Infinity, whatever the numbers are', async ({ page }) => {
  test.setTimeout(900_000);
  await page.goto('/');
  const ids = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));
  expect(ids.length).toBeGreaterThan(1500);

  const leaking = [];
  for (const id of ids) {
    await page.goto(`/#${id}`);
    const hits = await page.evaluate(async (edges) => {
      const bad = [];
      const nums = [...document.querySelectorAll('#tool-body input[type=number]')];
      if (!nums.length) return bad;
      const read = () => {
        const q = document.querySelector('#q-results') || document.querySelector('.screener-result');
        return q ? (q.textContent || '').replace(/\s+/g, ' ') : '';
      };
      for (const v of edges) {
        for (const n of nums) {
          n.value = v;
          n.dispatchEvent(new Event('input', { bubbles: true }));
          n.dispatchEvent(new Event('change', { bubbles: true }));
        }
        await new Promise((r) => setTimeout(r, 30));
        bad.push([v, read()]);
      }
      return bad;
    }, EDGES);
    for (const [v, text] of hits) {
      if (NON_FINITE.test(text)) { leaking.push(`${id} at ${v}: ${text.slice(0, 80)}`); break; }
    }
  }

  expect(leaking, `${leaking.length} tiles state a number that does not exist`).toEqual([]);
});

// spec-v1012: the gate's own first line is "The page never states a number that
// does not exist" -- and it passed while 87 of 1704 tiles read 1e+308 out loud,
// because 1e+308 is a number that exists. "BMI: 2.2857142857142856e+70 kg/m^2
// (Obesity class III)" and "Creatinine clearance: -6.805555555555556e+129 mL/min"
// are not numbers a nurse can act on either.
//
// A `type=number` input accepts scientific notation, so this is not an exotic
// case: a reader who types "7e" in front of an existing 70 has entered 7 x 10^70
// and nothing about the box looks wrong.
//
// The assertion is not "never print an exponent" -- a tile that echoes back what
// was typed is being honest. It is that the page must not print one SILENTLY: if
// an exponent reaches the answer, the implausible-value warning has to be on
// screen saying where it came from.
test('an exponent in the answer never appears without the warning', async ({ page }) => {
  test.setTimeout(1_800_000);
  await page.goto('/');
  const ids = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));
  expect(ids.length).toBeGreaterThan(1500);

  const silent = [];
  for (const id of ids) {
    await page.goto(`/#${id}`);
    const hit = await page.evaluate(async () => {
      const nums = [...document.querySelectorAll('#tool-body input[type=number]')];
      if (!nums.length) return null;
      for (const n of nums) {
        n.value = '1e308';
        n.dispatchEvent(new Event('input', { bubbles: true }));
        n.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await new Promise((r) => setTimeout(r, 30));
      const q = document.querySelector('#q-results') || document.querySelector('.screener-result');
      const text = q ? (q.textContent || '').replace(/\s+/g, ' ') : '';
      return { text, warned: !!document.querySelector('.range-warning') };
    });
    if (!hit) continue;
    if (/\d[eE][+-]\d/.test(hit.text) && !hit.warned) silent.push(`${id}: ${hit.text.slice(0, 80)}`);
  }

  expect(silent, `${silent.length} tiles print an exponent with nothing saying why`).toEqual([]);
});

// The refusal is not a dead end: fixing the value brings the answer back.
test('a tile recovers once the value is back in range', async ({ page }) => {
  await page.goto('/#cardiac-power-output', { waitUntil: 'load' });
  const read = () => page.evaluate(() => document.querySelector('#q-results').textContent.replace(/\s+/g, ' ').trim());
  const set = (v) => page.evaluate((value) => {
    const n = document.querySelector('#tool-body input[type=number]');
    n.value = value;
    n.dispatchEvent(new Event('input', { bubbles: true }));
    n.dispatchEvent(new Event('change', { bubbles: true }));
  }, v);

  const before = await read();
  expect(before).toContain('Cardiac power output');

  await set('1e308');
  expect(await read()).toContain('too large or too small');

  await set('80');
  expect(await read()).toContain('Cardiac power output');
});
