// spec-v320: renderer for the Clavien-Dindo classification of surgical complications.
// Group G. The clinician picks the grade (I-V, with IIIa/IIIb/IVa/IVb sub-grades); the
// tile reports the grade and its standard definition.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the severity grade; it never asserts a diagnosis or a
// management decision (lib/clavien-dindo-v320.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/clavien-dindo-v320.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and management stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'clavien-dindo'(root) {
    note(root, 'Clavien-Dindo classification of surgical complications (Dindo 2004): graded by the therapy the complication required. Pick the grade. IIIb (reoperation under general anesthesia) and IV–V (life-threatening / death) mark the severe end. Near-neighbors: euroscore2.');
    root.appendChild(select('Clavien-Dindo grade (therapy the complication required)', 'cd-grade', [
      ['I', 'I — no treatment beyond antiemetics/analgesics/electrolytes/physio (or bedside wound opening)'],
      ['II', 'II — pharmacological treatment beyond grade I (incl. transfusion, TPN)'],
      ['IIIa', 'IIIa — surgical/endoscopic/radiological intervention, not under general anesthesia'],
      ['IIIb', 'IIIb — intervention under general anesthesia'],
      ['IVa', 'IVa — life-threatening, single-organ dysfunction (incl. dialysis)'],
      ['IVb', 'IVb — life-threatening, multiorgan dysfunction'],
      ['V', 'V — death of the patient'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['cd-grade'], () => safe(o, () => {
      const r = M.clavienDindo({ grade: val('cd-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.grade },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
