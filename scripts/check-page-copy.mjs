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
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TOOLS = join(ROOT, 'dist', 'tools');
const README = join(ROOT, 'README.md');

// A lede is one line saying what the tool does. The longest on the site is 235
// characters (entity escapes included, which is what this counts).
const LEDE_MAX = 260;

// How many ledes may end on an ellipsis at all. A tile whose own first
// sentence is a bare run of every criterion has nothing to lead with but the
// run, and cutting it between items is the best that can be done -- but it is
// still a first line that trails off, so the count is a ratchet, not a
// licence. It fell 87 -> 16 when the lede builder started dropping the
// parenthetical asides (thresholds, citation years, sub-lists) that the page
// restates in full further down, which ends the sentence where its author
// ended it instead.
const MAX_CUT_LEDES = 16;

// The browser tab. Must fit the width a tab and a search result give it, and
// must end either at the site's name or at the end of the tool's own name.
const TITLE_MAX = 65;
const BRAND = 'Sophie Well';

// The search-result snippet, held to the same length the tool pages are.
const STATIC_DESC_MAX = 158;

// Example rows still printing a raw option token, because their select is
// built at render time and its options are named nowhere a build step can
// read. Was 130 before scripts/lib/option-labels.mjs learned to read a select
// whose id sits in its attribute object, a field descriptor built in a loop,
// and an option list exported from lib/. Then 70, until it learned the last
// of those: a bank handed whole to a builder that mints the DOM ids itself,
// which no view file ever names. Identified by the values it covers instead.
// 40 since the bank reader learned two more shapes -- an option list written
// as tuples rather than records, and one nested inside an array of item
// records -- and stopped counting the same bank twice when a module exports it
// and then spreads it into a second array. That took the opaque ones:
// `over90`, `first-5-90`, `fall-50-by-8-days`, `alot`. Most of what is left
// reads as English on its own ("morphine", "medicare", "emergency").
const RAW_VALUE_ROWS_MAX = 40;

// Example labels with no name in front of the criterion, so nothing shorter
// than the clamp can be printed. Was 60 before the value legend an
// agent-facing label carries inline was stripped ahead of the trim, then 22,
// and it is 35 deliberately: de-colliding the duplicate labels below moved 13
// rows into this bucket. A clamped label the reader can tell apart from the
// row under it beats a whole one they cannot. It is 43 rather than 35 because
// eight labels used to end mid-bracket instead -- "Linear growth (score by
// height velocity when possible; the height-channel\u2026" -- and an honest
// ellipsis on a whole phrase is the better of the two, not a new problem.
// 31 since stripLegend learned the two legend forms whose value token holds a
// space -- "1 point - tubular; ..." and "Below 50 x10^9/L = 1; ...".
const CLAMPED_LABELS_MAX = 31;

// Related tools are picked from what a tile shares with the others, so a
// repeat means a genuine cluster -- the four ACR/EULAR criteria tiles point at
// each other, and should. A list repeating past this is the picker falling
// back to catalog order again, which is how 1201 pages came to share one.
const SAME_RELATED_MAX = 20;

// An input row is one field on one line. A few carry a definition no shorter
// form survives -- three rows run past this and are named in the failure so a
// new one is visible rather than absorbed.
const LONG_INPUT_ROW = 200;

// "Open the calculator →" and its four siblings. Anything longer is the tile
// name creeping back into the button.
const OPEN_LABEL_MAX = 32;
const LONG_INPUT_ROWS_MAX = 3;

// The same name on two rows of one example, with two different values. The
// reader cannot tell which row is which, and the page reads as a mistake --
// "PAIN subscale" five times over, "Maxillary" twice. 83 rows across 20 pages
// read that way, every one of them a label cut back past the part that told it
// apart from its sibling. This one is not a budget: a duplicate is never the
// best available label, because the full label is always there to fall back
// on.
const DUPLICATE_LABELS_MAX = 0;

