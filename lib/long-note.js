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
//
// `minLead` is the shortest lead worth keeping. The default suits a paragraph,
// where a two-word lead would read as a dropped fragment. A field label is
// different: "Patient age." IS the whole label and everything after it is
// qualification, so callers listing fields pass a lower floor.
// A sentence does not end inside a bracket. Author initials in a parenthetical
// citation look exactly like sentence ends -- "(Csuka M, McCarty DJ. J
// Rheumatol 1985)" -- and splitting there hands back a fragment with a bracket
// it never closes, which is what three tile pages led with.
function openBrackets(text, index) {
  let depth = 0;
  for (let i = 0; i < index; i++) {
    const c = text[i];
    if (c === '(' || c === '[') depth += 1;
    else if (c === ')' || c === ']') depth -= 1;
  }
  return depth > 0;
}

export function splitLead(text, { minLead = MIN_LEAD } = {}) {
  const re = /[.!?]["')”]?\s+/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const end = m.index + m[0].length;
    const lead = text.slice(0, end).trim();
    if (lead.length < minLead) continue;
    if (openBrackets(text, m.index)) continue;
    // Leading punctuation is not part of the token: a parenthesised aside
    // ("(e.g. initial, redetermination)") put a `(` in front of `e.g.` and the
    // abbreviation lookup missed it, so the label was cut to "... (e.g".
    const word = lead.split(/\s+/).pop().replace(/^[^A-Za-z0-9]+/, '');
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

// --- The static explanation a tile writes inside its own results region.
//
// 608 view files end their compute callback with the same line:
//
//   const o = out();                    // <div id="q-results" aria-live="polite">
//   wire(ids, () => safe(o, () => {     // safe() clears `o` first
//     ...
//     note(o, r.note);                  // a constant from lib/<tile>.js
//   }));
//
// `r.note` does not vary with the inputs -- it is the tile's `NOTE` constant --
// so 964 tiles put 400 to 3,051 characters of static prose inside a polite live
// region and re-announced all of it every time the reader changed an input.
// It is also why `collapseLongNotes` never folded them: it will not walk into a
// live region, and it should not.
//
// So move it out. The paragraph belongs above the results, as a sibling of the
// live region rather than a child of it, where it is announced once and where
// it can be folded like every other long explanation on the page.
//
// Which paragraph is the static one is decided by watching rather than by
// guessing. The first long one is hoisted; every later render is checked
// against it. A tile whose text turns out to change is not the case this is
// for -- the hoisted copy is taken back out and the tile is left alone from
// then on, so a computed line is never frozen at its first value nor kept out
// of the region that exists to announce it.
const INTRO_MIN = 280;

const longNotes = (live) => Array.prototype.slice.call(live.children)
  .filter((n) => n.tagName === 'P' && n.classList.contains('muted') && (n.textContent || '').length > INTRO_MIN);

// The fold `collapseLongNotes` applies, for one paragraph that has just been
// moved. Hoisting cannot wait for that pass: 419 tiles compute behind an await
// and their note does not exist yet when it runs.
function foldNote(node) {
  const text = node.textContent || '';
  if (text.length <= COLLAPSE_OVER) return null;
  const parts = splitLead(text);
  if (!parts || parts.rest.length < MIN_HIDDEN) return null;
  node.textContent = parts.lead;
  const more = el('details', { class: 'note-more' }, [
    el('summary', { text: 'More detail' }),
    el('p', { class: 'muted', text: parts.rest }),
  ]);
  node.insertAdjacentElement('afterend', more);
  return more;
}

export function hoistIntroNote(body) {
  if (!body) return null;
  let intro = null;
  let more = null;
  let text = null;
  let stopped = false;
  let busy = false;
  let observer = null;

  // Put it back rather than drop it. The hoisted paragraph is the only copy --
  // it was moved, not duplicated -- so removing it deletes the text outright.
  // 25 tiles lost their whole explanation that way before this was a restore.
  const undo = (live) => {
    stopped = true;
    if (observer) observer.disconnect();
    if (more) { more.remove(); more = null; }
    if (intro) {
      intro.textContent = text;
      if (live) live.appendChild(intro); else intro.remove();
      intro = null;
    }
  };

  const scan = () => {
    // Hoisting and folding both mutate `body`, which is what this observes.
    if (stopped || busy) return;
    const live = body.querySelector('[aria-live]');
    if (!live) return;
    const found = longNotes(live);
    if (!found.length) return;
    busy = true;
    try {
      if (!intro) {
        // More than one long paragraph and there is no way to tell which is
        // the explanation from the DOM alone. 45 tiles write a long computed
        // detail as well as their note; taking the last one works in
        // isolation but not against the real render sequence, so they are
        // left exactly as they were rather than guessed at.
        if (found.length !== 1) { stopped = true; return; }
        intro = found[0];
        text = intro.textContent || '';
        live.parentNode.insertBefore(intro, live);
        more = foldNote(intro);
        return;
      }
      // Only the slot the note occupies -- the last long paragraph. A tile
      // that also writes a long computed detail re-renders that too, and
      // comparing against it undid the hoist on 25 tiles and took the
      // explanation with it. Everything before the note is left announced.
      const last = found[found.length - 1];
      if ((last.textContent || '') === text) last.remove();
      else undo(live);
    } finally {
      busy = false;
    }
  };

  // Never decide from a half-built region. A render appends the result, then
  // any computed detail, then the note; scanning between those appends saw a
  // computed paragraph sitting last, hoisted it, and then undid itself for
  // good when the real note arrived. Deferring to the end of the current task
  // means every scan reads a settled DOM.
  const defer = typeof queueMicrotask === 'function'
    ? queueMicrotask
    : (fn) => Promise.resolve().then(fn);
  let queued = false;
  const later = () => {
    if (queued || stopped) return;
    queued = true;
    defer(() => { queued = false; scan(); });
  };

  later();
  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver(later);
    observer.observe(body, { childList: true, subtree: true });
  }
  // `recheck` is what the observer calls. It is returned so the behaviour can
  // be driven directly in a test: the interesting cases are the second and
  // third render, and waiting on a real MutationObserver to assert them would
  // test the browser rather than this rule.
  return { node: () => intro, recheck: scan, stopped: () => stopped };
}
