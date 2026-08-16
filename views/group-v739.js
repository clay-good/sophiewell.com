// spec-v739 §2: renderer for mayo-olecranon — the Mayo classification of olecranon
// fractures (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three enum
// selects (displacement, ulnohumeral stability, comminution) map to a type code
// IA..IIIB. Stability only matters once the fracture is displaced.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mayo-olecranon-v739.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Mayo type is read from imaging and the clinical exam; management decisions stay with the treating surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const DISP = [{ value: '', text: '— select —' }, { value: 'undisplaced', text: 'Undisplaced (under about 3 mm)' }, { value: 'displaced', text: 'Displaced (about 3 mm or more)' }];
const STAB = [{ value: '', text: '— select —' }, { value: 'stable', text: 'Stable (ulnohumeral joint congruent, ligaments intact)' }, { value: 'unstable', text: 'Unstable (fracture-dislocation)' }];
const COMM = [{ value: '', text: '— select —' }, { value: 'noncomminuted', text: 'Noncomminuted (subtype A)' }, { value: 'comminuted', text: 'Comminuted (subtype B)' }];

export const renderers = {
  'mayo-olecranon'(root) {
    note(root, 'Mayo classification (Morrey 1993): displacement, ulnohumeral joint stability, and comminution set the type. Undisplaced = Type I; displaced-and-stable = Type II; displaced-and-unstable (fracture-dislocation) = Type III. Subtype A = noncomminuted, B = comminuted. Stability only matters once the fracture is displaced.');
    root.appendChild(selectField('Displacement', 'mayo-disp', DISP));
    root.appendChild(selectField('Ulnohumeral joint stability (if displaced)', 'mayo-stab', STAB));
    root.appendChild(selectField('Comminution', 'mayo-comm', COMM));
    const ids = ['mayo-disp', 'mayo-stab', 'mayo-comm'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.mayoOlecranon({ displacement: val('mayo-disp'), stability: val('mayo-stab'), comminution: val('mayo-comm') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.code },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
