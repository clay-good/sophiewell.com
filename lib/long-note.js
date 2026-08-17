// Long explanation paragraphs collapse behind a disclosure.
//
// Tile renderers write their explanations as `<p class="muted">` paragraphs.
// Most are a line or two. A few hundred run to a full paragraph of background:
// what the scheme is for, which groups exist, what it deliberately does not do.
// All of that is true and worth keeping, but a reader who opened the page to
// get a number has to walk past it first.
//
// So: keep the first sentence visible - that is the one that says what the
// tool is and what to enter - and put the rest one click away. Nothing is
// deleted, the text stays in the DOM (and in the print output, because
// theme.js opens every disclosure before printing), and short paragraphs are
// left exactly as the renderer wrote them.

import { el } from './dom.js';

// A paragraph shorter than this reads fine as-is; splitting it would add a
// disclosure control that saves almost no vertical space.
const COLLAPSE_OVER = 280;

// If what would be hidden is shorter than this, the disclosure costs more
// attention than it saves.
const MIN_HIDDEN = 80;

// Tokens that end in a period without ending a sentence. A split after one of
// these would cut mid-thought.
const ABBREVIATIONS = new Set([
  'e.g.', 'i.e.', 'vs.', 'approx.', 'ca.', 'cf.', 'etc.', 'no.', 'fig.',
  'dr.', 'mr.', 'ms.', 'st.', 'ref.', 'ed.', 'al.', 'vol.',
]);

// A spelled-out acronym ends in a period without ending a sentence:
// "S.T.O.N.E. is a five-part score" must not split after "S.T.O.N.E.".
const SPELLED_ACRONYM = /^(?:[A-Za-z]\.){2,}$/;

// Below this a lead is a fragment, not a sentence. Kept low because a field
// description legitimately leads with a short noun phrase ("Patient age.").
const MIN_LEAD = 20;

// Split after the first sentence-ending period. Decimals ("1.2 ng/mL") never
// have whitespace after the point, so they cannot match.
export function splitLead(text) {
  const re = /[.!?]["')”]?\s+/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const end = m.index + m[0].length;
    const lead = text.slice(0, end).trim();
    if (lead.length < MIN_LEAD) continue;
    const word = lead.split(/\s+/).pop();
    if (SPELLED_ACRONYM.test(word)) continue;
    if (ABBREVIATIONS.has(word.toLowerCase())) continue;
    const rest = text.slice(end).trim();
    if (!rest) return null;
    return { lead, rest };
  }
  return null;
}

// Rewrite every over-long explanation paragraph directly under `root`. Only
// direct children are touched: result areas and derivation blocks are nested,
// so a computed message or a formula never gets folded away.
export function collapseLongNotes(root) {
  if (!root) return 0;
  let collapsed = 0;
  for (const node of Array.prototype.slice.call(root.children)) {
    if (node.tagName !== 'P' || !node.classList.contains('muted')) continue;
    const text = node.textContent || '';
    if (text.length <= COLLAPSE_OVER) continue;
    const parts = splitLead(text);
    if (!parts || parts.rest.length < MIN_HIDDEN) continue;
    node.textContent = parts.lead;
    const more = el('details', { class: 'note-more' }, [
      el('summary', { text: 'More detail' }),
      el('p', { class: 'muted', text: parts.rest }),
    ]);
    node.insertAdjacentElement('afterend', more);
    collapsed += 1;
  }
  return collapsed;
}
