#!/usr/bin/env node
// Reads the pages a reader actually gets.
//
// Every copy gate in `npm run lint` reads *sources* -- adapter summaries, tile
// descriptions, view strings -- and each one reported clean while these were
// live on the built site:
//
//   a 663-character opening line       27 pages led with a paragraph
//   no worked example                  23 pages showed a result with nothing behind it
//   a raw `<option value>`             370 rows printed `onevaso`, `mgdl`, `wet`
//   a cut mark on a whole sentence     743 hub rows said "..." with nothing omitted
//
// None of them was a source defect. Each was what happened when correct source
// text met a template -- so the only place to see it is the output. This check
// runs at the end of `npm run build`, over `dist/`, and asserts the invariants
// a page has to hold for a reader:
//
//   1. It opens with one readable line.
//   2. It says what to type in.
//   3. It shows a worked example, or at minimum states what comes out.
//   4. It names its source.
//
// Every budget below is a ratchet set at the measured state when the check
// landed, so the numbers can only improve. Loosening one is a deliberate edit
// with a reason, not a silent drift.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TOOLS = join(ROOT, 'dist', 'tools');
const README = join(ROOT, 'README.md');

// A lede is one line saying what the tool does. The longest on the site is 235
// characters (entity escapes included, which is what this counts).
const LEDE_MAX = 260;

// Example rows still printing a raw option token, because their select is
// built at render time and its options are named nowhere a build step can
// read. Was 130 before scripts/lib/option-labels.mjs learned to read a select
// whose id sits in its attribute object, a field descriptor built in a loop,
// and an option list exported from lib/.
const RAW_VALUE_ROWS_MAX = 70;

// Example labels with no name in front of the criterion, so nothing shorter
// than the clamp can be printed. Was 60 before the value legend an
// agent-facing label carries inline was stripped ahead of the trim, then 22,
// and it is 35 deliberately: de-colliding the duplicate labels below moved 13
// rows into this bucket. A clamped label the reader can tell apart from the
// row under it beats a whole one they cannot.
const CLAMPED_LABELS_MAX = 35;

// The same name on two rows of one example, with two different values. The
// reader cannot tell which row is which, and the page reads as a mistake --
// "PAIN subscale" five times over, "Maxillary" twice. 83 rows across 20 pages
// read that way, every one of them a label cut back past the part that told it
// apart from its sibling. This one is not a budget: a duplicate is never the
// best available label, because the full label is always there to fall back
// on.
const DUPLICATE_LABELS_MAX = 0;

// Hub and topic list rows: a row may be clamped, but a clamped row must be
// marked with an ellipsis and a marked row must actually have been clamped.
const HUB_DIRS = ['for', 'topics'];

const RAW_VALUE = /^(?:[a-z]+(?:-[a-z0-9]+)+|[a-z]{4,})$/;

