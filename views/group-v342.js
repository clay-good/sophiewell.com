// spec-v342: renderer for the Hawkins classification of a talar neck fracture (types I-IV). Group G.
// The clinician picks the fracture pattern; the tile reports the type, its description, the
// classically reported avascular-necrosis (AVN) risk range, and whether it is a more severe
// (type III-IV) pattern.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Hawkins type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/hawkins-talar-v342.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hawkins-talar-v342.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The operative and management decisions stay with the surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hawkins-talar'(root) {
    note(root, 'Hawkins classification (Hawkins 1970; type IV added Canale-Kelly 1978) of a talar neck fracture — the fracture pattern, which correlates with avascular-necrosis (AVN) risk. Pick the type. I nondisplaced (AVN ~0-15%); II with subtalar dislocation (~20-50%); III with subtalar + ankle dislocation (~70-100%); IV also with talonavicular dislocation (highest). The AVN-risk ranges are classically reported case-series figures, not a per-patient prediction. Near-neighbors: mason-radial-head, weber-ankle.');
    root.appendChild(select('Hawkins type', 'hawkins-type', [
      ['I', 'I — nondisplaced, no dislocation'],
      ['II', 'II — displaced, subtalar dislocation'],
      ['III', 'III — displaced, subtalar + ankle dislocation'],
      ['IV', 'IV — also talonavicular dislocation (Canale-Kelly)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['hawkins-type'], () => safe(o, () => {
      const r = M.hawkinsTalar({ type: val('hawkins-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
        { label: 'AVN risk', value: r.avnRisk },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
