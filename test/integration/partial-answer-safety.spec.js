// spec-v769: never show a confident number computed from an input nobody gave.
//
// A query fills what it says and leaves the rest. spec-v755 asks for the first
// missing REQUIRED field and hides the answer while it asks -- because a tile
// whose lib reads a blank field as zero renders "0 mL/min", which looks exactly
// like a result.
//
// But askCard only asks about a text or number input. A required ENUM gets no
// question, so nothing hides the answer -- and 447 of the 1035 tiles that have
// required fields carry a required enum or checkbox. This pins the invariant
// across that set: with a required input genuinely unanswered, the reader must
// see the tile say it is incomplete, or the ask card, or nothing. Never a number
// presented as an answer.
//
// "Genuinely unanswered" excludes an unticked checkbox. It carries a value, the
// reader can see it, and it has no provenance caption claiming it came from
// their question -- so it is an answer, not a gap.
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tileName } from '../../scripts/lib/tile-name.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function riskyTiles(limit) {
  const src = readFileSync(join(ROOT, 'app.js'), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/)[1];
  const names = {};
  for (const line of arr.split('\n')) {
    const id = line.match(/id: '([^']+)'/);
    const nm = tileName(line);
    if (id && nm) names[id[1]] = nm;
  }
  const fields = {};
  for (const f of readdirSync(join(ROOT, 'data', 'fields'))) {
    Object.assign(fields, JSON.parse(readFileSync(join(ROOT, 'data', 'fields', f), 'utf8')));
  }
  const out = [];
  for (const [id, rows] of Object.entries(fields)) {
    if (!names[id]) continue;
    const hasUnaskable = rows.some((f) => f.r && (f.k === 'enum' || f.k === 'bool'));
    const numbers = rows.filter((f) => f.r && f.k === 'number');
    if (hasUnaskable && numbers.length) out.push({ id, name: names[id], rows, numbers });
  }
  const step = Math.max(1, Math.floor(out.length / limit));
  return out.filter((_, i) => i % step === 0).slice(0, limit);
}

// The label as a person would say it: no glossary, no parenthetical, no digits.
const human = (l) => String(l || '').split('. ')[0].split(':')[0]
  .replace(/\[[^\]]*\]?/g, ' ').replace(/\([^)]*\)/g, ' ').replace(/\d+(?:\.\d+)?/g, ' ')
  .replace(/[^a-z\s/-]/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

const TILES = riskyTiles(Number(process.env.PARTIAL_SAMPLE || 40));

test.skip(({ browserName }) => browserName !== 'chromium', 'partial-answer sweep is chromium-only');

test('a partly answered question never shows a confident number', async ({ page }) => {
  test.setTimeout(600_000);
  expect(TILES.length).toBeGreaterThan(20);
  await page.goto('/');

  const flagged = [];
  let exercised = 0;

  for (const tile of TILES) {
    // Say only the numbers. The required enum or checkbox stays unstated.
    const parts = tile.numbers.slice(0, 3)
      .map((f) => `${human(f.l)} ${f.u === '%' ? 40 : 5}`)
      .filter((p) => p.trim().length > 2);
    if (!parts.length) continue;

    const outcome = await page.evaluate(async ({ query, id, rows }) => {
      window.location.hash = '';
      await new Promise((r) => setTimeout(r, 60));
      const input = document.getElementById('hero-search');
      input.focus();
      input.value = query;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 120));
      const row = document.querySelector('.hero-search-result');
      if (!row || row.dataset.tool !== id) return null;
      row.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 420));

      const body = document.getElementById('tool-body');
      const qr = document.getElementById('q-results');
      // An unchecked checkbox is ANSWERED, not unset: it carries a value, the
      // reader can see it unticked, and it has no "from your question" caption
      // to claim otherwise. qbl-pph marks "Vaginal birth" required, and leaving
      // it unticked is a real answer (a caesarean), not a gap. Only an empty
      // text/number input or an enum with no selection is genuinely unanswered.
      const unset = rows.filter((f) => f.r).filter((f) => {
        const n = body && body.querySelector(`#${CSS.escape(f.d)}`);
        if (!n) return false;
        if (n.type === 'checkbox' || n.type === 'radio') return false;
        return !String(n.value || '').trim();
      }).map((f) => f.d);
      return {
        unset,
        query,
        asking: !!document.querySelector('.ask-card'),
        visible: !!qr && getComputedStyle(qr).display !== 'none',
        text: (qr ? qr.textContent : '').trim(),
      };
    }, { query: `${tile.name} ${parts.join(', ')}`, id: tile.id, rows: tile.rows });

    if (!outcome) continue;
    exercised += 1;

    // The tile telling the reader what it still needs is the correct outcome,
    // even though that sentence can contain a digit.
    // A tile that opens with an imperative is talking to the reader about what
    // it still needs -- "Score the exudate amount 0 to 3", "Answer all 4 yes/no
    // factors". Anchoring to the FIRST word matters: a real answer can contain
    // any of these verbs ("Helsinki CT score 5 -- higher predicted mortality"),
    // and a keyword-anywhere match would read that as a request for input and
    // wave the failure through.
    const saysIncomplete = /^(enter|supply|provide|select|choose|score|answer|rate|specify|pick|set|add|give|complete|fill|need)\b/i.test(outcome.text)
      || /\b(required|missing)\b/i.test(outcome.text);
    const showsNumber = outcome.visible && /\d/.test(outcome.text) && !saysIncomplete;

    if (outcome.unset.length && showsNumber && !outcome.asking) {
      flagged.push({ id: tile.id, unset: outcome.unset, query: outcome.query, text: outcome.text.slice(0, 80) });
    }
  }

  expect(exercised, 'the sweep must actually reach these tiles').toBeGreaterThan(10);
  expect(
    flagged,
    `tiles showing a number while a required input is unset and nothing is asking:\n${JSON.stringify(flagged, null, 2)}`
  ).toEqual([]);
});
