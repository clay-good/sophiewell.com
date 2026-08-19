// The one-line tile description used on the hub and topic pages.
//
// These pages are lists: a heading, then one line per tool. The line used to
// be the first 110 characters of the tile's prose with `...` stuck on the end,
// which meant 3,225 of the 3,329 rows across those pages ended mid-clause --
// "Compute corrected QT interval using four published formulas - Bazett,
// Fridericia, Framingham, and Hodges -...".
//
// Worse, a tile whose first sentence was *already* short enough got the
// ellipsis too, because the test was against the whole summary rather than
// against the sentence: "Score the Wells criteria for pulmonary embolism..."
// is a finished sentence wearing a cut mark.
//
// So: take the first sentence. If it fits the line budget, that is the line,
// full stop and all. Only a sentence too long to print is clamped, and only
// then does the row end in an ellipsis -- which now means what it says.

import { splitLead } from '../../lib/long-note.js';

// A sentence up to this long still reads as one line in the list. Measured
// across the catalog: 387 of 1,564 tiles lead with a sentence this short.
const SENTENCE_MAX = 130;

// Where a sentence has to be cut, cut here. Shorter than SENTENCE_MAX so a
// clamped row is visibly shorter than a whole one rather than the same length
// with a mark on the end.
const CLAMP_AT = 110;

// A clause shorter than this names too little to be a row on its own -- "MELD
// 3.0" is not a description. Below it, fall through to the character clamp.
const MIN_CLAUSE = 22;

// A row that restates the name printed directly above it says nothing. The
// name is passed in so the clause cut can be refused when it lands there.
const sameAs = (a, b) => a.replace(/[^a-z0-9]/gi, '').toLowerCase() === b.replace(/[^a-z0-9]/gi, '').toLowerCase();

