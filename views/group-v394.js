// spec-v394: renderer for the Borrmann classification of advanced gastric cancer (types I-IV). Group G.
// The clinician picks the type; the tile reports the type and its gross-appearance description. As a
// morphology-type descriptor it does not flag any type as abnormal.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Borrmann type; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/borrmann-gastric-v394.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/borrmann-gastric-v394.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the oncology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'borrmann-gastric'(root) {
    note(root, 'Borrmann classification of advanced gastric cancer, by the gross (macroscopic) tumor appearance. Pick the type. I: polypoid (protruding, demarcated, no ulcer); II: fungating / ulcerated (raised margins); III: ulcerated and infiltrative (ill-defined margins); IV: diffusely infiltrative / linitis plastica (no mass or ulcer). Type IV is classically the worst prognosis. Near-neighbors: lauren-gastric.');
    root.appendChild(select('Borrmann type', 'borrmann-type', [
      ['I', 'Type I - polypoid'],
      ['II', 'Type II - fungating / ulcerated'],
      ['III', 'Type III - ulcerated and infiltrative'],
      ['IV', 'Type IV - diffusely infiltrative (linitis plastica)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['borrmann-type'], () => safe(o, () => {
      const r = M.borrmannGastric({ type: val('borrmann-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
