#!/usr/bin/env node
// spec-seo Phase 2 (§5): generate one pre-rendered HTML page per tile at
// `dist/tools/<id>/index.html`. Each page is a real indexable URL with
// SEO-shaped <title>, <meta description>, canonical, a visible <h1>,
// a templated prose block (description / when to use / source), and
// a "Open the calculator" link back into the SPA at `/#<id>`.
//
// The script is template-only for the first cut: prose is generated
// deterministically from META + the tile description in index.html.
// Phase 2 follow-on PRs can replace any individual tile's templated
// prose with hand-authored copy in `data/tool-copy/<id>.json`.
//
// Source-of-truth:
//   - tile id, name, group, audiences: UTILITIES in app.js
//   - tile short description:           tc-desc <span> in index.html
//   - citation / source / example:      META in lib/meta.js
//
// Output: `dist/tools/<id>/index.html`. The dev source tree does not
// contain `dist/`; this script only runs as part of `npm run build`.

import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
// The MCP registry is the machine-readable field list for every exposed tile
// (label + kind per input). It is the only place the inputs are enumerated
// outside the DOM, so the page's "What you enter" list is generated from it
// rather than hand-written or guessed.
import { getCalculator } from '../mcp/catalog.js';
import { splitLead } from '../lib/long-note.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://sophiewell.com';

// spec-v11 §4.1: visible specialty / category labels.
const GROUP_LABELS = {
  A: 'Billing & Coding',
  B: 'Billing & Reimbursement',
  C: 'Insurance & Patient Literacy',
  E: 'Clinical Math & Conversions',
  F: 'Medication & Infusion',
  G: 'Clinical Scoring & Risk',
  H: 'Workflow & Documentation',
  I: 'EMS & Field Medicine',
  J: 'Immunization & Infectious Disease',
  K: 'Reference Ranges',
  L: 'Insurance Glossary',
  M: 'State & Coverage Reference',
  N: 'Pediatrics & Neonatal',
  O: 'High-Alert & Safety',
};

// --- Parse UTILITIES from app.js. We can't import app.js under Node
// because it pulls in views that touch the DOM at module init; parse
// the literal instead. (Same approach as build-ld.mjs / build-sitemap.mjs.)
async function loadUtilities() {
  const src = await readFile(join(ROOT, 'app.js'), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!arr) throw new Error('build-tool-pages: could not find UTILITIES in app.js');
  const tiles = [];
  for (const line of arr[1].split('\n')) {
    const id = line.match(/id:\s*'([^']+)'/);
    const name = line.match(/name:\s*'([^']+)'/);
    const group = line.match(/group:\s*'([^']+)'/);
    if (id && name && group) {
      tiles.push({ id: id[1], name: name[1], group: group[1] });
    }
  }
  if (tiles.length === 0) throw new Error('build-tool-pages: zero tiles parsed.');
  return tiles;
}

// --- Parse tile descriptions from index.html. The button block uses
// `tc-desc` <span>. Description text may contain a literal `<`, so we
// match through the close-tag explicitly rather than `[^<]+`.
async function loadDescriptions() {
  const html = await readFile(join(ROOT, 'index.html'), 'utf8');
  const out = new Map();
  const rx = /data-tool="([^"]+)"[\s\S]*?<span class="tc-desc">([\s\S]*?)<\/span>/g;
  let m;
  while ((m = rx.exec(html))) {
    if (!out.has(m[1])) out.set(m[1], m[2].trim());
  }
  return out;
}

// --- Load META directly (lib/meta.js is a pure module, no DOM access).
async function loadMeta() {
  const mod = await import(new URL('../lib/meta.js', import.meta.url));
  return mod.META;
}

