// spec-v523: renderer for the Scadding stage of pulmonary sarcoidosis. Group G. One select under an h2
// section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The option text carries each stage's defining radiographic features, so the reader picks the picture
// rather than a number. Per spec-v11 section 5.3 the tile describes a radiograph; it never asserts a
// diagnosis of sarcoidosis, a lung-function finding, or a corticosteroid indication (lib/scadding-v523.js).
//
// Same input/render contract as the rest of the codebase: the select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/scadding-v523.js';
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
  'scadding'(root) {
    note(root, 'The Scadding stage describes the chest radiograph in sarcoidosis, from 0 (normal) to IV (fibrosis). The numbers are not a severity scale and not a sequence: stage III is defined by the absence of the adenopathy that defines stages I and II, so it is not stage II plus more. The scale correlates poorly with lung function, and it describes only the chest.');

    heading(root, 'Chest radiograph appearance');
    root.appendChild(select('Which picture does the radiograph show?', 'scad-stage',
      M.SCADDING_STAGES.map((s) => [s.value, `${s.label} — ${s.text}`])));

    const o = out(); root.appendChild(o);
    wire(['scad-stage'], () => safe(o, () => {
      const r = M.scadding({ stage: val('scad-stage') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.stage },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
