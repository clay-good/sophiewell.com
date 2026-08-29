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
// --- The same sentences, twice on one page.
//
// 45 tiles build their result text by joining a computed lead to the tile's
// own constant notes:
//
//   parts.push(`Regional Sartorius score ${total}: ...`);
//   parts.push(REGIONAL_NOTE);   // <- and the view renders REGIONAL_NOTE
//   parts.push(FISTULA_NOTE);    // <- and FISTULA_NOTE
//   ...
//   note(o, parts.join(' '));
//
// The view has already put every one of those constants on the page, beside
// the field it explains, which is where it is useful. Joined into the result
// they are said a second time -- 46,817 characters across the 45, 61% of all
// the prose in their live regions -- and a live region says everything it
// holds again on every keystroke.
//
// The result text is right for an agent reading one string over MCP, where
// there is no page to have read it on. It is the page that has it twice. So
// this drops from the announced paragraph only whole sentences that are
// already rendered, word for word, somewhere outside the live region -- never
// the paragraph's own first sentence, which is the computed answer, and never
// so much that nothing is left.
const RESTATED_MIN = 40;
const PROSE_TAGS = new Set(['P', 'LI', 'SUMMARY', 'DD']);

export function dropRestatedSentences(body) {
  if (!body) return 0;
  const live = body.querySelector('[aria-live]');
  if (!live) return 0;
  const targets = longNotes(live);
  if (!targets.length) return 0;

  // Everything the reader can see that is not being announced. Walked rather
  // than selected: the elements that hold prose are four different tags, and a
  // comma-separated selector is one of the things the DOM stub the unit tests
  // run against does not do.
  const prose = [];
  const walk = (node) => {
    if (node === live) return;
    if (PROSE_TAGS.has(node.tagName)) prose.push((node.textContent || '').replace(/\s+/g, ' ').trim());
    for (const kid of Array.prototype.slice.call(node.children || [])) walk(kid);
  };
  walk(body);
  const elsewhere = prose.join('  ');
  if (!elsewhere) return 0;

  let dropped = 0;
  for (const node of targets) {
    const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
    const sentences = splitSentences(text);
    if (sentences.length < 2) continue;
    const kept = sentences.filter((sentence, i) => {
      if (i === 0) return true;
      if (sentence.length < RESTATED_MIN) return true;
      return !elsewhere.includes(sentence);
    });
    if (kept.length === sentences.length) continue;
    const rewritten = kept.join(' ');
    if (!rewritten || rewritten.length === text.length) continue;
    node.textContent = rewritten;
    dropped += sentences.length - kept.length;
  }
  return dropped;
}

// Whole sentences, so that what is dropped is something the reader could have
// read on its own. Reuses the boundary rule `splitLead` already applies -- a
// decimal, an abbreviation, an initial inside a citation and a bracket all end
// in a period without ending a sentence.
function splitSentences(text) {
  const out = [];
  let rest = text;
  for (;;) {
    const parts = splitLead(rest, { minLead: 1 });
    if (!parts) break;
    out.push(parts.lead);
    rest = parts.rest;
  }
  if (rest) out.push(rest);
  return out;
}

const INTRO_MIN = 280;

// How many candidates a tile may reject before it is left alone. Every
// rejection removes one paragraph from the pool, so this only has to be as
// large as the number of long paragraphs a tile writes; the most any does is
// three.
const MAX_ATTEMPTS = 4;

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

// One tile is on screen at a time, and routing to the next one replaces the
// body this watches. Without dropping the old observer each render leaves one
// behind, still registered against a detached tree it keeps alive: harmless to
// what the reader sees, but a leak, and a serial sweep of the whole catalog
// accumulates one per tile.
let active = null;

