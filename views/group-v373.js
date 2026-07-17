// spec-v373: renderer for the NI-RADS categories (1-4, with 2A/2B). Group G. The radiologist picks the
// category (for the primary site or the neck); the tile reports the category, its description, and
// whether it is a suspicious (category 3-4) finding.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the NI-RADS category; it never asserts a diagnosis, a management order,
// or a prognosis (lib/ni-rads-v373.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ni-rads-v373.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. NI-RADS is for surveillance after definitive treatment; the management decision stays with the head-and-neck oncology / radiology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ni-rads'(root) {
    note(root, 'NI-RADS (ACR Neck Imaging Reporting and Data System, Aiken 2018) - a category for post-treatment head-and-neck-cancer surveillance imaging, assigned separately to the primary site and the neck (nodes). Pick the category. 1: no recurrence (routine surveillance); 2A: low suspicion, mucosal; 2B: low suspicion, deep; 3: high suspicion (biopsy if indicated); 4: definite recurrence. Completes the RADS family: bi-rads, li-rads, c-rads, cad-rads.');
    root.appendChild(select('NI-RADS category', 'nirads-cat', [
      ['1', '1 - no evidence of recurrence'],
      ['2A', '2A - low suspicion, mucosal / superficial'],
      ['2B', '2B - low suspicion, deep'],
      ['3', '3 - high suspicion (biopsy if indicated)'],
      ['4', '4 - definite recurrence'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['nirads-cat'], () => safe(o, () => {
      const r = M.niRads({ category: val('nirads-cat') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Category', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
