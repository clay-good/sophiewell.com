// spec-v529: renderer for the Thwaites diagnostic index (TB vs bacterial meningitis). Group G. Five yes/no
// selects under an h2 section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// Each option label carries its SIGNED point value, including the -5 on duration, because this score runs in
// the OPPOSITE direction to most: a low total favors tuberculous meningitis. A reader who cannot see that a
// long history subtracts five has no way to sanity-check a result that gets "better" as the patient gets
// sicker-looking (lib/thwaites-v529.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile discriminates between two
// diagnoses; it never asserts either one and never indicates or withholds therapy.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/thwaites-v529.js';
import { resultRow } from '../lib/result-copy.js';

function signed(points) {
  return points > 0 ? `+${points}` : String(points);
}
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis stays with the clinician and the laboratory.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'thwaites'(root) {
    note(root, `The Thwaites diagnostic index distinguishes tuberculous from bacterial meningitis in adults, on a scale running ${M.THWAITES_RANGE.min} to ${M.THWAITES_RANGE.max}. It reads in the opposite direction to most scores: a total of 4 or less favors tuberculous meningitis and above 4 favors bacterial. A history of 6 days or more subtracts 5 points — the only negative weight and the largest. It discriminates between two diagnoses and diagnoses neither, and its specificity is poor in partially treated bacterial meningitis and in HIV-positive adults.`);

    heading(root, 'Clinical and laboratory features');
    const ids = [];
    for (const f of M.THWAITES_FEATURES) {
      const id = `thw-${f.key}`;
      ids.push(id);
      root.appendChild(select(`${f.text}. ${f.detail}`, id,
        [['no', `No (0)`], ['yes', `Yes (${signed(f.points)})`]]));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const f of M.THWAITES_FEATURES) args[f.key] = val(`thw-${f.key}`);
      const r = M.thwaites(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: signed(r.total) },
        { label: 'Favors', value: `${r.favors} meningitis` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
