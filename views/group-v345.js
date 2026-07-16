// spec-v345: renderer for the Lichtman staging of Kienbock disease (lunate osteonecrosis) — stages
// I, II, IIIA, IIIB, IV. Group G. The clinician picks the radiographic stage; the tile reports the
// stage, its description, and whether it is a collapse (stage IIIA-IV) stage.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Lichtman stage; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/lichtman-kienbock-v345.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lichtman-kienbock-v345.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the hand surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'lichtman-kienbock'(root) {
    note(root, 'Lichtman staging (Lichtman 1977) of Kienbock disease (osteonecrosis of the carpal lunate). Pick the stage. I normal X-ray (abnormal MRI); II lunate sclerosis, shape preserved; IIIA lunate collapse, carpal alignment maintained; IIIB lunate collapse with fixed carpal collapse; IV generalized degenerative arthrosis. The pre-collapse (I-II) vs collapse (IIIA-IV) split is the classic reconstruct-vs-salvage watershed. Near-neighbors: ficat-arlet, hawkins-talar.');
    root.appendChild(select('Lichtman stage', 'lichtman-stage', [
      ['I', 'I — normal X-ray (abnormal MRI)'],
      ['II', 'II — lunate sclerosis, shape preserved'],
      ['IIIA', 'IIIA — lunate collapse, carpal alignment maintained'],
      ['IIIB', 'IIIB — lunate collapse with fixed carpal collapse'],
      ['IV', 'IV — generalized degenerative arthrosis'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['lichtman-stage'], () => safe(o, () => {
      const r = M.lichtmanKienbock({ stage: val('lichtman-stage') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: r.stage },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
