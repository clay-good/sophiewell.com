// spec-v555: renderer for the Tinnitus Handicap Inventory. Group G. Items under an h2 section heading
// (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The result deliberately reports NO functional/emotional/catastrophic subscores, and the intro says so, so
// that a reader who expects the familiar three subscales learns why they are absent rather than assuming
// the tile is incomplete (lib/thi-v555.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports self-reported
// handicap; it never diagnoses the cause of tinnitus and never selects treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/thi-v555.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const OPTIONS = M.THI_OPTIONS.map((o) => [String(o.value), `${o.text} (${o.value})`]);

export const renderers = {
  thi(root) {
    note(root, 'The Tinnitus Handicap Inventory asks 25 questions about how much tinnitus is affecting you. Each is answered yes (4), sometimes (2) or no (0), for a total of 0 to 100. Because every item scores 0, 2 or 4, every total is even — which is why the published grades read 0-16, 18-36, 38-56, 58-76 and 78-100, with 17, 37, 57 and 77 unreachable rather than missing.');

    heading(root, 'The 25 questions');
    M.THI_ITEMS.forEach((item, i) => {
      root.appendChild(select(`${i + 1}. ${item.text}`, `thi-${item.key}`, OPTIONS));
    });

    const o = out(); root.appendChild(o);
    wire(M.THI_ITEMS.map((i) => `thi-${i.key}`), () => safe(o, () => {
      const input = {};
      for (const item of M.THI_ITEMS) input[item.key] = val(`thi-${item.key}`);
      const r = M.thi(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Total', value: `${r.total} of ${r.max}` },
        { label: 'Grade', value: `${r.grade} — ${r.gradeLabel}` },
        { label: 'Answers', value: `${r.yesCount} yes, ${r.sometimesCount} sometimes` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