export function tileLine(text, { name = '' } = {}) {
  const full = (text || '').trim();
  if (!full) return '';
  const lead = (splitLead(full)?.lead || full).trim();
  if (lead.length <= SENTENCE_MAX) {
    return /[.!?]$/.test(lead) ? lead : `${lead}.`;
  }
  // Too long to print whole. These sentences are built the same way -- a
  // clause naming the tool, then a colon or a dash, then the definition it
  // expands into -- so the boundary is already written into the text. Cutting
  // there ends the row on a finished thought and a full stop:
  //
  //   "E&M level by medical decision making: the level from the two-of-three
  //    highest of problems, data, and risk…"        (cut before the payload)
  //   "E&M level by medical decision making."       (a line, and shorter)
  //
  // The list row wants the name of the thing; the definition is on the page it
  // links to.
  // Every boundary, and only the ones outside a bracket. Taking the first one
  // wherever it fell cut inside the formula these summaries put in brackets
  // and then ended the row on a full stop, so 211 rows opened a bracket they
  // never closed and 12 of them said nothing at all: "Compute the serum anion
  // gap (Na.", "Albumin-to-globulin ratio = albumin / (total protein.",
  // "TIMI Risk Index (Wiviott 2006.". Skipping those leaves the next boundary
  // along, which is the one the author wrote.
  for (const m of lead.matchAll(/:| - |;/g)) {
    const boundary = m.index;
    if (boundary < MIN_CLAUSE) continue;
    if (boundary > CLAMP_AT) break;
    if (depthAt(lead, boundary) > 0) continue;
    const clause = lead.slice(0, boundary).trimEnd().replace(/[,:;-]+$/, '');
    // Unless the clause is just the name again, in which case the row would
    // print "MELD 3.0" under a heading reading "MELD 3.0". Keep looking: a cut
    // line that adds something beats a short one that adds nothing.
    if (name && sameAs(clause, name)) continue;
    return `${clause}.`;
  }
  const cut = lead.slice(0, CLAMP_AT);
  const sp = cut.lastIndexOf(' ');
  const at = outsideBrackets(lead, sp > CLAMP_AT * 0.6 ? sp : cut.length);
  const kept = lead.slice(0, at).replace(/[\s,;:([-]+$/, '');
  return `${kept}…`;
}

// --- The value legend an agent-facing label carries, and a reader does not.
//
// An MCP field label enumerates its legal values inline, because an agent
// passes a raw token and never sees the picklist:
//
//   "Item 1. Light sensitivity [4 = All of the time; 3 = Most of the time; ...]"
//   "Skin stage, ACTIVE ERYTHEMA ONLY [0 = No active GVHD rash; 1 = ...]"
//
// On a page the reader already has that list -- it is the select they are
// about to use -- so the legend is pure noise in front of the name. Worse, the
// legend contains sentence-ending periods, so the first-sentence trim cut
// *inside* it and printed rows ending on a dangling "0 = None of the time."
// with the bracket never closed.
//
// A legend is recognised, not guessed at: what makes one is two or more
// `<value> <separator> <meaning>` pairs inside one bracket. "Weight [kg]" has
// no pairs and is left alone; "[0 = none]" has one, which is a parenthetical
// the label meant to say.
//
// Nothing narrower survives the catalog. The rule used to be an equals sign,
// with the bracket running to the end of the label, and both halves were
// wrong often enough to publish long rows:
//
//   - The pairs are written with a dash as often as an equals ("[4 - Normal;
//     3 - Slow or sloppy; ...]") and with a colon on others ("[1: Secundum
//     ASD repair; ...]"). 60 rows on 10 pages printed a whole rating scale.
//   - They are divided by a full stop as often as a semicolon, and the value
//     itself is often hyphenated ("pl-hm = ..."), so neither the divider nor
//     the value can mark where a pair begins -- only the space after the
//     separator can. A pair also starts straight after the closing bracket of
//     the previous one's aside ("...(from 1990 grades 3B, 4) 1R = ...").
//   - The legend is not always last. `bilsky-escc` writes "...not a number
//     [0 = ...; 3 = ...]. 1a, 1b and 1c are DISTINCT grades", so the end
//     anchor matched nothing and the row ran 477 characters.
const LEGEND_PAIR = /(?:^|[;.)]\s+)[A-Za-z0-9][^\s=\][]{0,23}\s*[=\-:]\s/g;
const isLegend = (body) => (body.match(LEGEND_PAIR) || []).length >= 2;

export function stripLegend(text) {
  const s = (text || '').trim();
  if (!s.includes('[')) return s;
  const out = s.replace(/\[([^[\]]*)\]/g, (whole, body) => (isLegend(body) ? '' : whole));
  if (out === s) return s;
  const tidy = out.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
  // The label was nothing but its legend. Then there is no name to fall back
  // to and the original, long as it is, is the only thing that names the row.
  return /[A-Za-z]/.test(tidy) ? tidy : s;
}

// --- Cutting a line without cutting a bracket in half.
//
// Every clamp in this file and in build-tool-pages.mjs picks an index and
// slices there. An index inside a parenthesis publishes a line that opens a
// bracket and never closes it -- "(the C axis of\u2026", "(0-4 animals = 0" --
// which reads as text that was corrupted rather than shortened.

// How many brackets are open at `index`.
export function depthAt(text, index) {
  let depth = 0;
  for (let i = 0; i < index; i++) {
    const c = text[i];
    if (c === '(' || c === '[') depth += 1;
    else if (c === ')' || c === ']') depth -= 1;
  }
  return depth;
}

// The same cut point, backed out to before any bracket it landed inside.
export function outsideBrackets(text, index) {
  const open = [];
  for (let i = 0; i < index; i++) {
    const c = text[i];
    if (c === '(' || c === '[') open.push(i);
    else if (c === ')' || c === ']') open.pop();
  }
  return open.length ? open[0] : index;
}

// The first occurrence that is not inside a bracket, or -1.
function topLevelIndexOf(text, ch) {
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ch && depthAt(text, i) === 0) return i;
  }
  return -1;
}

function topLevelSearch(text, re) {
  for (const m of text.matchAll(re)) {
    if (depthAt(text, m.index) === 0) return m.index;
  }
  return -1;
}

