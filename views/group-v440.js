// spec-v440: renderer for the Barrow classification of carotid-cavernous fistula (types A-D). Group G. The
// clinician picks the type; the tile reports the type and its arterial-supply description. As a type
// descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Barrow type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/barrow-ccf-v440.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/barrow-ccf-v440.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the neurosurgery / neurointervention team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'barrow-ccf'(root) {
    note(root, 'The Barrow classification of carotid-cavernous fistula (CCF), by the arterial supply and flow. Pick the type. A: direct high-flow ICA-to-cavernous-sinus shunt (often traumatic); B: dural shunt from ICA meningeal branches; C: dural shunt from ECA meningeal branches; D: dural shunt from both. B/C/D are the indirect (dural) fistulas. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: spetzler-ponce.');
    root.appendChild(select('Barrow type', 'barrow-type', [
      ['A', 'A - direct ICA-to-cavernous-sinus shunt (high-flow)'],
      ['B', 'B - dural shunt from ICA meningeal branches'],
      ['C', 'C - dural shunt from ECA meningeal branches'],
      ['D', 'D - dural shunt from both ICA and ECA'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['barrow-type'], () => safe(o, () => {
      const r = M.barrowCcf({ type: val('barrow-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
