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

export function tileLine(text) {
  const full = (text || '').trim();
  if (!full) return '';
  const lead = (splitLead(full)?.lead || full).trim();
  if (lead.length <= SENTENCE_MAX) {
    return /[.!?]$/.test(lead) ? lead : `${lead}.`;
  }
  const cut = lead.slice(0, CLAMP_AT);
  const sp = cut.lastIndexOf(' ');
  const kept = (sp > CLAMP_AT * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:-]+$/, '');
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
// A legend is recognised, not guessed at: the text has to end on `]` and the
// bracket has to open on a `<token> = ` pair. "Weight [kg]" has no `=` and is
// left alone.
const LEGEND = /^([\s\S]*?[A-Za-z][\s\S]*?)\s*\[\s*[^\s=\][]{1,24}\s*=\s[\s\S]*\]$/;
export function stripLegend(text) {
  const s = (text || '').trim();
  if (!s.endsWith(']')) return s;
  const m = s.match(LEGEND);
  return m ? m[1].trim() : s;
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
  const sep = s.search(/:| - /);
  if (sep >= 8 && sep <= 70) s = s.slice(0, sep);
  s = s.replace(/[.:;,-]+$/, '').trim();
  if (s.length <= NAME_MAX) return s;
  // Still too long, so the label qualifies its name with an appositive rather
  // than a separator: "Cellularity, counted in cells per unit area at a
  // specified magnification and therefore operator-dependent". The comma is
  // the boundary, and cutting there names the field instead of ending the row
  // on a clamped "...at a specified magnific…". Only reached when the blunt
  // clamp is the alternative, so a short "Sex, at birth" is never touched.
  const comma = s.indexOf(',');
  if (comma >= 8 && comma <= 70) return s.slice(0, comma).trim();
  const cut = s.slice(0, NAME_MAX - 1);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > 40 ? cut.slice(0, sp) : cut).trimEnd()}…`;
}