// Pages stating what the result means, from the source's own band table in
// META.interpretation. 1387 of 1564 carry one; the rest are converters,
// lookups, and letter builders whose output is not a graded value. A ratchet:
// a build that stops reading the bands drops this to zero without failing
// anything else, and 1387 pages quietly go back to showing a worked example
// with no scale behind it.
// 1376, not 1380: eleven pages whose whole "What the result means" table was
// the formula for producing the number now show that under "How it is
// calculated" instead and state no reading, which is what was true of them all
// along. Every other page kept its readings.
const BAND_PAGES_MIN = 1376;

// Hub and topic list rows: a row may be clamped, but a clamped row must be
// marked with an ellipsis and a marked row must actually have been clamped.
const HUB_DIRS = ['for', 'topics'];

const RAW_VALUE = /^(?:[a-z]+(?:-[a-z0-9]+)+|[a-z]{4,})$/;

// A lede that adds nothing to the <h1> above it. Both are stripped of a
// trailing citation parenthetical and of everything but their letters and
// digits, so "ATRIA Stroke Risk Score (Singer 2013)." and "ATRIA Stroke Risk
// Score" compare equal. The slack absorbs a trailing generic noun -- "APACHE II
// score" against a tile called "APACHE II (ICU mortality estimate)".
const NAME_SLACK = 10;
function bare(s) {
  return s.trim().replace(/[.!?]+$/, '').replace(/\s*\([^()]*\)\s*$/, '').replace(/[^a-z0-9]/gi, '').toLowerCase();
}
const count = (s, ch) => s.split(ch).length - 1;

// Two labels reading as the same question. Provenance words are what made the
// old pair indistinguishable, so a label is "about the source" if it carries
// any of them, and two such labels next to each other is the failure.
const PROVENANCE = /\b(source|sources|citation|citations|reference|references|come from|comes from|where from|proof|evidence)\b/i;
const overlaps = (a, b) => PROVENANCE.test(a) && PROVENANCE.test(b);

// `<title>` and the description are attribute/element text, so they are read
// back escaped; compare the characters a reader sees, not the entities.
const decode = (s) => s
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&');

// Was the cut made mid-enumeration? Two tells together: the sentence has more
// than one item, and the last one started close enough to the end that what
// follows the final comma is a fragment of an item rather than the sentence's
// own closing clause. Without the second tell this flags every list that ends
// and then says what the list adds up to -- "a, b, and c give a score banding
// the probability of familial\u2026" is cut in its tail, not in its list.
const ITEM_TAIL = 40;
function stillInsideList(s) {
  let depth = 0;
  let n = 0;
  let last = -1;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '[') depth += 1;
    else if (c === ')' || c === ']') depth -= 1;
    else if (c === ',' && depth <= 0) { n += 1; last = i; }
  }
  return n >= 2 && s.length - last <= ITEM_TAIL;
}

function restatesHeading(lede, heading) {
  const a = bare(lede);
  const b = bare(heading);
  if (!a || !b) return false;
  if (a === b) return true;
  return (a.startsWith(b) && a.length - b.length <= NAME_SLACK)
    || (b.startsWith(a) && b.length - a.length <= NAME_SLACK);
}