export function hoistIntroNote(body) {
  if (active) { active.disconnect(); active = null; }
  if (!body) return null;
  let intro = null;
  let more = null;
  let text = null;
  let stopped = false;
  let busy = false;
  let observer = null;
  let attempts = 0;

  // Put it back where it was, rather than drop it. The hoisted paragraph is
  // the only copy -- it was moved, not duplicated -- so removing it deletes
  // the text outright; 25 tiles lost their whole explanation that way. And it
  // has to go back to its own place, not the end of the region: appending it
  // after the tile's other output put `sternbach` 23px over a 320px viewport.
  // Undoing means leaving the tile exactly as it was found.
  let slot = null;
  let companions = 0;

  // Paragraphs this tile has already proved are not the static one, held by
  // their text. A tile that cannot compute yet writes a long "still needed:
  // temperature, cns, ..." prompt, and on the first render that prompt is the
  // only long paragraph there is -- so it was hoisted, and the moment the
  // inputs arrived and the real output replaced it, the mismatch was caught
  // and the whole tile abandoned. It is a computed line and belongs in the
  // live region; knowing that is what lets the next pass find the real note
  // behind it instead of giving up on 20 tiles.
  const rejected = new Set();

  const undo = ({ retry = false } = {}) => {
    if (!retry) {
      stopped = true;
      if (observer) observer.disconnect();
    }
    if (more) { more.remove(); more = null; }
    if (intro) {
      if (retry) rejected.add(text);
      intro.textContent = text;
      // slot.next was captured when the note was hoisted, and the tile may have
      // rebuilt its live region since -- most renderers clear() and re-append
      // every child on each input event, which detaches that sibling. Passing a
      // node that is no longer a child of slot.parent makes insertBefore THROW
      // NotFoundError rather than ignore it, so the anchor is checked before it
      // is trusted. A null anchor is fine: insertBefore(node, null) appends, and
      // putting the note back at the end of its parent is a correct restore.
      const anchor = slot && slot.next && slot.next.parentNode === slot.parent ? slot.next : null;
      if (slot && slot.parent) slot.parent.insertBefore(intro, anchor);
      else intro.remove();
      intro = null;
    }
    text = null;
    companions = 0;
    slot = null;
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
        // The explanation is the one the view appends last: `note(o, r.note)`
        // is the final line of the compute callback, so anything computed was
        // written before it. 45 tiles are this shape -- a long computed detail
        // and then the note -- and both arrive in the same mutation, so there
        // is never a moment when only one of them is there. Only a candidate
        // that is genuinely the region's last child qualifies.
        const open = found.filter((n) => !rejected.has(n.textContent || ''));
        if (!open.length) { stopped = true; return; }
        const cand = open[open.length - 1];
        // Nothing may follow the candidate except text too short to be a note
        // and paragraphs already proved computed. The rule used to be that the
        // candidate had to be the region's very last child, which is the same
        // rule until a tile writes its prompt after its note -- and then it
        // refused a candidate whose only follower was a line it had itself
        // just established was computed.
        const kids = Array.prototype.slice.call(live.children)
          .filter((n) => !rejected.has(n.textContent || ''));
        if (open.length > 1 && cand !== kids[kids.length - 1]) {
          stopped = true;
          return;
        }
        intro = cand;
        text = intro.textContent || '';
        // How many long paragraphs this tile writes, so a later render can be
        // read correctly. After the move the region settles one short of it;
        // seeing the full count again means the note was re-appended.
        companions = found.length - 1;
        slot = { parent: intro.parentNode, next: intro.nextSibling };
        live.parentNode.insertBefore(intro, live);
        more = foldNote(intro);
        return;
      }
      // A re-appended copy of the note, dropped. Anything else the tile
      // computes is left exactly where it is, announced.
      const copies = found.filter((n) => (n.textContent || '') === text);
      if (copies.length) { for (const n of copies) n.remove(); return; }
      // No copy, and yet the region holds more long paragraphs than the
      // computed ones it settled at. The text in the note's place is not the
      // text that was hoisted, so this was never a static note: put it back.
      // Comparing against the last paragraph instead undid a good hoist the
      // moment a computed detail re-rendered beside it.
      if (found.length > companions) {
        // Retry rather than stop, up to once per long paragraph the tile
        // writes: each pass rejects exactly one candidate, so the pool
        // strictly shrinks and the loop cannot run away. The re-scan has to
        // happen here -- restoring the paragraph is the last mutation this
        // render produces, so waiting for another one waits forever.
        // Only when there is another candidate to try. One different
        // paragraph standing where the note stood means the tile computes
        // there, and nothing else is on offer; several mean the wrong one of
        // several was taken, and the next one along is worth a look.
        if (found.length > 1 && attempts < MAX_ATTEMPTS) {
          attempts += 1;
          undo({ retry: true });
          busy = false;
          scan();
          return;
        }
        undo();
      }
    } finally {
      // Runs after the hoist has had its turn, on the paragraphs it left
      // behind, and again on every render because those paragraphs are rebuilt
      // every time. Idempotent: a paragraph with its restatements already gone
      // has none to find, so it is not touched and no further mutation
      // follows. Reading `found` above happens before this, so trimming never
      // moves the count the hoist's bookkeeping was taken from.
      dropRestatedSentences(body);
      busy = false;
    }
  };

  // Scan synchronously, while the renderer's own first compute is the only
  // thing that has written to the region. Deferring this to a microtask was
  // tried and put `sternbach` 20px over the 320px viewport: the later scan
  // landed mid-render, saw a single long paragraph, hoisted it, and then
  // undid itself when the second arrived, leaving the restored paragraph in
  // a different place than the tile had put it.
  scan();
  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver(scan);
    observer.observe(body, { childList: true, subtree: true });
    active = observer;
  }
  // `recheck` is what the observer calls. It is returned so the behaviour can
  // be driven directly in a test: the interesting cases are the second and
  // third render, and waiting on a real MutationObserver to assert them would
  // test the browser rather than this rule.
  return { node: () => intro, recheck: scan, stopped: () => stopped };
}

