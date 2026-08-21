// spec-v772: every tool in the catalog is wired for the search bar.
//
// The catalog is the product. A tile nobody can find, or that opens to nothing,
// is not shipped -- it is just present. This walks all 1564 and holds each to
// what a reader actually needs:
//
//   1. typing its name puts it first,
//   2. opening it renders a tool body,
//   3. that body has something to fill in,
//   4. nothing throws while doing any of it.
//
// The MCP half of the same question is pinned separately, by
// test/mcp/mcp-find-by-name.test.js (reachable by name) and check-mcp-catalog
// (exposed, schema, example round-trips) -- and the two surfaces are held to the
// SAME name rule, `namesInFull` in lib/name-match.js, because they disagreed:
// find_calculator returned ckd-staging for "KDIGO CKD Staging" while the search
// bar returned kdigo-aki.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Names whose distinctive part is a SINGLE token, shared with siblings, so the
// two-word guard declines to promote them -- deliberately: one word promoting is
// what put Therapy Units over CHA2DS2-VASc. Both still come back at rank 2, and
// the MCP side lists exactly these two for exactly this reason.
const SINGLE_TOKEN_NAMES = new Set(['timi-risk-index', 'carpenter-coustan']);

// Reference cards: content, not calculators. All four are documented MCP waivers
// (static-reference / outputs-recommendation), so "no inputs" is the design.
const REFERENCE_ONLY = new Set(['co-cn-antidote', 'tetanus', 'rabies-pep', 'bbp-exposure']);

function catalog() {
  const src = readFileSync(join(ROOT, 'app.js'), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/)[1];
  const out = [];
  for (const line of arr.split('\n')) {
    const id = line.match(/id: '([^']+)'/);
    const nm = line.match(/name: '([^']+)'/);
    if (id && nm) out.push({ id: id[1], name: nm[1] });
  }
  return out;
}

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

test('every tool is findable, openable, and usable', async ({ page }) => {
  test.setTimeout(1_800_000);
  const tiles = catalog();
  expect(tiles.length).toBeGreaterThan(1500);

  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  await page.goto('/');

  const notFirst = [];
  const noBody = [];
  const noInputs = [];

  for (const t of tiles) {
    const r = await page.evaluate(async ({ id, name }) => {
      window.location.hash = '';
      await new Promise((res) => setTimeout(res, 25));
      const input = document.getElementById('hero-search');
      input.focus();
      input.value = name;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((res) => setTimeout(res, 90));
      const rows = [...document.querySelectorAll('.hero-search-result')].map((n) => n.dataset.tool);
      // Open by hash so the body checks stay independent of ranking.
      window.location.hash = '#' + id;
      await new Promise((res) => setTimeout(res, 60));
      const body = document.getElementById('tool-body');
      return {
        first: rows[0] === id,
        found: rows.includes(id),
        hasBody: !!body,
        inputs: body ? body.querySelectorAll('input, select, textarea').length : 0,
      };
    }, t);

    if (!r.hasBody) noBody.push(t.id);
    else if (!r.inputs && !REFERENCE_ONLY.has(t.id)) noInputs.push(t.id);

    if (r.first) continue;
    if (SINGLE_TOKEN_NAMES.has(t.id)) {
      expect(r.found, `${t.id} fell out of the results entirely`).toBe(true);
      continue;
    }
    notFirst.push({ id: t.id, name: t.name });
  }

  expect(noBody, `tiles that opened to nothing:\n${JSON.stringify(noBody, null, 2)}`).toEqual([]);
  expect(noInputs, `tiles with nothing to fill in:\n${JSON.stringify(noInputs, null, 2)}`).toEqual([]);
  expect(notFirst, `tiles their own name does not find first:\n${JSON.stringify(notFirst, null, 2)}`).toEqual([]);
  expect(pageErrors, `page errors while walking the catalog:\n${pageErrors.slice(0, 10).join('\n')}`).toEqual([]);
});