function textOf(html, re) {
  const m = html.match(re);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

// The sibling ids the app links to, for comparison with the ones the page
// prints. `lib/meta.js` is a pure module with no DOM access.
async function loadMetaRelated() {
  const { META } = await import(pathToFileURL(join(ROOT, 'lib', 'meta.js')).href);
  const map = new Map();
  for (const [id, v] of Object.entries(META)) {
    if (Array.isArray(v?.related) && v.related.length) map.set(id, v.related);
  }
  return map;
}

async function main() {
  const metaRelated = await loadMetaRelated();
  if (!existsSync(TOOLS)) {
    console.error('check-page-copy: dist/tools/ does not exist. Run after build-tool-pages.mjs.');
    process.exit(1);
  }
  const failures = [];
  let pages = 0;
  let bandPages = 0;
  let longestLede = { chars: 0, id: '' };
  let cutLedes = 0;
  let rawValueRows = 0;
  let clampedLabels = 0;
  const openBracketLabels = [];
  const relatedLists = new Map();
  const missingCurated = [];
  const repeatedRows = [];
  let longInputRows = 0;
  const duplicateLabels = [];
  const disclosureSummaries = new Set();

  for (const id of readdirSync(TOOLS)) {
    const file = join(TOOLS, id, 'index.html');
    if (!existsSync(file)) continue;
    pages += 1;
    const html = readFileSync(file, 'utf8');

    // 1. One readable opening line -- and one that says something the heading
    // did not. 72 pages opened with the tile's own name and a citation and
    // stopped there: "Berlin definition of ARDS (Ranieri 2012)." printed under
    // a heading reading "Berlin Definition of ARDS". The line meant to say what
    // the tool does said nothing at all.
    const lede = textOf(html, /<p class="tp-lede">([\s\S]*?)<\/p>/);
    if (!lede) failures.push(`${id}: no lede`);
    const heading = textOf(html, /<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (lede && heading && restatesHeading(lede, heading)) {
      failures.push(`${id}: the lede only restates the heading ("${heading}" / "${lede}")`);
    }
    if (lede.length > LEDE_MAX) failures.push(`${id}: lede is ${lede.length} chars (max ${LEDE_MAX})`);
    if (lede.length > longestLede.chars) longestLede = { chars: lede.length, id };
    // A lede that runs an enumeration and then gets cut has to be cut between
    // items. 114 pages ended inside one -- "venous invasion, sinusoidal\u2026",
    // "temperature < 36 C, altered\u2026" -- so the first line of the page stated
    // half a criterion and stopped. Prose that simply runs long may still end
    // on a word; only a list has an item boundary to land on.
    if (/\u2026$/.test(lede)) cutLedes += 1;
    if (/\u2026$/.test(lede) && stillInsideList(lede) && !/[,;:)\]]\u2026$/.test(lede)) {
      failures.push(`${id}: the lede is cut inside a list item, not between two: ${lede.slice(-48)}`);
    }
    // And it must not leave a bracket open. Four pages opened with "(the C
    // axis of\u2026" -- a parenthesis the sentence never closes.
    if (lede && count(lede, '(') !== count(lede, ')')) {
      failures.push(`${id}: the lede leaves a bracket open: ${lede.slice(-48)}`);
    }

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

    // 2a-bis. The band table: the reading the source gives for each result.
    // Counted rather than required per page, because most of the tiles without
    // one genuinely have no bands to show.
    const bandRows = (html.match(/<div class="tp-bands-row">/g) || []).length;
    if (bandRows) {
      bandPages += 1;
      if (!/<h2 id="tp-bands-h">What the result means<\/h2>/.test(html)) {
        failures.push(`${id}: the band table has no heading naming it`);
      }
    }

    // 2b. The two strings a reader meets before the page: the browser tab and
    // the search-result snippet. Held to the same rules as the page itself --
    // they close what they open, and they carry no escape character from the
    // source array. 85 descriptions ended inside a bracket, and two titles
    // read "CDAI (Crohn\\ - Free, in your browser".
    const head = html.slice(0, 4000);
    const title = decode((head.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
    const metaDesc = decode((head.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
    for (const [what, text] of [['title', title], ['meta description', metaDesc]]) {
      if (!text) continue;
      if (count(text, '(') !== count(text, ')')) {
        failures.push(`${id}: the ${what} leaves a bracket open: ${text.slice(-48)}`);
      }
      if (text.includes('\\')) {
        failures.push(`${id}: the ${what} carries a backslash out of the source array: ${text.slice(0, 48)}`);
      }
    }

    // 2c. The tab, specifically. It used to be built as
    // `<name> - Free, in your browser · Sophie Well` and clamped afterwards, so
    // on 1336 of 1564 pages the cut landed inside the boilerplate: the tab read
    // "Wells Score for DVT - Free, in your brows…" and the brand was gone. The
    // rule that holds it shut is that only the tool's own name may ever be the
    // thing that gets cut. Anything else means a template appended text after
    // the name and then let the clamp eat it.
    const h1 = decode((html.match(/<h1 class="tp-h1">([^<]*)<\/h1>/) || [])[1] || '');
    if (title) {
      if (title.length > TITLE_MAX) {
        failures.push(`${id}: the title runs ${title.length} chars (max ${TITLE_MAX}): ${title}`);
      }
      if (title.endsWith('\u2026')) {
        const kept = title.slice(0, -1);
        if (!h1.startsWith(kept)) {
          failures.push(`${id}: the title cut something other than the tool name: ${title}`);
        }
      } else if (title !== h1 && !title.endsWith(`\u00b7 ${BRAND}`)) {
        failures.push(`${id}: the title neither names the site nor is the tool name alone: ${title}`);
      }
    }

    // 3a. The button. Its visible text says what clicking does; the tile's
    // name is on it as the accessible name. It used to be the name, so 695
    // buttons ran past this saying only what the <h1> above them had said --
    // the longest 95 characters, three wrapped lines on a phone.
    const open = html.match(/<a class="tp-open"[^>]*>(.*?)<\/a>/);
    if (open && open[1].length > OPEN_LABEL_MAX) {
      failures.push(`${id}: the open button reads ${open[1].length} chars (max ${OPEN_LABEL_MAX}): ${open[1]}`);
    }
    if (open && !/aria-label="/.test(open[0])) {
      failures.push(`${id}: the open button has no accessible name naming the tool`);
    }

    // 3b. The input list, and the disclosure holding the lines it shortened.
    // The disclosure used to hold every line whenever any one was shortened,
    // so 42 rows on 18 pages appeared twice on one screen, identical --
    // `alsfrs-r` printed seven of its eight fields both ways.
    const listBlock = html.match(/<ul class="tp-io-list">([\s\S]*?)<\/ul>/);
    const listRowsHere = listBlock
      ? [...listBlock[1].matchAll(/<li>(.*?)<\/li>/g)].map((m) => m[1])
      : [];
    for (const row of listRowsHere) if (row.length > LONG_INPUT_ROW) longInputRows += 1;
    // Nor may it count what it does not name. 145 pages ended the input list
    // with "and 46 more fields" and 46 ended the worked example with "and 19
    // more fields" -- a reader asking "do I have the values for this?" or
    // trying to reproduce the stated result had nothing to read. Both now put
    // the remainder in a disclosure, so a bare count anywhere on the page is
    // the dead end coming back.
    if (/and \d+ more fields?<\/(li|p)>/.test(html)) {
      failures.push(`${id}: the page counts fields it never names`);
    }
    const fullBlock = html.match(/<details class="tp-io-full">[\s\S]*?<ul>([\s\S]*?)<\/ul>/);
    if (listBlock && fullBlock) {
      const shown = new Set(listRowsHere);
      for (const [, row] of fullBlock[1].matchAll(/<li>(.*?)<\/li>/g)) {
        if (shown.has(row)) repeatedRows.push(`${id}: "${row.slice(0, 40)}"`);
      }
    }

    // 4. Four links that have something to do with this tool. Picked by
    // catalog order once, which made them a property of the group rather than
    // of the tile: 1201 of 1563 pages listed the same four.
    const relatedBlock = html.match(/<nav class="tp-related"[\s\S]*?<\/nav>/);
    if (relatedBlock) {
      const key = [...relatedBlock[0].matchAll(/<a [^>]*>(.*?)<\/a>/g)].map((m) => m[1]).join(' | ');
      relatedLists.set(key, (relatedLists.get(key) || 0) + 1);
      // The page and the app have to name the same siblings. The app links to
      // META[id].related; the page used its own catalog-order pick, so the two
      // surfaces recommended different tools for the same tile and the page's
      // were not chosen by anyone.
      for (const rid of (metaRelated.get(id) || []).slice(0, 4)) {
        if (!relatedBlock[0].includes(`/tools/${rid}/`)) {
          missingCurated.push(`${id} -> ${rid}`);
        }
      }
    }

    const seenLabels = new Set();
    for (const [, label, value] of html.matchAll(/<div class="tp-ex-row"><dt>(.*?)<\/dt><dd>(.*?)<\/dd><\/div>/g)) {
      if (RAW_VALUE.test(value.trim())) rawValueRows += 1;
      if (label.endsWith('…')) clampedLabels += 1;
      // Whatever a label is cut down to, it closes every bracket it opens.
      // Ten rows read "(percutaneous drainage", "(0-4 animals = 0" -- an
      // aside the row starts and abandons, which looks like broken data
      // rather than a shortened name.
      if (count(label, '(') !== count(label, ')')) {
        openBracketLabels.push(`${id}: "${label}"`);
      }
      // The value beside it, held to the same rule.
      if (count(value, '(') !== count(value, ')')) {
        openBracketLabels.push(`${id}: value "${value}"`);
      }
      if (seenLabels.has(label)) duplicateLabels.push(`${id}: "${label}"`);
      seenLabels.add(label);
    }
  }

  if (pages === 0) failures.push('no tool pages found under dist/tools/');
  if (rawValueRows > RAW_VALUE_ROWS_MAX) {
    failures.push(`${rawValueRows} example rows print a raw option value (max ${RAW_VALUE_ROWS_MAX})`);
  }
  if (repeatedRows.length) {
    failures.push(
      `${repeatedRows.length} field row(s) appear both in the list and, unchanged, in the disclosure below it: ${repeatedRows.slice(0, 3).join('; ')}`,
    );
  }
  if (longInputRows > LONG_INPUT_ROWS_MAX) {
    failures.push(`${longInputRows} input rows run past ${LONG_INPUT_ROW} chars (max ${LONG_INPUT_ROWS_MAX})`);
  }
  if (missingCurated.length) {
    failures.push(
      `${missingCurated.length} hand-picked related link(s) the app shows are missing from the page: ${missingCurated.slice(0, 3).join('; ')}`,
    );
  }
  const commonest = [...relatedLists.entries()].sort((a, b) => b[1] - a[1])[0];
  if (commonest && commonest[1] > SAME_RELATED_MAX) {
    failures.push(
      `${commonest[1]} pages carry the same four related tools (max ${SAME_RELATED_MAX}): ${commonest[0]}`,
    );
  }
  if (openBracketLabels.length) {
    failures.push(
      `${openBracketLabels.length} example label(s) leave a bracket open: ${openBracketLabels.slice(0, 3).join('; ')}`,
    );
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

  // Three places name the shared method-and-citation control: the pre-rendered
  // pages, the app that replaces them once JavaScript runs, and the README.
  // A reader moves between them, so all three have to use the same words.
  if (disclosureSummaries.size > 1) {
    failures.push(
      `the pre-rendered pages use ${disclosureSummaries.size} different names for the citation disclosure: ` +
        [...disclosureSummaries].map((t) => `"${t}"`).join(', '),
    );
  }
  const [pageSummary] = [...disclosureSummaries];

  const appSummary = readFileSync(join(ROOT, 'app.js'), 'utf8')
    .match(/export const PROOF_SUMMARY = '([^']+)'/);
  if (!appSummary) {
    failures.push('app.js no longer exports PROOF_SUMMARY, so the app and the static pages cannot be compared');
  } else if (pageSummary && appSummary[1] !== pageSummary) {
    failures.push(
      `the app calls the citation disclosure "${appSummary[1]}" and the static pages call it "${pageSummary}"`,
    );
  }

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
  // ratchet, so the fraction can only fall -- with one deliberate step up, to
  // 775. Thirty rows used to look finished and were not: the clause cut landed
  // inside a bracket and put a full stop after it, so "Compute the serum anion
  // gap (Na." was the whole row. Refusing that boundary leaves 24 of them
  // honestly cut instead of dishonestly complete, which is the trade this
  // number should always take. See the bracket check below, which is the
  // ratchet that actually holds.
  const CUT_ROWS_MAX = 775;

  // Every page that is not a tool page: the home, the catalog index, the
  // commitments page, the six audience hubs, the eight topic pages and their
  // index. Their titles and descriptions are hand-authored rather than built,
  // so the rule the tool pages get from `pageTitle`/`pageDescription` reached
  // none of them -- eight topic titles ran 68 to 73 characters and six
  // descriptions ran up to 209, so the tail of each was cut in a search result
  // wherever the tab did not cut it first. Same budgets, checked the same way.
  const staticPages = ['index.html', 'tools/index.html', 'commitments/index.html', 'topics/index.html'];
  for (const dir of HUB_DIRS) {
    const base = join(ROOT, 'dist', dir);
    if (!existsSync(base)) continue;
    for (const slug of readdirSync(base)) {
      if (existsSync(join(base, slug, 'index.html'))) staticPages.push(`${dir}/${slug}/index.html`);
    }
  }
  for (const rel of staticPages) {
    const file = join(ROOT, 'dist', rel);
    if (!existsSync(file)) continue;
    const head = readFileSync(file, 'utf8').slice(0, 4000);
    const title = decode((head.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
    const desc = decode((head.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
    if (!title) { failures.push(`${rel}: no title`); continue; }
    if (title.length > TITLE_MAX) failures.push(`${rel}: the title runs ${title.length} chars (max ${TITLE_MAX}): ${title}`);
    if (desc.length > STATIC_DESC_MAX) failures.push(`${rel}: the description runs ${desc.length} chars (max ${STATIC_DESC_MAX})`);
  }

  // The list pages: a cut mark means text was cut.
  let listRows = 0;
  let markedRows = 0;
  const openBracketRows = [];
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
        // A row closes every bracket it opens. 211 did not, because the cut
        // was made inside one; twelve of those said nothing at all once cut
        // -- "Compute the serum anion gap (Na.", "TIMI Risk Index (Wiviott
        // 2006.". This is the ratchet that matters: zero, and it stays zero.
        if (count(line, '(') !== count(line, ')')) openBracketRows.push(`${dir}/${slug}: ${line.slice(0, 60)}`);
      }
    }
  }

  if (openBracketRows.length) {
    failures.push(
      `${openBracketRows.length} hub or topic row(s) leave a bracket open: ${openBracketRows.slice(0, 3).join('; ')}`,
    );
  }
  if (bandPages < BAND_PAGES_MIN) {
    failures.push(`only ${bandPages} pages state what the result means (min ${BAND_PAGES_MIN})`);
  }
  if (markedRows > CUT_ROWS_MAX) {
    failures.push(`${markedRows} of ${listRows} hub and topic rows end in a cut mark (max ${CUT_ROWS_MAX})`);
  }

  if (cutLedes > MAX_CUT_LEDES) {
    failures.push(`${cutLedes} ledes end on an ellipsis (max ${MAX_CUT_LEDES}); a lede should end where its sentence does`);
  }

  if (failures.length) {
    console.error(`check-page-copy: ${failures.length} problem(s) across ${pages} tool pages:`);
    for (const f of failures.slice(0, 40)) console.error(`  - ${f}`);
    if (failures.length > 40) console.error(`  ... and ${failures.length - 40} more`);
    process.exit(1);
  }
  console.log(
    `check-page-copy: clean (${pages} tool pages; longest lede ${longestLede.chars} chars on ${longestLede.id}; ${cutLedes} cut; ` +
      `${rawValueRows} raw-value rows, ${clampedLabels} clamped labels, ${duplicateLabels.length} duplicate labels; ${bandPages} state what the result means; ${listRows} list rows, ${markedRows} marked as cut).`,
  );
}

main();
