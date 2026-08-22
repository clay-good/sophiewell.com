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
import { TOPICS } from './lib/topics.mjs';
// The MCP registry is the machine-readable field list for every exposed tile
// (label + kind per input). It is the only place the inputs are enumerated
// outside the DOM, so the page's "What you enter" list is generated from it
// rather than hand-written or guessed.
import { getCalculator } from '../mcp/catalog.js';
import { splitLead } from '../lib/long-note.js';
// The option TEXT behind an example's raw `<option value>`, read out of the
// view that builds the select. See scripts/lib/option-labels.mjs.
import { loadOptionLabels, loadFieldLabels, optionText, looseOptionText } from './lib/option-labels.mjs';
import { depthAt, fieldName, outsideBrackets, stripLegend } from './lib/tile-line.mjs';
// The tab is written in lib/ because the app writes the same one; see the
// note there for why they cannot be two rules.
import { BRAND, TITLE_MAX, clampTitle, pageTitle } from '../lib/page-title.js';
import { tileName } from './lib/tile-name.mjs';

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
  P: 'Revenue Cycle & Utilization',
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
    const name = tileName(line);
    const group = line.match(/group:\s*'([^']+)'/);
    if (id && name && group) {
      tiles.push({ id: id[1], name, group: group[1] });
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

// The specialty tags the search corpus already derives per tile, reused here
// to decide which tiles are related. Built one step earlier in build.mjs; a
// missing file leaves the tags empty and the picker falls back to the group.
async function loadSpecialties() {
  const file = join(ROOT, 'data', 'search-corpus', 'corpus.json');
  const map = new Map();
  if (!existsSync(file)) return map;
  const rows = JSON.parse(await readFile(file, 'utf8'));
  for (const [id, row] of Object.entries(rows)) {
    if (Array.isArray(row?.specialties)) map.set(id, row.specialties);
  }
  return map;
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

// What the button says it opens. It used to name the tile -- "Open the 2022
// ACR/EULAR Eosinophilic Granulomatosis with Polyangiitis Classification
// Criteria →", 95 characters, wrapping to three lines on a phone, directly
// under an <h1> that had just said the same words. 695 buttons ran past 50
// characters saying nothing the heading had not.
//
// The visible text says what clicking does; the full name stays on the link
// as its accessible name, so a screen reader listing the page's links still
// hears which tool this one opens.
const OPEN_NOUN = {
  calculator: 'calculator',
  howto: 'generator',
  dataset: 'reference table',
  reference: 'reference',
};

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

// The search-result snippet. Same rule: the sentence the tile wrote about
// itself comes first, and the pitch is appended only when it fits whole. It
// used to be appended first, so 1378 snippets ended on a chopped fragment of
// it -- "…>=3 high. Free, runs…" -- after a description that had already
// finished its own sentence.
const DESC_MAX = 158;
const PITCH = 'Free, runs in your browser, no signup, no tracking. Sophie Well.';
function pageDescription(desc) {
  const text = /[.!?]$/.test(desc.trim()) ? desc.trim() : `${desc.trim()}.`;
  const full = `${text} ${PITCH}`;
  if (full.length <= DESC_MAX) return full;
  if (text.length <= DESC_MAX) return text;
  return clampDescription(text);
}

// The visible lede: the first whole sentence of whatever the tile says about
// itself. Ends where the author ended it, so it never reads as a thought that
// was cut off. A first sentence long enough to be its own paragraph is trimmed
// with an ellipsis, which at least admits there is more.
const LEDE_MAX = 220;
function leadSentence(text, name = '') {
  const lead = (splitLead(text)?.lead || text).trim();
  if (lead.length <= LEDE_MAX) return /[.!?]$/.test(lead) ? lead : `${lead}.`;
  // Too long to lead with. These sentences carry their own break -- a colon
  // before the enumeration, a dash before the caveat -- so cut there and end on
  // a full stop rather than trailing off inside a parenthetical list of option
  // values the reader has no use for.
  return clauseLede(lead, name);
}

// The name, stripped of the citation these summaries append to it, so
// "ATRIA Stroke Risk Score (Singer 2013)" can be recognised as the name of the
// tile called "ATRIA Stroke Risk Score".
const bare = (s) => s.replace(/\s*\([^()]*\)\s*$/, '').replace(/[^a-z0-9]/gi, '').toLowerCase();

// "APACHE II score" against a tile called "APACHE II (ICU mortality estimate)":
// the clause is the name plus a generic noun, and it still says nothing the
// heading did not. Exact equality misses those, so a short remainder counts as
// the same thing. A clause carrying real content runs far longer than this.
const NAME_SLACK = 10;

// Shorter than this, minus any trailing citation, and a clause is a title.
const MIN_CONTENT = 45;
function restatesName(clause, name) {
  const a = bare(clause);
  const b = bare(name);
  if (!a || !b) return false;
  if (a === b) return true;
  return (a.startsWith(b) && a.length - b.length <= NAME_SLACK)
    || (b.startsWith(a) && b.length - a.length <= NAME_SLACK);
}

// A boundary inside an unclosed bracket is not a boundary. "Frontal Assessment
// Battery (FAB; Dubois 2000)" carries its citation semicolon *within* the
// parenthesis, and cutting there published "Frontal Assessment Battery (FAB."
// -- a lede with a bracket it never closes. Seven tiles read that way, so
// every cut below is checked with `depthAt` or moved with `outsideBrackets`.

// The opening clause of a long sentence. These sentences are built the same
// way -- a clause naming the tool, then a colon or a dash, then the list of
// everything it covers -- so the boundary is usually already written into the
// text. Falling back to a word-boundary cut keeps the ones that are not.
function clauseLede(text, name = '') {
  // Every boundary, not just the first: on 15 tiles the first one sits
  // immediately after the tile's own name, and cutting there published a lede
  // that repeated the <h1> directly above it and said nothing else --
  // "ATRIA Stroke Risk Score (Singer 2013)." under a heading reading "ATRIA
  // Stroke Risk Score". The next boundary along carries the content.
  for (const m of text.matchAll(/:| - |;/g)) {
    const at = m.index;
    if (at < 24) continue;
    if (at > LEDE_MAX) break;
    if (depthAt(text, at) > 0) continue;
    const clause = text.slice(0, at).trimEnd().replace(/[,:;-]+$/, '');
    if (name && restatesName(clause, name)) continue;
    // A clause that is nothing but a title and its citation is the heading
    // again, whatever words it happens to use. `restatesName` matches on the
    // name and so misses the ones written in a different order ("Predicted
    // six-minute walk distance" under "6-Minute Walk Distance (Predicted)").
    // Below this length there is no room for a clause to say anything else.
    if (clause.replace(/\s*\([^()]*\)\s*$/, '').trim().length < MIN_CONTENT) continue;
    return `${clause}.`;
  }
  // No boundary to cut at. Before trailing off, drop the enumerations these
  // sentences carry: a bracket or a pair of dashes holding a comma-separated
  // run of every input. The page lists those same inputs under "What you
  // enter" a few lines down, so the lede was spending its whole length -- and
  // then running out of it -- on a list the reader is about to read anyway.
  // Removing a bracketed aside cannot ungrammatical the sentence around it,
  // and on 27 tiles what is left is a whole sentence that fits.
  const trimmed = dropEnumerations(text);
  if (trimmed.length <= LEDE_MAX && trimmed.length >= MIN_LEDE) {
    return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  }
  // Still too long, so it does get cut. Cut between items rather than inside
  // one: a word-boundary cut lands mid-criterion and publishes a lede ending
  // "venous invasion, sinusoidal…" or "temperature < 36 C, altered…", which
  // reads as a fact the page got half-way through stating.
  const cut = trimmed.slice(0, LEDE_MAX);
  let comma = -1;
  for (const m of cut.matchAll(/,/g)) if (depthAt(trimmed, m.index) === 0) comma = m.index;
  if (comma > LEDE_MAX * 0.6) return `${trimmed.slice(0, comma).trimEnd()},…`;
  const sp = cut.lastIndexOf(' ');
  const at = sp > LEDE_MAX * 0.6 ? sp : cut.length;
  return `${trimmed.slice(0, outsideBrackets(trimmed, at)).trimEnd().replace(/[,;:\u2014-]+$/, '')}…`;
}

// Below this a lede has been cut down to a stub and says less than the cut
// sentence did; keep the sentence and ellipsize it instead.
const MIN_LEDE = 40;

// A parenthesis, bracket, or dash pair holding a comma-separated run: the
// enumeration, not an aside. Two commas is the floor -- one comma is a pair
// ("(violent / non-violent)", "(Wesson & Ling 2003)"), which is content.
function dropEnumerations(text) {
  return text
    .replace(/\s*\((?:[^()]*,){2,}[^()]*\)/g, '')
    .replace(/\s*\[(?:[^[\]]*,){2,}[^[\]]*\]/g, '')
    .replace(/\s+\u2014(?:[^\u2014]*,){2,}[^\u2014]*\u2014/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim();
}

// The search-result snippet. Held to the same rule as everything else that
// gets cut: it closes what it opens. 85 descriptions did not, so the snippet
// Google shows read "(unilateral weakness 2, speech disturbance without…".
function clampDescription(s, max = DESC_MAX) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  // Cut between items rather than inside one, the same way the lede does: a
  // word-boundary cut lands mid-criterion and the snippet reads "clinical, and
  // radiographic findings, stages…" instead of stopping where the list did.
  let comma = -1;
  for (const m of cut.matchAll(/,/g)) if (depthAt(s, m.index) === 0) comma = m.index;
  if (comma > max * 0.6) return `${s.slice(0, comma).trimEnd()},…`;
  const lastSpace = cut.lastIndexOf(' ');
  const at = outsideBrackets(s, lastSpace > 100 ? lastSpace : cut.length);
  return `${s.slice(0, at).trimEnd().replace(/[,;:([-]+$/, '').trimEnd()}…`;
}

// The visible input list, generated from the MCP field registry. Long lists
// are truncated so the page stays scannable; the tool itself always shows
// every field.
// A cap that absorbs a single item of overflow. "and 1 more field" costs the
// same line as the field it hides, and hides it -- so a ninth input, or an
// eleventh example row, is shown rather than counted. Only overflow of two or
// more is worth a summary line.
function absorbOne(items, cap) {
  return items.length === cap + 1 ? items.length : cap;
}

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
// Rows past this go into a disclosure under the table, not into a count of
// them. 46 pages used to print ten values, say "and 19 more fields", and then
// state a result the reader had no way to reproduce.
// Rows whose label names the method rather than a reading of the result.
// A closed stoplist, not a shape test: "Lower HOMA-IR indicates greater insulin
// sensitivity" has no numeric range and is still a reading, so only these
// labels move.
const METHOD_ROWS = new Set([
  'formula', 'equation', 'calculation', 'derivation', 'method',
  'scoring', 'points', 'weights', 'coefficients',
  'components', 'factors', 'items', 'inputs', 'variables', 'structure',
  'model', 'rule', 'criteria', 'range', 'denominator',
]);

const MAX_EXAMPLE_ROWS = 10;

// A field label leads with the name of the thing and then qualifies it, so the
// lead worth keeping is often just two words ("Patient age.") and sometimes
// one ("Tremor.", "Fever.", "Sex."). The paragraph default would refuse those
// as fragments and print the whole label -- the qualification included -- so
// the floor here is a single short word rather than a phrase.
const FIELD_MIN_LEAD = 4;

// The name of the thing, not the explanation of it. Field labels lead with a
// noun phrase and then qualify it; the example row wants only the noun phrase,
// without the trailing scale legend that several instruments append.
function shortLabel(raw) {
  const text = stripLegend(raw);
  if (!text) return '';
  const lead = (splitLead(text, { minLead: FIELD_MIN_LEAD })?.lead || text).trim();
  const stripped = lead.replace(/\s*[([][^()[\]]*[)\]]\s*\.?$/, '').trim();
  return fieldName(stripped || lead);
}

// The same name, on five rows, with five different values.
//
// A field label names a group and then the item inside it -- "PAIN subscale.
// Pain at its worst", "Resting symmetry: Eye", "Head / neck: erythema" -- and
// `shortLabel` keeps the group, which is the right answer right up until the
// tile has five of them. Then the example prints "PAIN subscale" five times
// over and the reader cannot tell which row is which. 83 rows across 20 pages
// read that way.
//
// So each row carries a second, longer candidate, and only the rows that
// actually collide fall back to it. Nothing is lengthened that did not need to
// be: a tile with one "Head / neck" row still prints "Head / neck".
const MAX_ITEM = 44;
function itemName(raw) {
  // A legend the reader does not need, here in the middle of the label rather
  // than at the end: "Edema [0 = Absent; 1 = Present - loss of normal vascular
  // markings]. Contributes up to 1 point." The item is "Edema".
  const plain = String(raw || '').replace(/\s*\[[^\]]*?\s=\s[^\]]*\]/g, '');
  let s = (splitLead(plain, { minLead: FIELD_MIN_LEAD })?.lead || plain).trim();
  s = s.replace(/\s*[([][^()[\]]*[)\]]\s*\.?$/, '').replace(/[.:;,-]+$/, '').trim();
  // The item carries its own break before its gloss -- a comma or a dash --
  // so cutting there ends on a whole phrase instead of an ellipsis.
  if (s.length > MAX_ITEM) {
    // Only a break the label itself made. The commas inside a scale legend
    // are not breaks in the label: cutting at the first one published
    // "animal naming in 1 minute (0-4 animals = 0", a bracket opened around
    // a legend and then abandoned one value in.
    const breaks = [s.indexOf(','), s.indexOf(' - ')].filter((i) => i >= 8 && depthAt(s, i) === 0);
    if (breaks.length) s = s.slice(0, Math.min(...breaks)).trim();
  }
  if (s.length <= MAX_ITEM) return s;
  const cut = s.slice(0, MAX_ITEM - 1);
  const sp = cut.lastIndexOf(' ');
  const at = outsideBrackets(s, sp > 20 ? sp : cut.length);
  return `${s.slice(0, at).trimEnd().replace(/[,;:([]+$/, '').trimEnd()}\u2026`;
}