// --- Per-tile prose overrides (spec-seo §5.4 + §14.2). Hand-authored
// copy lives at `data/tool-copy/<id>.json`. Recognized fields:
//   { whatThisIs?: string, whenToUse?: string, inputs?: string, output?: string }
// Any may be omitted; missing fields fall back to the templated
// defaults. `inputs` and `output` fill the "Inputs and output" block for
// the tiles that have no MCP adapter to read field labels from -- mostly
// question-flow decision aids and document builders, which render their
// fields as the reader answers rather than up front. Without them those
// pages printed no such block at all, so the reader was told the answer
// the tile gives without being told what it needs from them.
async function loadToolCopy(id) {
  const path = new URL(`../data/tool-copy/${id}.json`, import.meta.url);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (err) {
    console.warn(`build-tool-pages: skipping malformed data/tool-copy/${id}.json (${err.message})`);
    return null;
  }
}

// --- spec-seo §7.2 classifier. Maps each tile to a schema.org
// additionalType. The page @type stays at MedicalWebPage (clinical
// surface) or WebPage so the base node is always validator-clean;
// additionalType layers on the more specific intent (MedicalCalculator,
// HowTo, Dataset, SoftwareApplication) Google's rich-result pipelines
// look for. Sets are explicit (not heuristic) so a contributor adding
// a new tile makes a deliberate choice about its discovery surface.
const HOW_TO_TILES = new Set([
  // Group C template generators
  'appeal-letter', 'hipaa-roa',
  // Group H workflow templates
  'prep', 'prior-auth', 'hipaa-auth', 'roi', 'discharge-instr',
  'specialty-visit', 'wallet-card', 'sbar-template',
  // Group I documentation helper
  'ems-doc',
]);
const DATASET_TILES = new Set([
  // Group J reference table
  'sti-screening',
]);
const REFERENCE_TILES = new Set([
  // Group F reference tables
  'peds-dose', 'anticoag-reversal',
  // Group I reference tables
  'co-cn-antidote',
]);

function classify(tile) {
  // Math / scoring / clinical-decision tiles are MedicalCalculator.
  // The HowTo / Dataset / Reference allowlists override that default
  // for tiles that semantically aren't a calculator.
  if (HOW_TO_TILES.has(tile.id)) {
    return { ldType: 'WebPage', additionalType: 'https://schema.org/HowTo', kind: 'howto' };
  }
  if (DATASET_TILES.has(tile.id)) {
    return { ldType: 'WebPage', additionalType: 'https://schema.org/Dataset', kind: 'dataset' };
  }
  if (REFERENCE_TILES.has(tile.id)) {
    return { ldType: 'MedicalWebPage', additionalType: null, kind: 'reference' };
  }
  if (['E', 'F', 'G', 'I'].includes(tile.group)) {
    return { ldType: 'MedicalWebPage', additionalType: 'https://schema.org/MedicalCalculator', kind: 'calculator' };
  }
  // Group C regulatory + Group N literacy + everything else.
  return { ldType: 'WebPage', additionalType: null, kind: 'webpage' };
}

// --- Minimal HTML escaper for templated text. Outputs are written to
// disk, never executed; the escape exists so a description that mentions
// `< 90 mmHg` does not break the surrounding markup.
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Escape citation prose, then promote any bare https:// URL it contains
// into a clickable, privacy-safe anchor. Punctuation directly trailing a
// URL stays as text. Returns an HTML string; non-URL text is always
// escaped first so this stays injection-safe.
function linkifyCitation(s) {
  const str = String(s == null ? '' : s);
  const re = /https?:\/\/[^\s)]+/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(str)) !== null) {
    out += esc(str.slice(last, m.index));
    let url = m[0];
    let trail = '';
    while (url && /[.,;]$/.test(url)) { trail = url.slice(-1) + trail; url = url.slice(0, -1); }
    out += `<a class="tp-citation-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>${esc(trail)}`;
    last = m.index + m[0].length;
  }
  out += esc(str.slice(last));
  return out;
}

function clampTitle(s, max = 65) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + '…';
}