// The name of a field, for the left column of a worked example.
//
// An MCP registry label doubles as the field's full description, so many read
// "Name: what counts as each level" or "Name - the caveat", and a few run past
// a thousand characters. In a two-column row only the name is wanted; the
// definition is in the tool itself. Cut at the separator the label already
// carries, before falling back to a blunt character clamp that would end the
// row on a dangling "3 slough,…".
const NAME_MAX = 80;
export function fieldName(text) {
  let s = (text || '').trim();
  if (!s) return '';
  const sep = topLevelSearch(s, /:| - /g);
  if (sep >= 8 && sep <= 70) s = s.slice(0, sep);
  s = s.replace(/[.:;,-]+$/, '').trim();
  if (s.length <= NAME_MAX) return s;
  // Still too long, so the label qualifies its name with an appositive rather
  // than a separator: "Cellularity, counted in cells per unit area at a
  // specified magnification and therefore operator-dependent". The comma is
  // the boundary, and cutting there names the field instead of ending the row
  // on a clamped "...at a specified magnific…". Only reached when the blunt
  // clamp is the alternative, so a short "Sex, at birth" is never touched.
  // The first comma the label itself made, not the first one inside a bracket:
  // "(0-4 animals = 0, 5-9 = 1, ...)" is a legend, and cutting at its first
  // comma named the field "(0-4 animals = 0". Skipping to the next boundary
  // outside the bracket keeps the clean cut this branch exists for.
  const comma = topLevelIndexOf(s, ',');
  if (comma >= 8 && comma <= 70) return s.slice(0, comma).trim();
  const cut = s.slice(0, NAME_MAX - 1);
  const sp = cut.lastIndexOf(' ');
  const at = outsideBrackets(s, sp > 40 ? sp : cut.length);
  return `${s.slice(0, at).trimEnd().replace(/[,;:([]+$/, '').trimEnd()}…`;
}

// --- The hub and topic page opening paragraph.
//
// These pages open with a paragraph that names the tools on them -- "QTc by
// Bazett, Fridericia, Framingham, and Hodges; Wells PE and DVT with the Geneva
// alternative; CHA2DS2-VASc and HAS-BLED for..." -- and then list those same
// tools directly underneath, each with its own line. One ran to 959
// characters. The reader scrolls past a name-dump to reach the names.
//
// The first sentence says what the page is and stays visible. The rest is not
// deleted -- it goes one click away, still in the DOM for search and for "find
// in page", the same treatment long explanations get inside a tile. The <meta>
// description is written separately and is untouched by this.
const HIDE_OVER = 150;
const MIN_HIDDEN = 60;

// Most of these paragraphs are not several sentences -- they are one sentence
// that names the page, then a colon, then the name-dump. "Calculators that
// compute a deterministic billing or coding output: the MPFS reimbursement
// engine, ..." runs to 959 characters that way and never ends a sentence at
// all. So a colon counts as a break when no full stop does.
const MIN_CLAUSE_LEDE = 18;
function colonSplit(text) {
  const at = text.search(/:|(?<=\S) - /);
  if (at < MIN_CLAUSE_LEDE || at > HIDE_OVER) return null;
  const lead = `${text.slice(0, at).trimEnd().replace(/[,:;-]+$/, '')}.`;
  // What follows a colon continues the clause and so begins in lower case.
  // Standing on its own under a disclosure it has to open like a sentence,
  // which is a capital letter and nothing else -- no words are added.
  const tail = text.slice(at + 1).trim();
  const rest = tail.replace(/^[a-z]/, (c) => c.toUpperCase());
  return rest.length >= MIN_HIDDEN ? { lead, rest } : null;
}

export function ledeParts(text) {
  const full = (text || '').trim();
  if (full.length <= HIDE_OVER) return { lead: full, rest: '' };

  const sentence = splitLead(full);
  if (sentence && sentence.rest.length >= MIN_HIDDEN) {
    // The first sentence can itself be a name-dump behind a colon, so it gets
    // the same treatment and what it sheds joins the hidden half.
    if (sentence.lead.length > HIDE_OVER) {
      const inner = colonSplit(sentence.lead);
      if (inner) return { lead: inner.lead, rest: `${inner.rest} ${sentence.rest}`.trim() };
    }
    return { lead: sentence.lead, rest: sentence.rest };
  }

  return colonSplit(full) || { lead: full, rest: '' };
}