// `<group>: <item>` and `<group>. <item>`, the two ways these labels are
// written. Falls back to the short name when the label has no such split --
// then the collision is in the source and no cut can undo it.
function qualifiedLabel(raw) {
  const text = stripLegend(raw);
  const m = text.match(/^(.{4,70}?)(\s-|[:.,?])\s+([\s\S]+)$/);
  if (m) {
    const item = itemName(m[3]);
    // A dash separates with a space on both sides; a colon or comma does not.
    const sep = m[2].trim() === '-' ? ' -' : m[2].trim();
    if (item) return `${m[1].trim()}${sep} ${item}`;
  }
  // No group to qualify with. Then the label is already just a name, and what
  // made two of them identical was `shortLabel` stripping the trailing
  // parenthetical -- which on these is the whole discriminator: "Maxillary (R)"
  // and "Maxillary (L)" both came out "Maxillary". Keep it.
  return fieldName(text) || shortLabel(raw);
}

// Give every row the shortest label that still tells it apart from its
// siblings. Rows that are unique at the short form keep it.
function decollide(rows) {
  const count = new Map();
  for (const r of rows) count.set(r.label, (count.get(r.label) || 0) + 1);
  for (const r of rows) {
    if (count.get(r.label) > 1 && r.full) {
      const longer = qualifiedLabel(r.full);
      if (longer && longer !== r.label) r.label = longer;
    }
    delete r.full;
  }
  return rows;
}