// The visible lede: the first whole sentence of whatever the tile says about
// itself. Ends where the author ended it, so it never reads as a thought that
// was cut off. A first sentence long enough to be its own paragraph is trimmed
// with an ellipsis, which at least admits there is more.
const LEDE_MAX = 220;
function leadSentence(text) {
  const lead = (splitLead(text)?.lead || text).trim();
  if (lead.length <= LEDE_MAX) return /[.!?]$/.test(lead) ? lead : `${lead}.`;
  const cut = lead.slice(0, LEDE_MAX);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > LEDE_MAX * 0.6 ? cut.slice(0, sp) : cut).trimEnd()}…`;
}

function clampDescription(s, max = 158) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 100 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

// The visible input list, generated from the MCP field registry. Long lists
// are truncated so the page stays scannable; the tool itself always shows
// every field.
const MAX_LISTED_INPUTS = 8;
function mcpRecord(tileId) {
  try { return getCalculator(tileId) || null; } catch { return null; }
}

function inputLabels(tileId) {
  const rec = mcpRecord(tileId);
  const fields = rec && Array.isArray(rec.fields) ? rec.fields : [];
  const labels = [];
  const seen = new Set();
  for (const f of fields) {
    const label = f && typeof f.label === 'string' ? f.label.trim() : '';
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels;
}

// --- The worked example, stated as concrete values.
//
// `META.example.fields` is keyed by DOM id and the MCP registry carries the
// same DOM id alongside a human label and a unit, so the two join cleanly:
// 1,538 of the 1,564 tiles have every example key matched to a field.
// Before this, the page printed the example's *expected output* under "What
// you get" with none of the inputs that produced it -- a number with nothing
// behind it. Showing the inputs beside it is what makes the page intuitive:
// the reader sees the shape of every value and can substitute their own.
const MAX_EXAMPLE_ROWS = 10;

// A field label leads with the name of the thing and then qualifies it, so the
// lead worth keeping is often just two words ("Patient age."). The paragraph
// default would refuse that as a fragment and print the whole label instead.
const FIELD_MIN_LEAD = 10;

// The name of the thing, not the explanation of it. Field labels lead with a
// noun phrase and then qualify it; the example row wants only the noun phrase,
// without the trailing scale legend that several instruments append.
function shortLabel(raw) {
  const text = (raw || '').trim();
  if (!text) return '';
  const lead = (splitLead(text, { minLead: FIELD_MIN_LEAD })?.lead || text).trim();
  const stripped = lead.replace(/\s*[([][^()[\]]*[)\]]\s*\.?$/, '').trim();
  let s = (stripped || lead).replace(/[.:;,]+$/, '').trim();
  if (s.length > 80) {
    const cut = s.slice(0, 79);
    const sp = cut.lastIndexOf(' ');
    s = (sp > 40 ? cut.slice(0, sp) : cut).trimEnd() + '…';
  }
  return s;
}

// A unit belongs on a measurement, not on a yes/no or a picked option. A
// checkbox is stored as `1` / `true` / `yes` depending on the tile, and none of
// those is what the reader sees on screen -- a row reading "Heart rate > 100:
// 1" states a count, not a checked box.
const BOOL_TRUE = new Set(['1', 'true', 'yes', 'y', 'on']);
function exampleValue(field, raw) {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  if (field.kind === 'bool' || field.kind === 'boolean') {
    return BOOL_TRUE.has(value.toLowerCase()) ? 'Yes' : 'No';
  }
  // An enum whose option is literally "yes" or "no" is the same answer written
  // as a picklist rather than a checkbox; print it the same way.
  const YES_NO = { yes: 'Yes', no: 'No', true: 'Yes', false: 'No' };
  if (YES_NO[value.toLowerCase()]) return YES_NO[value.toLowerCase()];
  const unit = typeof field.unit === 'string' ? field.unit.trim() : '';
  const numeric = /^-?\d+(\.\d+)?$/.test(value);
  return unit && numeric ? `${value} ${unit}` : value;
}

// Three tiles are question flows: they render one question at a time and have
// no static fields, so there is no `META.example` to join. Their example is
// written out in `data/tool-copy/<id>.json` as `{ rows: [[label, value]],
// result }`, and `test/unit/tool-page-example.test.js` re-derives the result
// from the same committed data file the tile reads, so it cannot go stale.
function copyExample(copy) {
  const ex = copy?.example;
  if (!ex || !Array.isArray(ex.rows) || !ex.result) return null;
  const rows = ex.rows
    .filter((r) => Array.isArray(r) && r[0] && r[1])
    .map(([label, value]) => ({ label: String(label), value: String(value) }));
  return rows.length ? { rows, result: String(ex.result) } : null;
}

function exampleRows(tileId, meta) {
  const fields = meta?.example?.fields;
  if (!fields || typeof fields !== 'object') return null;
  const rec = mcpRecord(tileId);
  if (!rec || !Array.isArray(rec.fields)) return null;
  const byDom = new Map(rec.fields.map((f) => [f.dom, f]));
  const rows = [];
  for (const [dom, raw] of Object.entries(fields)) {
    const field = byDom.get(dom);
    if (!field) return null; // partial join would misstate the example
    const label = shortLabel(field.label);
    const value = exampleValue(field, raw);
    // An empty example value is a select left on its blank default (seven
    // tiles do this, where blank means "no"). The reader types nothing there,
    // so the row is left out rather than printed as an empty cell.
    if (!label || !value) continue;
    rows.push({ label, value });
  }
  return rows.length ? rows : null;
}

function pickRelated(tiles, current, max = 4) {
  return tiles
    .filter((t) => t.group === current.group && t.id !== current.id)
    .slice(0, max);
}

// --- Per-tile prose block (templated). The blocks reuse what META
// already says when META has it, otherwise fall back to the tile
// description. Hand-authored copy can replace any of these in a
// later PR by reading from `data/tool-copy/<id>.json` (not wired here).
function buildPageHtml({ tile, desc, meta, related, copy, whatThisIs }) {
  const groupLabel = GROUP_LABELS[tile.group] || tile.group;
  const seoTitle = clampTitle(`${tile.name} - Free, in your browser · Sophie Well`);
  const seoDesc = clampDescription(
    `${desc} Free, runs in your browser, no signup, no tracking. Sophie Well.`
  );
  const canonical = `${SITE}/tools/${tile.id}/`;
  const hashUrl = `${SITE}/#${tile.id}`;

  // Citation prose with links where possible: bare URLs in the text become
  // anchors, and a structured citationUrl (permanent DOI / publisher page)
  // renders as an explicit "Read the source" link. Mirrors the SPA's
  // References region (app.js renderMetaBlock) so the indexable page and
  // the live tool point at the same primary source.
  const citationHtml = meta?.citation
    ? `<p>${linkifyCitation(meta.citation)}${meta.citationUrl ? ` <a class="tp-citation-link" href="${esc(meta.citationUrl)}" target="_blank" rel="noopener noreferrer">Read the source &#8599;</a>` : ''}</p>`
    : '';
  const sourceHtml = meta?.source?.label
    ? `<p class="src-stamp"><strong>Source:</strong> ${esc(meta.source.label)}</p>`
    : '';

  const relatedHtml = related.length
    ? `<nav class="tp-related" aria-label="Related tools">
        <h2>Related tools</h2>
        <ul>
${related.map((r) => `          <li><a href="${SITE}/tools/${r.id}/">${esc(r.name)}</a></li>`).join('\n')}
        </ul>
      </nav>`
    : '';

  // spec-seo §7.2: per-tool JSON-LD type via classify(). Dataset
  // tiles also emit a sibling Dataset node so Google Dataset Search
  // picks them up; HowTo tiles emit a minimal three-step Open ->
  // Enter -> Read recipe so the additionalType isn't load-bearing
  // alone.
  const { ldType, additionalType, kind } = classify(tile);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sophie Well', item: `${SITE}/` },
      // Group is a category label, not a navigable page: the home grid shows it
      // as a non-clickable section heading and the on-page breadcrumb renders it
      // as plain text. There is no `#g-<group>` route (it falls through to the
      // home view), so emitting it as an `item` URL asserted a dead link. A
      // name-only intermediate ListItem is valid schema.org and mirrors the UI.
      { '@type': 'ListItem', position: 2, name: groupLabel },
      { '@type': 'ListItem', position: 3, name: tile.name, item: canonical },
    ],
  };
  const pageLd = {
    '@context': 'https://schema.org',
    '@type': ldType,
    name: tile.name,
    description: desc,
    url: canonical,
    isAccessibleForFree: true,
    inLanguage: 'en',
    author: { '@type': 'Person', name: 'Clay Good', url: 'https://claygood.com' },
    publisher: { '@type': 'Organization', name: 'Sophie Well', url: SITE },
    isPartOf: { '@id': `${SITE}/#webapp` },
  };
  if (additionalType) pageLd.additionalType = additionalType;
  if (meta?.citation) pageLd.citation = meta.citation;

  // Dataset sibling node (separate <script>) for Group A / K / L
  // lookups that ship a real bundled table. Google Dataset Search is
  // a low-competition vertical for this kind of content.
  const datasetLd = (kind === 'dataset')
    ? {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: tile.name,
        description: desc,
        url: canonical,
        keywords: [tile.name, groupLabel],
        isAccessibleForFree: true,
        license: 'https://github.com/clay-good/sophiewell.com/blob/main/LICENSE',
        creator: { '@type': 'Person', name: 'Clay Good', url: 'https://claygood.com' },
        ...(meta?.source?.label ? { sourceOrganization: { '@type': 'Organization', name: meta.source.label } } : {}),
      }
    : null;

  // Minimal HowTo recipe for the template/workflow generators. Google's
  // HowTo rich result needs an explicit step list; without it the
  // additionalType is just a hint.
  const howToLd = (kind === 'howto')
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: tile.name,
        description: desc,
        totalTime: 'PT2M',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Open the tool', text: `Open ${tile.name} in your browser at ${hashUrl}. No signup, no install.` },
          { '@type': 'HowToStep', position: 2, name: 'Enter your inputs', text: 'Each field is pre-filled with a worked example so you can see the expected format. Overwrite the values with your own.' },
          { '@type': 'HowToStep', position: 3, name: 'Read the result', text: 'The output is computed deterministically. The References region under the result links to the primary source.' },
        ],
      }
    : null;

  // Hand-authored copy only. The old generated fallbacks asserted a
  // hardcoded tile count that had drifted far from the real catalog, and
  // repeated the same privacy boilerplate on every one of the ~1,500 pages.
  // A page with nothing specific to say now says nothing instead.
  // `whatThisIs` arrives already de-duplicated against the lede: when the
  // lede was lifted from this section's first sentence, that sentence has been
  // taken out here, so the page never says it twice.
  const whatThisIsText = whatThisIs || '';
  const whenToUseText = copy?.whenToUse || '';

  // One field per line, not a semicolon-joined run-on: a reader scanning for
  // "do I have the values for this?" wants a list. Each line is trimmed to its
  // first sentence, because the field descriptions carry a second and third
  // sentence of qualification that belongs one click away rather than in the
  // way. Nothing is dropped: if any line was trimmed, the full descriptions
  // sit under a disclosure directly below.
  const labels = inputLabels(tile.id);
  const shownLabels = labels.slice(0, MAX_LISTED_INPUTS);
  const extraLabels = labels.length - shownLabels.length;
  const extraLine = extraLabels > 0
    ? `<li>and ${extraLabels} more field${extraLabels === 1 ? '' : 's'}</li>`
    : '';
  const leads = shownLabels.map((l) => splitLead(l, { minLead: FIELD_MIN_LEAD })?.lead || l);
  const trimmed = leads.some((lead, i) => lead !== shownLabels[i]);
  const fullHtml = trimmed
    ? `\n          <details class="tp-io-full">
            <summary>Full field descriptions</summary>
            <ul>${shownLabels.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
          </details>`
    : '';
  const inputsBody = shownLabels.length
    ? `<ul class="tp-io-list">${leads.map((l) => `<li>${esc(l)}</li>`).join('')}${extraLine}</ul>${fullHtml}`
    : (copy?.inputs ? `<p>${esc(copy.inputs)}</p>` : '');
  // The worked example, when the example's fields join cleanly to the field
  // registry. Where they don't, fall back to stating the expected output on
  // its own -- less useful, but honest about what the page knows.
  const metaRows = exampleRows(tile.id, meta);
  const example = (metaRows && meta?.example?.expected)
    ? { rows: metaRows, result: meta.example.expected, prefilled: true }
    : (copyExample(copy) ? { ...copyExample(copy), prefilled: false } : null);
  const shownRows = example ? example.rows.slice(0, MAX_EXAMPLE_ROWS) : [];
  const extraRows = example ? example.rows.length - shownRows.length : 0;
  const outputText = example
    ? esc(copy?.output || '')
    : (meta?.example?.expected ? esc(meta.example.expected) : esc(copy?.output || ''));
  // Only promise a pre-filled example when there is a worked example behind
  // it. A tile whose output line came from hand-authored copy has no META
  // example to pre-fill from, so the line would be a claim the tool does not
  // keep.
  const exampleLine = (!example && meta?.example?.expected)
    ? '\n          <p class="muted">The tool opens pre-filled with that example. Replace the values with your own.</p>'
    : '';
  // The heading names what the section actually holds. Once the worked example
  // carries the result, most pages have only the input list left here, and
  // "Inputs and output" would promise an output the section no longer states.
  const howHeading = outputText ? 'Inputs and output' : 'What you enter';
  const howBody = outputText
    ? `<dl class="tp-io-dl">
          <dt>What you enter</dt>
          <dd>${inputsBody}</dd>
          <dt>What you get</dt>
          <dd>${outputText}</dd>
          </dl>`
    : inputsBody;
  const howHtml = (inputsBody || outputText)
    ? `<section class="tp-io" aria-labelledby="tp-io-h">
          <h2 id="tp-io-h">${howHeading}</h2>
          ${howBody}${exampleLine}
        </section>`
    : '';

  // A question flow has no fields to pre-fill, so it gets the honest version of
  // the hint: answer the same way and you land on the same result.
  const exampleHint = example?.prefilled
    ? 'The tool opens with these values already filled in. Replace them with your own.'
    : 'Answer the questions this way to reach that result. Your own answers give your own.';
  const exampleHtml = example
    ? `<section class="tp-ex" aria-labelledby="tp-ex-h">
          <h2 id="tp-ex-h">Example</h2>
          <dl class="tp-ex-dl">
${shownRows.map((r) => `            <div class="tp-ex-row"><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`).join('\n')}
          </dl>${extraRows > 0 ? `\n          <p class="muted">and ${extraRows} more field${extraRows === 1 ? '' : 's'}</p>` : ''}
          <p class="tp-ex-result"><strong>Result:</strong> ${esc(example.result)}</p>
          <p class="muted">${exampleHint}</p>
        </section>`
    : '';

  const whatHtml = whatThisIsText
    ? `<section class="tp-what" aria-labelledby="tp-what-h">
          <h2 id="tp-what-h">What this is</h2>
          <p>${esc(whatThisIsText)}</p>
        </section>`
    : '';
  const whenHtml = whenToUseText
    ? `<section class="tp-when" aria-labelledby="tp-when-h">
          <h2 id="tp-when-h">When to use it</h2>
          <p>${esc(whenToUseText)}</p>
        </section>`
    : '';

  return `<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />

    <meta name="referrer" content="no-referrer" />
    <meta name="color-scheme" content="dark light" />

    <title>${esc(seoTitle)}</title>
    <meta name="description" content="${esc(seoDesc)}" />
    <meta name="author" content="Clay Good" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${canonical}" />
    <link rel="author" href="https://claygood.com" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Sophie Well" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${esc(seoTitle)}" />
    <meta property="og:description" content="${esc(seoDesc)}" />
    <meta property="og:image" content="${SITE}/og/tools/${tile.id}.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(tile.name)} - Sophie Well" />
    <meta property="og:locale" content="en_US" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${canonical}" />
    <meta property="twitter:title" content="${esc(seoTitle)}" />
    <meta property="twitter:description" content="${esc(seoDesc)}" />
    <meta property="twitter:image" content="${SITE}/og/tools/${tile.id}.png" />
    <meta property="twitter:image:alt" content="${esc(tile.name)} - Sophie Well" />

    <script type="application/ld+json">
${JSON.stringify(pageLd, null, 2)}
    </script>
    <script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
    </script>
${datasetLd ? `    <script type="application/ld+json">\n${JSON.stringify(datasetLd, null, 2)}\n    </script>\n` : ''}${howToLd ? `    <script type="application/ld+json">\n${JSON.stringify(howToLd, null, 2)}\n    </script>\n` : ''}
    <link rel="stylesheet" href="/styles.css" />
    <script src="/theme.js"></script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="topbar" role="banner">
      <a href="/" class="topbar-brand" aria-label="Sophie Well, home">
        <img src="/logo.png" alt="Sophie Well logo" width="32" height="32" />
        <span>Sophie Well</span>
      </a>
    </header>

    <div class="container">
      <main id="main" class="tool-page">
        <nav class="tp-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true"> / </span>
          <span>${esc(groupLabel)}</span>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">${esc(tile.name)}</span>
        </nav>

        <h1 class="tp-h1">${esc(tile.name)}</h1>
        <p class="tp-lede">${esc(desc)}</p>

        <p class="tp-cta">
          <a class="tp-open" href="${hashUrl}">Open the ${esc(tile.name)} →</a>
          <span class="muted">Runs in your browser. Nothing you type leaves your device.</span>
        </p>

        ${exampleHtml}

        ${howHtml}

        ${whatHtml}

        ${whenHtml}

        <details class="tp-refs">
          <summary>Citation and sources</summary>
          ${citationHtml}
          ${sourceHtml}
          <p class="muted">A reference and educational tool. Not medical, legal, or financial advice, and not a substitute for clinician judgment.</p>
        </details>

        ${relatedHtml}

        <p class="tp-author muted">Built by <a href="https://claygood.com" rel="noopener" target="_blank">Clay Good</a>. Source on <a href="https://github.com/clay-good/sophiewell.com" rel="noopener" target="_blank">GitHub</a>.</p>
      </main>
    </div>
  </body>
</html>
`;
}

