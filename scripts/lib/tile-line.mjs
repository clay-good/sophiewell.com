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
