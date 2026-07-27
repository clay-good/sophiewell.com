// spec-v528: renderer for the Oxford classification (MEST-C) of IgA nephropathy. Group G. Five selects under
// an h2 section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The result deliberately shows a CODE and five separate lesion rows, and never a total. MEST-C is reported
// as its five scores side by side; the summed 0-7 grading is a research proposal, not the standard biopsy
// report, so producing a total here would invent a report format pathologists do not issue
// (lib/mest-c-v528.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile describes a biopsy; it
// never asserts a diagnosis of IgA nephropathy or a treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mest-c-v528.js';
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

export const renderers = {
  'mest-c'(root) {
    note(root, 'The Oxford classification (MEST-C) of an IgA nephropathy biopsy: five lesions scored separately and reported side by side, for example M1 E0 S1 T1 C0. It is not summed — the summed 0 to 7 grading is a research proposal, not the standard biopsy report — so this tile reports a code and five lesion rows rather than a total. It describes the biopsy; the diagnosis of IgA nephropathy needs mesangial IgA on immunofluorescence, not these light-microscopy lesions.');

    heading(root, 'Lesion scores from the biopsy report');
    const ids = [];
    for (const lesion of M.MEST_C_LESIONS) {
      const id = `mest-${lesion.key}`;
      ids.push(id);
      root.appendChild(select(`${lesion.key} — ${lesion.name}. ${lesion.detail}`, id,
        lesion.options.map((o) => [o.value, o.text])));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const lesion of M.MEST_C_LESIONS) args[lesion.key] = val(`mest-${lesion.key}`);
      const r = M.mestC(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'MEST-C', value: r.code },
        ...r.lesions.map((l) => ({ label: `${l.key} — ${l.name}`, value: l.score })),
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