// A unit belongs on a measurement, not on a yes/no or a picked option. A
// checkbox is stored as `1` / `true` / `yes` depending on the tile, and none of
// those is what the reader sees on screen -- a row reading "Heart rate > 100:
// 1" states a count, not a checked box.
const BOOL_TRUE = new Set(['1', 'true', 'yes', 'y', 'on']);

// An option text is written to be read inside a picklist, where the reader has
// the field label above it and room for a parenthetical. In a two-column
// example row it only has to identify which option was picked, so a long one
// is cut at a word boundary rather than pushing the value column off screen.
const MAX_OPTION_TEXT = 72;
function clampOption(text) {
  if (text.length <= MAX_OPTION_TEXT) return text;
  const cut = text.slice(0, MAX_OPTION_TEXT - 1);
  const sp = cut.lastIndexOf(' ');
  const at = outsideBrackets(text, sp > 40 ? sp : cut.length);
  return `${text.slice(0, at).trimEnd().replace(/[,;:([]+$/, '').trimEnd()}\u2026`;
}

function exampleValue(field, raw, tileOptions) {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  if (field.kind === 'bool' || field.kind === 'boolean') {
    return BOOL_TRUE.has(value.toLowerCase()) ? 'Yes' : 'No';
  }
  // An enum whose option is literally "yes" or "no" is the same answer written
  // as a picklist rather than a checkbox; print it the same way.
  const YES_NO = { yes: 'Yes', no: 'No', true: 'Yes', false: 'No' };
  if (YES_NO[value.toLowerCase()]) return YES_NO[value.toLowerCase()];
  // What the reader would have picked on screen, when the select behind this
  // field can be identified with certainty. Otherwise the raw value stands.
  const picked = optionText(tileOptions, field, value);
  if (picked) return clampOption(picked);
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

// The tiles with no MCP adapter -- document builders, timers, question flows.
// There is no field registry to read a label off, so the label comes from the
// view that builds the field. Every example key has to resolve: a partial join
// would print some of the values behind a result and silently drop the rest.
// A free-text example value can carry newlines (a wallet card's medication
// list) and can be long; both are normalized for a one-line table cell.
const MAX_FREE_TEXT = 90;
function freeTextValue(raw) {
  const value = String(raw ?? '').replace(/\s*\n\s*/g, '; ').trim();
  if (value.length <= MAX_FREE_TEXT) return value;
  const cut = value.slice(0, MAX_FREE_TEXT - 1);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > 50 ? cut.slice(0, sp) : cut).trimEnd()}\u2026`;
}

function viewExampleRows(tileId, meta, fieldLabels, optionLabels) {
  const fields = meta?.example?.fields;
  if (!fields || typeof fields !== 'object') return null;
  const labels = fieldLabels?.get(tileId);
  const options = optionLabels?.get(tileId);
  if (!labels) return null;
  const rows = [];
  for (const [dom, raw] of Object.entries(fields)) {
    const label = labels.get(dom);
    if (!label) return null; // partial join would misstate the example
    const value = String(raw ?? '').trim();
    if (!value) continue;
    const picked = looseOptionText(options, dom, value);
    // A checkbox stores `on`; the reader ticked a box, they did not type "on".
    const shown = picked || (BOOL_TRUE.has(value.toLowerCase()) ? 'Yes' : freeTextValue(value));
    rows.push({ label: shortLabel(label), value: shown, full: label });
  }
  return rows.length ? decollide(rows) : null;
}

function exampleRows(tileId, meta, optionLabels) {
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
    const value = exampleValue(field, raw, optionLabels?.get(tileId));
    // An empty example value is a select left on its blank default (seven
    // tiles do this, where blank means "no"). The reader types nothing there,
    // so the row is left out rather than printed as an empty cell.
    if (!label || !value) continue;
    rows.push({ label, value, full: field.label });
  }
  return rows.length ? decollide(rows) : null;
}

// spec-v751: tile id -> the topic hub that lists it, so the static page can
// carry the link the home page no longer does. Built once; a tile in no topic
// simply gets no link.
const TOPIC_BY_TILE = new Map();
for (const topic of Object.values(TOPICS)) {
  for (const id of topic.tiles) if (!TOPIC_BY_TILE.has(id)) TOPIC_BY_TILE.set(id, topic);
}

// --- "Related tools": four links picked from what this tile has in common
// with the others, rather than from the order they happen to sit in.
//
// The list used to be the first four tiles sharing a group. A group holds
// hundreds of tiles, so the group chose the list and the tile did not: 1201
// of 1563 pages carried the identical four links, and a nurse finishing the
// DOLOPLUS-2 pain scale was pointed at APGAR, ABG, and Wells PE.
//
// Two signals, both already in the build. The search corpus tags every tile
// with its specialties, which is what puts a stroke score next to other
// stroke work. And the tile's own name, which is what catches the siblings no
// tag can tell apart -- "Wells Score for PE" and "Wells Score for DVT" share
// every specialty they have with 300 other tiles, and share "wells" with one.
//
// Both are weighted by how rare the term is across the catalog, so sharing
// "toxicology" counts and sharing "internal-medicine" (365 tiles) barely
// does. That falls out of one number and needs no stopword list: "score",
// "index", and "risk" are common enough to weigh nothing on their own.
const RELATED_MAX = 4;

function termsOf(tile, specialties) {
  const terms = new Set();
  for (const w of String(tile.name || '').toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length >= 2) terms.add(`n:${w}`);
  }
  for (const sp of specialties.get(tile.id) || []) terms.add(`s:${sp}`);
  return terms;
}

// log(N / documents holding the term): zero for a term on every tile, largest
// for one on a handful.
function inverseFrequency(termsByTile, total) {
  const seen = new Map();
  for (const terms of termsByTile.values()) {
    for (const t of terms) seen.set(t, (seen.get(t) || 0) + 1);
  }
  const idf = new Map();
  for (const [t, n] of seen) idf.set(t, Math.log(total / n));
  return idf;
}

function buildRelatedIndex(tiles, specialties) {
  const termsByTile = new Map(tiles.map((t) => [t.id, termsOf(t, specialties)]));
  return { termsByTile, idf: inverseFrequency(termsByTile, tiles.length || 1) };
}

function pickRelated(tiles, current, index, meta, max = RELATED_MAX) {
  // The hand-picked siblings first. `META[id].related` is what the app itself
  // links to under "Related tools", so the two surfaces named different tools
  // for the same tile -- and the app's were chosen by a person. 1462 tiles
  // have them, a median of two each, which is why the scorer still runs: it
  // tops the list up to four rather than replacing a curated choice.
  const byId = new Map(tiles.map((t) => [t.id, t]));
  const picked = [];
  for (const rid of Array.isArray(meta?.related) ? meta.related : []) {
    const t = byId.get(rid);
    if (t && t.id !== current.id && !picked.includes(t)) picked.push(t);
    if (picked.length >= max) return picked;
  }

  const mine = index.termsByTile.get(current.id) || new Set();
  const scored = [];
  for (const t of tiles) {
    if (t.id === current.id || picked.includes(t)) continue;
    let score = 0;
    for (const term of index.termsByTile.get(t.id) || []) {
      if (mine.has(term)) score += index.idf.get(term) || 0;
    }
    // A tile in the same group is the same kind of thing -- a score, a drip,
    // a form -- which breaks ties the terms leave level without ever
    // outweighing a real shared term.
    if (t.group === current.group) score += 0.25;
    if (score > 0.25) scored.push([score, t]);
  }
  // Sort by id under equal scores so the same catalog always builds the same
  // page; `dist/` is compared byte-for-byte between builds.
  scored.sort((a, b) => b[0] - a[0] || (a[1].id < b[1].id ? -1 : 1));
  picked.push(...scored.slice(0, max - picked.length).map(([, t]) => t));
  // A tile that shares nothing measurable still gets neighbors, as before.
  if (picked.length < max) {
    for (const t of tiles) {
      if (picked.length >= max) break;
      if (t.id !== current.id && t.group === current.group && !picked.includes(t)) picked.push(t);
    }
  }
  return picked;
}

// --- Per-tile prose block (templated). The blocks reuse what META
// already says when META has it, otherwise fall back to the tile
// description. Hand-authored copy can replace any of these in a
// later PR by reading from `data/tool-copy/<id>.json` (not wired here).
function buildPageHtml({ tile, desc, meta, related, copy, whatThisIs, optionLabels, fieldLabels }) {
  // A group with no label here printed its bare letter: `pa-lint` read
  // "Home / P / Prior-Auth Packet Linter" in the breadcrumb, in the JSON-LD
  // breadcrumb, and in the page keywords, while the app said "Revenue Cycle &
  // Utilization". Falling back to the letter is what let that ship, so a group
  // this map does not know is now a build failure.
  const groupLabel = GROUP_LABELS[tile.group];
  if (!groupLabel) throw new Error(`build-tool-pages: no label for group '${tile.group}' (${tile.id})`);
  const seoTitle = pageTitle(tile.name);
  const seoDesc = pageDescription(desc);
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

  // spec-v751: the home page's "browse by category" nav is gone -- the app takes
  // a question now, it does not offer a menu -- and it was the only internal
  // link into the eight /topics/<slug>/ hubs. Those hubs are search-landing
  // pages, not app navigation, so they stay; this one line on the static page
  // keeps them linked. The SPA never renders it.
  const topic = TOPIC_BY_TILE.get(tile.id);
  const topicHtml = topic
    ? `<p class="tp-topic muted">More in <a href="${SITE}/topics/${topic.slug}/">${esc(topic.label)}</a>.</p>`
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

  // The worked example, when the example's fields join cleanly to the field
  // registry. Where they don't, fall back to stating the expected output on
  // its own -- less useful, but honest about what the page knows.
  const metaRows = exampleRows(tile.id, meta, optionLabels)
    || viewExampleRows(tile.id, meta, fieldLabels, optionLabels);
  const example = (metaRows && meta?.example?.expected)
    ? { rows: metaRows, result: meta.example.expected, prefilled: true }
    : (copyExample(copy) ? { ...copyExample(copy), prefilled: false } : null);
  const shownRows = example ? example.rows.slice(0, absorbOne(example.rows, MAX_EXAMPLE_ROWS)) : [];
  const extraRows = example ? example.rows.length - shownRows.length : 0;

  // One field per line, not a semicolon-joined run-on: a reader scanning for
  // "do I have the values for this?" wants a list. Each line is trimmed to its
  // first sentence, because the field descriptions carry a second and third
  // sentence of qualification that belongs one click away rather than in the
  // way. Nothing is dropped: if any line was trimmed, the full descriptions
  // sit under a disclosure directly below.
  //
  // The cap is at least the number of fields the worked example just named.
  // The example holds ten rows and this list held eight, so on 105 pages the
  // list hid two fields the reader had read the names of a few lines further
  // up -- `alsfrs-r` listed "Climbing stairs" in the example and then said
  // "and 3 more fields" without it.
  const labels = inputLabels(tile.id);
  const listCap = Math.max(MAX_LISTED_INPUTS, shownRows.length);
  const shownLabels = labels.slice(0, absorbOne(labels, listCap));
  const hiddenLabels = labels.slice(shownLabels.length);
  // The value legend goes first: it is the picklist the reader is looking at,
  // and its inline periods otherwise end the first-sentence trim inside the
  // brackets ("... 0 = None of the time." with the bracket left open).
  const leads = shownLabels.map((l) => {
    const t = stripLegend(l);
    return splitLead(t, { minLead: FIELD_MIN_LEAD })?.lead || t;
  });
  // Only the lines that were actually shortened. Emitting all of them put 42
  // rows on 18 pages into the disclosure byte-for-byte identical to the line
  // already above it -- `alsfrs-r` printed seven of its eight fields twice on
  // one screen, ~250 words of it, because one other field happened to be
  // trimmed.
  const trimmedLabels = shownLabels.filter((l, i) => leads[i] !== l);
  // The disclosure holds whatever the visible list could not: the fields past
  // the cap, and the full text of the lines it shortened. It used to hold only
  // the second of those, and the first was a dead end -- 145 pages ended the
  // list with "and 46 more fields" and never named one of them, so a reader
  // asking "do I have the values for this?" could not answer it. Collapsed, so
  // the page stays one screen; present, so the page states every input.
  const detailRows = [...trimmedLabels, ...hiddenLabels];
  const detailSummary = hiddenLabels.length
    ? `The other ${hiddenLabels.length} field${hiddenLabels.length === 1 ? '' : 's'}`
    : 'Full field descriptions';
  const fullHtml = detailRows.length
    ? `\n          <details class="tp-io-full">
            <summary>${detailSummary}</summary>
            <ul>${detailRows.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
          </details>`
    : '';
  const inputsBody = shownLabels.length
    ? `<ul class="tp-io-list">${leads.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>${fullHtml}`
    : (copy?.inputs ? `<p>${esc(copy.inputs)}</p>` : '');
  const outputText = example
    ? esc(copy?.output || '')
    : (meta?.example?.expected ? esc(meta.example.expected) : esc(copy?.output || ''));
  // Only promise a pre-filled example when there is a worked example behind
  // it. A tile whose output line came from hand-authored copy has no META
  // example to pre-fill from, so the line would be a claim the tool does not
  // keep.
  // ... and only when there is something pre-filled to point at. Four pages
  // printed the line with no example above it and nothing filled in below:
  // `cam`, `mnihss`, and `pa-lint` name no example fields at all -- pa-lint
  // takes dropped files, so there are no values to replace -- and the reader
  // was told to overwrite an example the page never showed.
  const prefilledFields = Object.keys(meta?.example?.fields || {}).length > 0;
  const exampleLine = (!example && prefilledFields && meta?.example?.expected)
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

  // What the number means, which is the other half of "what comes out" and the
  // half a reader cannot infer from one worked example. 1383 of 1540 tiles
  // carry the source's own band table in META.interpretation -- a median of two
  // rows, none longer than 200 characters -- and none of it reached the page.
  // Rendered whole rather than capped: the widest table is 14 rows on one tile,
  // and a band table with rows missing is a scale that lies about its own ends.
  const allBands = (meta?.interpretation?.bands || [])
    .filter((b) => b && (b.range || b.range === 0) && b.text);
  // Half the rows under that heading were not readings. 467 of them across 411
  // tiles are labelled "Formula", "Points", "Components" and hold the algebra
  // -- "DTS = exercise time(min) - (5 x ST deviation mm) - ..." -- which is how
  // the number is produced, not what it means. A reader scanning for their
  // score met an equation first. They keep their place on the page, one click
  // down, under a heading that says what they are.
  const bands = allBands.filter((b) => !METHOD_ROWS.has(String(b.range).trim().toLowerCase()));
  const methodRows = allBands.filter((b) => METHOD_ROWS.has(String(b.range).trim().toLowerCase()));
  const bandsHtml = bands.length
    ? `<section class="tp-bands" aria-labelledby="tp-bands-h">
          <h2 id="tp-bands-h">What the result means</h2>
          <dl class="tp-bands-dl">
${bands.map((b) => `            <div class="tp-bands-row"><dt>${esc(String(b.range))}</dt><dd>${esc(b.text)}</dd></div>`).join('\n')}
          </dl>
        </section>`
    : '';
  const methodHtml = methodRows.length
    ? `<details class="tp-method">
          <summary>How it is calculated</summary>
          <dl class="tp-bands-dl">
${methodRows.map((b) => `            <div class="tp-method-row"><dt>${esc(String(b.range))}</dt><dd>${esc(b.text)}</dd></div>`).join('\n')}
          </dl>
        </details>`
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
          </dl>${extraRows > 0 ? `\n          <details class="tp-ex-more">
            <summary>The other ${extraRows} value${extraRows === 1 ? '' : 's'}</summary>
            <dl class="tp-ex-dl">
${example.rows.slice(shownRows.length).map((r) => `              <div class="tp-ex-row"><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`).join('\n')}
            </dl>
          </details>` : ''}
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
          <a class="tp-open" href="${hashUrl}" aria-label="Open the ${esc(tile.name)}">Open the ${OPEN_NOUN[kind] || 'tool'} →</a>
          <span class="muted">Runs in your browser. Nothing you type leaves your device.</span>
        </p>

        ${exampleHtml}

        ${bandsHtml}

        ${howHtml}

        ${methodHtml}

        ${whatHtml}

        ${whenHtml}

        <details class="tp-refs">
          <summary>Citation and sources</summary>
          ${citationHtml}
          ${sourceHtml}
          <p class="muted">A reference and educational tool. Not medical, legal, or financial advice, and not a substitute for clinician judgment.</p>
        </details>

        ${relatedHtml}

        ${topicHtml}

        <p class="tp-all muted"><a href="${SITE}/tools/">Browse all tools</a></p>

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
  const optionLabels = await loadOptionLabels();
  const fieldLabels = loadFieldLabels();
  const relatedIndex = buildRelatedIndex(tiles, await loadSpecialties());

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
    if (hand && handLead.length <= LEDE_MAX) {
      desc = /[.!?]$/.test(handLead) ? handLead : `${handLead}.`;
      whatThisIs = handParts ? handParts.rest : '';
    } else if (hand && !summary) {
      // A long first sentence and no adapter summary to lead with instead.
      // Twenty-seven pages led with one of these; the worst ran 663
      // characters, an eight-line paragraph standing where the one line
      // saying what the tool does belongs. Lead with the clause that names
      // the tool and leave the whole sentence in "What this is", so the
      // enumeration the reader skipped is still a scroll away.
      desc = clauseLede(handLead);
      whatThisIs = hand;
    } else if (summary) {
      desc = leadSentence(summary, tile.name);
    }
    if (!desc) {
      desc = `${tile.name} - a deterministic tool in Sophie Well's ${GROUP_LABELS[tile.group]} group.`;
    } else {
      withRealDesc += 1;
    }
    const html = buildPageHtml({
      tile,
      desc,
      meta: meta[tile.id],
      related: pickRelated(tiles, tile, relatedIndex, meta[tile.id]),
      copy,
      whatThisIs,
      optionLabels,
      fieldLabels,
    });
    const out = join(toolsDir, tile.id);
    await ensureDir(out);
    await writeFile(join(out, 'index.html'), html, 'utf8');
    written += 1;
  }
  console.log(`build-tool-pages: wrote ${written} pre-rendered tool pages under dist/tools/ (${withCopy} with hand-authored copy, ${withRealDesc} with a tile-specific description).`);
}

main().catch((err) => { console.error('build-tool-pages: failed', err); process.exit(1); });
