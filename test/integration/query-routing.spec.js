// spec-v766: a value-bearing question reaches the tile it names, in the REAL app.
//
// Every measurement before this one ran the ranker directly. The app does more:
// searchUtilities ranks names and ids, resolvePrompt consults the synonym table,
// an inline-compute hit is promoted to the front, and an audience hint filters.
// A query can rank correctly in isolation and still land somewhere else here.
//
// That gap hid a real defect. "akin current creatinine 2.4 baseline creatinine
// 0.9" routed to COMPERA 2.0 on the live site while "akin aki" routed correctly
// -- the reader's own values outranked the name they sat beside (spec-v765).
// Nothing caught it because nothing drove the app with values in the query.
//
// A broad deterministic sample rather than all 1564: this navigates per tile, and
// the whole-catalog sweeps already cost 25 minutes each.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tileName } from '../../scripts/lib/tile-name.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function sample(n) {
  const src = readFileSync(join(ROOT, 'app.js'), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/)[1];
  const tiles = [];
  for (const line of arr.split('\n')) {
    const id = line.match(/id: '([^']+)'/);
    const name = tileName(line);
    if (id && name) tiles.push({ id: id[1], name });
  }
  const fields = {};
  for (const f of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z', '4']) {
    try { Object.assign(fields, JSON.parse(readFileSync(join(ROOT, 'data', 'fields', `${f}.json`), 'utf8'))); } catch { /* bucket may not exist */ }
  }
  const meta = JSON.parse(readFileSync(join(ROOT, 'test', 'fixtures', 'routing-values.json'), 'utf8'));
  const withValues = tiles.filter((t) => fields[t.id] && meta[t.id]);
  // Evenly spaced, so the sample spans the catalog and is the same every run.
  if (!Number.isFinite(n)) return withValues.map((t) => ({ ...t, values: meta[t.id] }));
  const step = Math.max(1, Math.floor(withValues.length / n));
  return withValues.filter((_, i) => i % step === 0).slice(0, n)
    .map((t) => ({ ...t, values: meta[t.id] }));
}

// 200 by default: broad enough to catch a systematic routing fault, fast enough
// to sit in CI beside two 25-minute catalog sweeps. ROUTING_SAMPLE=all runs
// every tile that has documented values, which takes minutes and is the right
// thing to do after touching the ranker.
const SAMPLE = process.env.ROUTING_SAMPLE === 'all' ? Infinity : Number(process.env.ROUTING_SAMPLE || 200);
const TILES = sample(SAMPLE);

test.skip(({ browserName }) => browserName !== 'chromium', 'routing sweep is chromium-only');

test('a question carrying its values reaches the tile it names', async ({ page }) => {
  test.setTimeout(SAMPLE === Infinity ? 1_800_000 : 600_000);
  expect(TILES.length).toBeGreaterThan(Math.min(150, SAMPLE - 1));
  await page.goto('/');

  const missed = [];
  for (const tile of TILES) {
    const query = `${tile.name} ${tile.values.join(' ')}`;
    const top = await page.evaluate(async (q) => {
      const input = document.getElementById('hero-search');
      input.focus();
      input.value = q;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 60));
      const row = document.querySelector('.hero-search-result');
      return row ? row.dataset.tool : null;
    }, query);
    if (top !== tile.id) missed.push({ id: tile.id, got: top, query: query.slice(0, 70) });
  }

  expect(
    missed,
    `queries that did not reach the tile they name:\n${JSON.stringify(missed, null, 2)}`
  ).toEqual([]);
});
