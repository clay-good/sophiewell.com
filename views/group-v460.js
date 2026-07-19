// spec-v460: renderer for the Enneking surgical staging of malignant musculoskeletal tumors (stages IA-III).
// Group G. The clinician picks the stage; the tile reports the stage and its grade / compartment / metastasis
// combination. As a stage descriptor it reports the stage the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Enneking stage; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/enneking-v460.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/enneking-v460.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic-oncology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'enneking'(root) {
    note(root, 'The Enneking (MSTS) surgical staging of malignant musculoskeletal tumors, combining histologic grade (G), compartment (T), and metastasis (M). Pick the stage. IA: G1 T1 M0; IB: G1 T2 M0; IIA: G2 T1 M0; IIB: G2 T2 M0; III: any M1. Reports the stage the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: mirels-score.');
    root.appendChild(select('Enneking stage', 'enneking-stage', [
      ['IA', 'IA - low-grade, intracompartmental, no mets'],
      ['IB', 'IB - low-grade, extracompartmental, no mets'],
      ['IIA', 'IIA - high-grade, intracompartmental, no mets'],
      ['IIB', 'IIB - high-grade, extracompartmental, no mets'],
      ['III', 'III - any metastasis'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['enneking-stage'], () => safe(o, () => {
      const r = M.enneking({ stage: val('enneking-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
