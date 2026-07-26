// spec-v486: renderer for the Samilson-Prieto shoulder dislocation-arthropathy grading (mild/moderate/severe).
// Group G. The clinician picks the grade; the tile reports the grade and its osteophyte-size description. As a
// grade descriptor it reports the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Samilson-Prieto grade; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/samilson-prieto-v486.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/samilson-prieto-v486.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'samilson-prieto'(root) {
    note(root, 'The Samilson-Prieto classification of dislocation arthropathy of the shoulder, by the size of the inferior humeral / glenoid osteophyte on radiographs. Pick the grade. Mild: osteophyte less than 3 mm; Moderate: 3 to 7 mm, with slight joint irregularity; Severe: greater than 7 mm, with joint-space narrowing and sclerosis. Reports the grade the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: hamada.');
    root.appendChild(select('Samilson-Prieto grade', 'samilson-grade', [
      ['mild', 'Mild - osteophyte less than 3 mm'],
      ['moderate', 'Moderate - 3 to 7 mm, slight joint irregularity'],
      ['severe', 'Severe - greater than 7 mm, narrowing and sclerosis'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['samilson-grade'], () => safe(o, () => {
      const r = M.samilsonPrieto({ grade: val('samilson-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