async function ensureDir(p) { await mkdir(p, { recursive: true }); }

async function main() {
  if (!existsSync(DIST)) {
    console.error('build-tool-pages: dist/ does not exist. Run after the main build copies static assets.');
    process.exit(1);
  }
  // Clean any prior tool pages so a removed tile does not linger in dist/.
  const toolsDir = join(DIST, 'tools');
  if (existsSync(toolsDir)) await rm(toolsDir, { recursive: true, force: true });
  await ensureDir(toolsDir);

  const [tiles, descriptions, meta] = await Promise.all([
    loadUtilities(), loadDescriptions(), loadMeta(),
  ]);

  // spec-v76: the discovery-surface allowlists (classify()) are matched only
  // against live tiles, so a dead id in them is silently inert: exactly the
  // drift that let seven spec-v29-removed ids linger here. Assert every
  // allowlisted id is a live tile so any future removal fails the build loudly
  // instead of leaving a misleading "deliberate choice" comment behind.
  const liveIds = new Set(tiles.map((t) => t.id));
  const orphanAllowlistIds = [...HOW_TO_TILES, ...DATASET_TILES, ...REFERENCE_TILES]
    .filter((id) => !liveIds.has(id));
  if (orphanAllowlistIds.length > 0) {
    throw new Error(
      `build-tool-pages: classify() allowlist names ${orphanAllowlistIds.length} non-catalog tile id(s): ` +
        `${orphanAllowlistIds.join(', ')}. Remove them from HOW_TO_TILES/DATASET_TILES/REFERENCE_TILES ` +
        `or restore the tile in UTILITIES (app.js).`,
    );
  }

  let written = 0;
  let withCopy = 0;
  let withRealDesc = 0;
  for (const tile of tiles) {
    const copy = await loadToolCopy(tile.id);
    if (copy) withCopy += 1;
    // The homepage tile grid (the old source of `tc-desc`) was retired, so
    // every page had been falling back to a generic "a deterministic tool in
    // ... group" line -- as the visible lede AND as the meta / OG / JSON-LD
    // description on all ~1,500 pages. Prefer the hand-authored copy, then the
    // first sentence of the MCP adapter summary, which is specific per tile.
    // `corpusOneLiner` cuts at a character budget and the call site used to
    // append a period, which on 188 tiles produced a sentence that simply
    // stopped -- "wound type (clean and minor vs." -- and read as finished.
    // A lede is one sentence, so take the whole first sentence instead; only
    // ellipsize when that single sentence is itself too long to lead with.
    //
    // The 127 tiles with hand-authored copy print it again under "What this
    // is", so a lede lifted from it says the same sentence twice on one
    // screen. Take that sentence out of the section when it fits as a lede;
    // when it is too long to lead with, lead with the adapter summary instead
    // and leave the section whole -- rather than showing a clipped version of
    // a paragraph the reader is about to read in full.
    const hand = (copy?.whatThisIs || '').trim();
    const summary = (descriptions.get(tile.id) || mcpRecord(tile.id)?.summary || '').trim();
    const handParts = hand ? splitLead(hand) : null;
    const handLead = handParts ? handParts.lead : hand;

    let desc = '';
    let whatThisIs = hand;
    if (hand && (handLead.length <= LEDE_MAX || !summary)) {
      // Take the whole first sentence, however long, when there is no adapter
      // summary to lead with instead: a long lede beats a clipped copy of a
      // paragraph printed in full three inches below it.
      desc = /[.!?]$/.test(handLead) ? handLead : `${handLead}.`;
      whatThisIs = handParts ? handParts.rest : '';
    } else if (summary) {
      desc = leadSentence(summary);
    }
    if (!desc) {
      desc = `${tile.name} - a deterministic tool in Sophie Well's ${GROUP_LABELS[tile.group] || tile.group} group.`;
    } else {
      withRealDesc += 1;
    }
    const html = buildPageHtml({
      tile,
      desc,
      meta: meta[tile.id],
      related: pickRelated(tiles, tile),
      copy,
      whatThisIs,
    });
    const out = join(toolsDir, tile.id);
    await ensureDir(out);
    await writeFile(join(out, 'index.html'), html, 'utf8');
    written += 1;
  }
  console.log(`build-tool-pages: wrote ${written} pre-rendered tool pages under dist/tools/ (${withCopy} with hand-authored copy, ${withRealDesc} with a tile-specific description).`);
}

main().catch((err) => { console.error('build-tool-pages: failed', err); process.exit(1); });
