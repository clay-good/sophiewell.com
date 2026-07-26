// spec-v478: renderer for the Spaulding device-reprocessing classification (critical / semicritical /
// noncritical). Group G. The clinician picks the category; the tile reports the category and its required
// reprocessing. As a category descriptor it reports the category the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Spaulding category; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/spaulding-classification-v478.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/spaulding-classification-v478.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. Always follow the device instructions for use and the sterile-processing / infection-prevention team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'spaulding-classification'(root) {
    note(root, 'The Spaulding classification of medical devices for reprocessing, by the infection risk of the site the device contacts. Pick the category. Critical: enters sterile tissue or the bloodstream, requires sterilization; Semicritical: contacts mucous membranes or non-intact skin, requires at least high-level disinfection; Noncritical: contacts intact skin only, requires low-level disinfection. Reports the category the clinician has determined; always follow the device instructions for use. Near-neighbor: device-day-counter.');
    root.appendChild(select('Spaulding category', 'spaulding-category', [
      ['critical', 'Critical - enters sterile tissue / bloodstream'],
      ['semicritical', 'Semicritical - contacts mucous membranes / non-intact skin'],
      ['noncritical', 'Noncritical - contacts intact skin only'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['spaulding-category'], () => safe(o, () => {
      const r = M.spauldingClassification({ category: val('spaulding-category') });
      resultRow(o, [
        { text: r.band },
        { label: 'Category', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