function textOf(html, re) {
  const m = html.match(re);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function main() {
  if (!existsSync(TOOLS)) {
    console.error('check-page-copy: dist/tools/ does not exist. Run after build-tool-pages.mjs.');
    process.exit(1);
  }
  const failures = [];
  let pages = 0;
  let longestLede = { chars: 0, id: '' };
  let rawValueRows = 0;
  let clampedLabels = 0;
  const duplicateLabels = [];
  const disclosureSummaries = new Set();

  for (const id of readdirSync(TOOLS)) {
    const file = join(TOOLS, id, 'index.html');
    if (!existsSync(file)) continue;
    pages += 1;
    const html = readFileSync(file, 'utf8');

    // 1. One readable opening line.
    const lede = textOf(html, /<p class="tp-lede">([\s\S]*?)<\/p>/);
    if (!lede) failures.push(`${id}: no lede`);
    if (lede.length > LEDE_MAX) failures.push(`${id}: lede is ${lede.length} chars (max ${LEDE_MAX})`);
    if (lede.length > longestLede.chars) longestLede = { chars: lede.length, id };

    // 2. What to type in.
    const io = html.match(/<section class="tp-io"[\s\S]*?<\/section>/);
    if (!io || !/<li>|<dd>|<p>/.test(io[0])) failures.push(`${id}: no inputs stated`);

    // 3. A worked example, or at minimum the output.
    const hasExample = html.includes('id="tp-ex-h"');
    const output = textOf(html, /<dt>What you get<\/dt>\s*<dd>([\s\S]*?)<\/dd>/);
    if (!hasExample && !output) failures.push(`${id}: neither a worked example nor a stated output`);

    // 4. A source, inside the collapsed disclosure and not just the disclaimer.
    const refs = html.match(/<details class="tp-refs">([\s\S]*?)<\/details>/);
    const summary = refs && refs[1].match(/<summary>([\s\S]*?)<\/summary>/);
    if (summary) disclosureSummaries.add(summary[1].replace(/\s+/g, ' ').trim());
    const body = refs
      ? refs[1]
        .replace(/<summary>[\s\S]*?<\/summary>/, '')
        .replace(/<p class="muted">A reference and educational[\s\S]*?<\/p>/, '')
        .trim()
      : '';
    if (!body) failures.push(`${id}: the citation disclosure holds nothing but the disclaimer`);

    const seenLabels = new Set();
    for (const [, label, value] of html.matchAll(/<div class="tp-ex-row"><dt>(.*?)<\/dt><dd>(.*?)<\/dd><\/div>/g)) {
      if (RAW_VALUE.test(value.trim())) rawValueRows += 1;
      if (label.endsWith('…')) clampedLabels += 1;
      if (seenLabels.has(label)) duplicateLabels.push(`${id}: "${label}"`);
      seenLabels.add(label);
    }
  }

  if (pages === 0) failures.push('no tool pages found under dist/tools/');
  if (rawValueRows > RAW_VALUE_ROWS_MAX) {
    failures.push(`${rawValueRows} example rows print a raw option value (max ${RAW_VALUE_ROWS_MAX})`);
  }
  if (clampedLabels > CLAMPED_LABELS_MAX) {
    failures.push(`${clampedLabels} example labels are clamped mid-phrase (max ${CLAMPED_LABELS_MAX})`);
  }
  if (duplicateLabels.length > DUPLICATE_LABELS_MAX) {
    failures.push(
      `${duplicateLabels.length} example rows repeat a label already used on the same page ` +
        `(max ${DUPLICATE_LABELS_MAX}): ${duplicateLabels.slice(0, 6).join(', ')}`,
    );
  }

  // The README tells a reader where the proof is, by quoting the control they
  // have to click. That quote is a UI string living outside the UI, so it
  // drifts silently: it said "Citation and how to read this" while all 1,564
  // pages said "Citation and sources". Same failure the headline count had.
  if (existsSync(README)) {
    const readme = readFileSync(README, 'utf8');
    const quoted = readme.match(/one click away under "([^"]+)"/);
    if (!quoted) {
      failures.push('README no longer says where the citation is; the check below has nothing to hold it to');
    } else if (!disclosureSummaries.has(quoted[1])) {
      failures.push(
        `README points the reader at "${quoted[1]}", which no page has. ` +
          `The pages say: ${[...disclosureSummaries].map((t) => `"${t}"`).join(', ')}`,
      );
    }
  }

  // A hub row that ends in a cut mark stops before it has said what the tool
  // does. 2,482 of 3,329 rows did, because the first sentence of most tiles
  // runs past the line budget. Cutting at the boundary the sentence already
  // carries -- the colon before the definition -- takes that to 751. A
  // ratchet, so the fraction can only fall.
  const CUT_ROWS_MAX = 751;

  // The list pages: a cut mark means text was cut.
  let listRows = 0;
  let markedRows = 0;
  for (const dir of HUB_DIRS) {
    const base = join(ROOT, 'dist', dir);
    if (!existsSync(base)) continue;
    for (const slug of readdirSync(base)) {
      const file = join(base, slug, 'index.html');
      if (!existsSync(file)) continue;
      const html = readFileSync(file, 'utf8');
      for (const [, row] of html.matchAll(/class="hub-tile-desc">([\s\S]*?)</g)) {
        const line = row.replace(/\s+/g, ' ').trim();
        if (!line) continue;
        listRows += 1;
        if (line.endsWith('…')) markedRows += 1;
        // "..." was the old mark, and it was applied to whole sentences.
        if (line.endsWith('...')) failures.push(`${dir}/${slug}: a list row ends in "..." rather than a single ellipsis: ${line.slice(-60)}`);
      }
    }
  }

  if (markedRows > CUT_ROWS_MAX) {
    failures.push(`${markedRows} of ${listRows} hub and topic rows end in a cut mark (max ${CUT_ROWS_MAX})`);
  }

  if (failures.length) {
    console.error(`check-page-copy: ${failures.length} problem(s) across ${pages} tool pages:`);
    for (const f of failures.slice(0, 40)) console.error(`  - ${f}`);
    if (failures.length > 40) console.error(`  ... and ${failures.length - 40} more`);
    process.exit(1);
  }
  console.log(
    `check-page-copy: clean (${pages} tool pages; longest lede ${longestLede.chars} chars on ${longestLede.id}; ` +
      `${rawValueRows} raw-value rows, ${clampedLabels} clamped labels, ${duplicateLabels.length} duplicate labels; ${listRows} list rows, ${markedRows} marked as cut).`,
  );
}

main();
