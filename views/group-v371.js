// spec-v371: renderer for the C-RADS colonic categories (C0-C4). Group G. The radiologist picks the
// colonic category; the tile reports the category, its description, and whether it is an actionable
// (C3-C4, colonoscopy-warranting) finding.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the C-RADS category; it never asserts a diagnosis, a management order,
// or a prognosis (lib/c-rads-v371.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/c-rads-v371.js';
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
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the radiologist and referring team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'c-rads'(root) {
    note(root, 'C-RADS (CT Colonography Reporting and Data System, 2023 update) - the colonic reporting category on a CT colonography. Pick the category. C0 inadequate; C1 normal / benign; C2a indeterminate 6-9 mm polyps; C2b likely-benign stricture; C3 polyp(s) >= 10 mm or >= 3 polyps 6-9 mm (colonoscopy); C4 colonic mass (urgent). The extracolonic (E0-E4) axis is out of scope. Completes the RADS family: bi-rads, li-rads, pi-rads, o-rads, acr-tirads, lung-rads.');
    root.appendChild(select('C-RADS colonic category', 'crads-cat', [
      ['C0', 'C0 - inadequate / incomplete study'],
      ['C1', 'C1 - normal colon or benign finding'],
      ['C2a', 'C2a - indeterminate 6-9 mm polyp(s), fewer than three'],
      ['C2b', 'C2b - mass-like but likely benign stricture'],
      ['C3', 'C3 - polyp(s) >= 10 mm, or >= 3 polyps 6-9 mm'],
      ['C4', 'C4 - colonic mass, malignant-appearing'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['crads-cat'], () => safe(o, () => {
      const r = M.cRads({ category: val('crads-cat') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Category', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
