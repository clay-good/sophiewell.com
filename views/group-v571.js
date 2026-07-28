// spec-v571: renderer for the E-FACED score. Group G. Items under an h2 section heading (never h3 - an h3
// under the page h1 is a heading-level skip).
//
// Each item label shows its own point value, because the weighting is uneven - six items but nine points -
// and the intro states that the bands do NOT carry over from FACED, which is the error in live circulation
// this tile exists to correct (lib/e-faced-v571.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile estimates exacerbation
// risk; it never diagnoses bronchiectasis and never selects treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/e-faced-v571.js';
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

const YESNO = [['no', 'No'], ['yes', 'Yes']];

export const renderers = {
  'e-faced'(root) {
    note(root, 'E-FACED predicts FUTURE EXACERBATIONS in bronchiectasis; its predecessor FACED was built for MORTALITY, with essentially unchanged mortality performance — so choosing between them is choosing which outcome you are asking about. Six items, nine points: the bands do NOT carry over from FACED (which runs 0-7 with bands 0-2 / 3-4 / 5-7).');

    heading(root, 'E-FACED items');
    for (const item of M.E_FACED_ITEMS) {
      root.appendChild(select(`${item.text} — ${item.points} point${item.points === 1 ? '' : 's'}`, `efaced-${item.key}`, YESNO));
      if (item.detail) note(root, item.detail);
    }

    const o = out(); root.appendChild(o);
    wire(M.E_FACED_ITEMS.map((i) => `efaced-${i.key}`), () => safe(o, () => {
      const input = {};
      for (const item of M.E_FACED_ITEMS) input[item.key] = val(`efaced-${item.key}`);
      const r = M.eFaced(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'E-FACED', value: `${r.total} of ${r.max}` },
        { label: 'Severity', value: r.band },
        { label: 'Band source', value: `E-FACED bands 0-3 / 4-6 / 7-9 — NOT the FACED bands (max ${r.predecessorMax})` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
