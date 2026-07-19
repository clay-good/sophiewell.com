// spec-v443: renderer for the Kadish staging of esthesioneuroblastoma (stages A-D). Group G. The clinician
// picks the stage; the tile reports the stage and its anatomic-extent description. As a stage descriptor it
// reports the stage the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Kadish stage; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/kadish-v443.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/kadish-v443.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the head-and-neck oncology / skull-base team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'kadish'(root) {
    note(root, 'The Kadish staging of esthesioneuroblastoma (olfactory neuroblastoma), by the anatomic extent of the tumor. Pick the stage. A: confined to the nasal cavity; B: nasal cavity plus paranasal sinuses; C: beyond the sinuses (orbit, skull base, intracranial); D: metastasis to cervical nodes or distant sites (Morita modification). Reports the stage the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: cotton-myer.');
    root.appendChild(select('Kadish stage', 'kadish-stage', [
      ['A', 'A - confined to the nasal cavity'],
      ['B', 'B - nasal cavity plus paranasal sinuses'],
      ['C', 'C - beyond the sinuses (orbit, skull base, intracranial)'],
      ['D', 'D - metastasis (cervical nodes or distant)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['kadish-stage'], () => safe(o, () => {
      const r = M.kadish({ stage: val('kadish-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
