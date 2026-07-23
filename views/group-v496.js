// spec-v496: renderer for the Lodwick grading of bone-lesion aggressiveness (grades IA, IB, IC, II, III).
// Group G. The clinician picks the grade; the tile reports the grade and its margin / destruction-pattern
// description. As a grade descriptor it reports the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Lodwick grade; it never asserts a diagnosis, a benign-or-malignant
// call, or a biopsy decision (lib/lodwick-grade-v496.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lodwick-grade-v496.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the musculoskeletal radiology and orthopedic-oncology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'lodwick-grade'(root) {
    note(root, 'The Lodwick grading of how aggressive a focal bone lesion looks on radiographs, read from the lesion margin and the pattern of bone destruction. Pick the grade. IA: geographic with a sclerotic margin; IB: geographic, well-defined, no sclerotic rim; IC: geographic with an ill-defined margin; II: geographic with moth-eaten or permeative areas; III: moth-eaten or permeative throughout. A higher grade indicates a faster-growing, more aggressive-appearing lesion, not a specific tumor. Near-neighbors: enneking, mirels-score.');
    root.appendChild(select('Lodwick grade', 'lodwick-grade', [
      ['IA', 'IA - geographic, sclerotic margin'],
      ['IB', 'IB - geographic, well-defined, no sclerotic rim'],
      ['IC', 'IC - geographic, ill-defined margin'],
      ['II', 'II - geographic with moth-eaten or permeative areas'],
      ['III', 'III - moth-eaten or permeative throughout'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['lodwick-grade'], () => safe(o, () => {
      const r = M.lodwickGrade({ grade: val('lodwick-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