// --- The answer stated twice.
//
// 45 tiles write their result as a heading and then a sentence that opens with
// exactly that heading: "CPOT 0 of 8" above "CPOT 0 of 8: acceptable pain per
// Gelinas 2006 (cutoff <3)." The heading adds nothing the sentence below it
// does not already say, and the reader parses the same words twice before
// reaching the part that is new.
//
// So the sentence takes the heading's place and the duplicate line goes. One
// line, complete, in the size the answer is meant to be read at. Nothing is
// rewritten and nothing is dropped -- the heading gains the words the
// paragraph had, which is why this is safe to run on a live region: the
// announcement gets shorter, never different.
//
// Only the exact shape: a heading immediately followed by a plain paragraph
// that starts with it. `fisher-grade` puts its short form in a list and its
// long form after the copy row, and `panc3`'s heading is the *tail* of the
// longer line rather than its head -- neither is a prefix of a sibling, and
// neither is touched. A merged line past MERGED_MAX stays two lines, because a
// heading is a glance and a paragraph is a read.
const MERGED_MAX = 200;
const HEADINGS = new Set(['H2', 'H3']);

const flat = (node) => (node.textContent || '').replace(/\s+/g, ' ').trim();

// `full` opens by saying `short` and then goes on. The boundary test is what
// makes it a repeat rather than a coincidence: `hospital-score` reads
// "HOSPITAL 0" over "HOSPITAL 0-4: low risk", where 0 is the score and 0-4 is
// the band, and treating that as a repeat printed the band where the score had
// been and lost the score.
function opensWith(full, short) {
  if (short.length < 6 || full.length <= short.length) return false;
  if (!full.startsWith(short)) return false;
  return /^[\s:;,.(]/.test(full.charAt(short.length));
}

// What is left of `full` once `short` is taken off the front, or '' when the
// remainder does not start a sentence of its own -- a line beginning "for this
// region: ..." or "; original score 2.2" reads worse than the repeat did.
function remainderOf(full, short) {
  const tail = full.slice(short.length).replace(/^[\s:;,.(-]+/, '');
  return /^[A-Z0-9]/.test(tail) ? tail : '';
}

let activeMerge = null;

export function mergeRepeatedAnswer(body) {
  if (activeMerge) { activeMerge.disconnect(); activeMerge = null; }
  if (!body) return null;
  let busy = false;

  const scan = () => {
    // Merging mutates the region this observes.
    if (busy) return;
    const live = body.querySelector('[aria-live]');
    if (!live) return;
    busy = true;
    try {
      // A heading and the paragraph directly under it.
      for (const head of Array.prototype.slice.call(live.querySelectorAll('h2, h3'))) {
        if (!HEADINGS.has(head.tagName) || head.children.length) continue;
        const next = head.nextElementSibling;
        if (!next || next.tagName !== 'P' || next.children.length) continue;
        const short = flat(head);
        const full = flat(next);
        if (!opensWith(full, short)) continue;
        if (full.length <= MERGED_MAX) {
          head.textContent = full;
          next.remove();
          continue;
        }
        // Too long to be a heading. Then the heading keeps its glance and the
        // paragraph loses the words the heading already said -- `cssrs` runs
        // 221 characters and opened by restating its own headline.
        const tail = remainderOf(full, short);
        if (tail) next.textContent = tail;
      }

      // The other shape the renderers use: the result is a `li.result-band`
      // row at the top of a summary list, and the explanation is a paragraph
      // further down, past the copy button. `fisher-grade` reads
      // "Fisher grade 3" in the list and then "Fisher grade 3: Localized clot,
      // or a vertical layer of subarachnoid blood 1 mm thick or more. ..."
      // below it. The list row is the glance and stays; the paragraph loses
      // the words the row already said.
      //
      // Not merged the way a heading is: the row lives inside a list of other
      // rows, and moving a paragraph into it would bury the reading in a
      // bullet.
      const band = live.querySelector('li.result-band');
      if (band) {
        const short = flat(band);
        for (const para of Array.prototype.slice.call(live.querySelectorAll('p'))) {
          if (para.children.length) continue;
          const full = flat(para);
          if (!opensWith(full, short)) continue;
          const tail = remainderOf(full, short);
          if (tail) para.textContent = tail;
          break;
        }
      }
    } finally {
      busy = false;
    }
  };

  scan();
  if (typeof MutationObserver === 'function') {
    const observer = new MutationObserver(scan);
    observer.observe(body, { childList: true, subtree: true });
    activeMerge = observer;
  }
  // Returned so a test can drive the second and third render directly rather
  // than waiting on a real MutationObserver.
  return { recheck: scan };
}

// --- The same explanation, twice on one screen.
//
// A tile writes what it is in two places, independently: the renderer's own
// intro note above the fields, and the `NOTE` constant in `lib/<tile>.js` that
// `hoistIntroNote` lifts out of the results region and parks below them. They
// were written at different times by different hands, so they are rarely the
// same string -- and `dropRestatedSentences`, which matches verbatim, never saw
// them. They are the same paragraph all the same:
//
//   The Ahlback classification of knee osteoarthritis, by radiographic
//   joint-space loss and bone attrition.
//   ...
//   The Ahlback classification (Ahlback 1968) grades knee osteoarthritis by
//   radiographic joint-space loss and bone attrition.
//
// 583 tiles read like that -- 37% of the catalog, saying the same thing twice
// on one screen, in both cases above a disclosure holding the same grade list.
//
// So the later one folds. Not deleted: it goes inside the disclosure it already
// owns (or a new one), so every word stays in the DOM, stays findable, and
// still prints -- theme.js opens every disclosure before printing. What the
// reader loses is only the second reading of a sentence they just read.
//
// The FIRST one stays visible, because position is the whole point: it sits
// above the fields, where "what am I being asked for" is the question.

// Overlap is measured over meaningful words, not characters: the two are
// paraphrases, so they share vocabulary rather than substrings. Scored against
// the SHORTER paragraph's vocabulary, because the later one routinely adds a
// citation and a sentence of scope -- "is the shorter one already said here?"
// is the question, not "are these the same length".
const RESTATED_OVERLAP = 0.85;

// Below this a paragraph has too few distinct words for an overlap score to
// mean anything: two five-word labels can share four words by chance.
const MIN_VOCAB = 6;

// Shorter than this and folding it saves nothing worth a disclosure.
const RESTATED_MIN_CHARS = 60;

// Every tile ends on the same posture sentence, and it is not a restatement of
// anything -- it is the one line that must stay in front of the reader.
const POSTURE_PREFIX = 'Decision support, not a verdict';

const vocab = (text) => new Set(
  String(text || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w.length > 3),
);

// restatesEarlier(later, earlier) -> does `later` say what `earlier` already
// said? Exported so the threshold is testable without a DOM: it is the only
// judgement in this pass, and the number it turns on was measured (420 tiles
// carried a pair at or above it; 81 remain, nested rather than siblings).
export function restatesEarlier(later, earlier) {
  const a = vocab(later);
  const b = vocab(earlier);
  if (a.size < MIN_VOCAB || b.size < MIN_VOCAB) return false;
  return overlap(a, b) >= RESTATED_OVERLAP;
}

function overlap(a, b) {
  const small = a.size <= b.size ? a : b;
  const large = small === a ? b : a;
  let shared = 0;
  for (const w of small) if (large.has(w)) shared += 1;
  return shared / small.size;
}

// The prose a reader can actually see: direct children of `body`, skipping any
// disclosure (already folded), the live region (its text is the answer, which
// changes with the inputs -- folding a static explanation because it happens to
// echo today's number would be wrong), and the hint under the example.
function visibleProse(body) {
  const out = [];
  for (const node of Array.prototype.slice.call(body.children)) {
    if (node.tagName === 'DETAILS') continue;
    if (node.getAttribute && node.getAttribute('aria-live') !== null) continue;
    if (node.querySelector && node.querySelector('[aria-live]')) continue;
    if (node.tagName !== 'P') continue;
    if (node.classList && node.classList.contains('example-hint')) continue;
    out.push(node);
  }
  return out;
}

// Fold every explanation paragraph that restates one already above it. Returns
// how many were folded. Idempotent: a folded paragraph is no longer a direct
// child, so a second pass sees nothing to do.
export function foldRestatedNote(body) {
  if (!body) return 0;
  const paras = visibleProse(body);
  const texts = paras.map((p) => (p.textContent || '').replace(/\s+/g, ' ').trim());
  const vocabs = texts.map(vocab);
  let folded = 0;
  for (let i = 1; i < paras.length; i += 1) {
    const node = paras[i];
    if (!node.classList || !node.classList.contains('muted')) continue;
    if (texts[i].length < RESTATED_MIN_CHARS) continue;
    if (texts[i].startsWith(POSTURE_PREFIX)) continue;
    if (vocabs[i].size < MIN_VOCAB) continue;
    let restates = false;
    for (let j = 0; j < i; j += 1) {
      if (texts[j].startsWith(POSTURE_PREFIX)) continue;
      if (vocabs[j].size < MIN_VOCAB) continue;
      if (overlap(vocabs[i], vocabs[j]) >= RESTATED_OVERLAP) { restates = true; break; }
    }
    if (!restates) continue;
    // Into the disclosure this paragraph already owns, at the top, so the
    // sentence that introduced the detail still introduces it.
    const next = node.nextElementSibling;
    if (next && next.tagName === 'DETAILS' && next.classList.contains('note-more')) {
      const first = next.querySelector('p');
      if (first) next.insertBefore(node, first);
      else next.appendChild(node);
      folded += 1;
      continue;
    }
    // No disclosure yet, so it gets one of its own.
    const more = el('details', { class: 'note-more' }, [el('summary', { text: 'More detail' })]);
    node.insertAdjacentElement('beforebegin', more);
    more.appendChild(node);
    folded += 1;
  }
  return folded;
}
