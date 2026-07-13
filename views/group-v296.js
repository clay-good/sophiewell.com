// spec-v296: renderer for the benzodiazepine dose-equivalence converter. Group G.
// The clinician picks a source benzodiazepine and dose (mg) and an optional
// target benzodiazepine; the tile reports the oral-diazepam equivalent and the
// target-drug equivalent under BOTH the VA/DoD 2021 and Ashton 2002 systems.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 this is a tapering planning estimate, not a prescription — it
// never emits an order (lib/benzo-equiv-v296.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/benzo-equiv-v296.js';
import { resultRow } from '../lib/result-copy.js';

const AGENT_OPTIONS = [
  ['alprazolam', 'Alprazolam'],
  ['chlordiazepoxide', 'Chlordiazepoxide'],
  ['clonazepam', 'Clonazepam'],
  ['clorazepate', 'Clorazepate'],
  ['diazepam', 'Diazepam'],
  ['estazolam', 'Estazolam'],
  ['flurazepam', 'Flurazepam'],
  ['lorazepam', 'Lorazepam'],
  ['oxazepam', 'Oxazepam'],
  ['quazepam', 'Quazepam'],
  ['temazepam', 'Temazepam'],
  ['triazolam', 'Triazolam'],
];

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const [value, text] of options) sel.appendChild(el('option', { value, text }));
  wrap.appendChild(sel);
  return wrap;
}
function numField(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function numVal(id) { const n = document.getElementById(id); if (!n || n.value === '') return null; const v = Number(n.value); return Number.isFinite(v) ? v : null; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'benzodiazepine-equivalence'(root) {
    note(root, 'Benzodiazepine dose-equivalence converter for tapering. Pick the source benzodiazepine and dose, and (optionally) a target benzodiazepine, to see the oral-diazepam equivalent and target-drug dose under both the VA/DoD 2021 and Ashton 2002 systems. Equivalents are approximate and differ between systems — individualize. Near-neighbors: opioid-conversion, steroid-equiv.');
    root.appendChild(select('Source benzodiazepine', 'bz-source', AGENT_OPTIONS));
    root.appendChild(numField('Source dose (mg)', 'bz-dose', { min: '0', step: 'any', placeholder: 'e.g. 2' }));
    root.appendChild(select('Target benzodiazepine', 'bz-target', AGENT_OPTIONS));

    const o = out(); root.appendChild(o);
    wire(['bz-source', 'bz-dose', 'bz-target'], () => safe(o, () => {
      const r = M.benzoEquivalence({
        source: val('bz-source'),
        dose: numVal('bz-dose'),
        target: val('bz-target'),
      });
      if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
      const rows = [
        { text: r.band, cls: null },
        { label: 'Oral diazepam equiv (VA/DoD)', value: `${r.diazepamEquivVaDod} mg` },
        { label: 'Oral diazepam equiv (Ashton)', value: `${r.diazepamEquivAshton} mg` },
      ];
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
