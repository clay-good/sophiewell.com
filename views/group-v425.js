// spec-v425: renderer for the vesicoureteral reflux grade (VCUG), grades I-V. Group G. The radiologist picks
// the grade; the tile reports the grade and its imaging description. As an imaging-grade descriptor it
// reports the grade the radiologist has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the vesicoureteral reflux grade; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/vur-grade-v425.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/vur-grade-v425.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the pediatric urology / nephrology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'vur-grade'(root) {
    note(root, 'International Reflux Study grading of vesicoureteral reflux (VUR) on a voiding cystourethrogram (VCUG). Pick the grade. I: ureter only; II: up to the pelvis, no dilatation; III: mild-to-moderate dilatation; IV: moderate dilatation and tortuosity, fornices obliterated; V: gross dilatation and tortuosity, intrarenal reflux. Reports the grade the radiologist has determined, not a diagnosis or a treatment decision.');
    root.appendChild(select('Vesicoureteral reflux grade', 'vur-grade', [
      ['I', 'I - ureter only, not reaching the pelvis'],
      ['II', 'II - up to the pelvis, no dilatation'],
      ['III', 'III - mild to moderate dilatation'],
      ['IV', 'IV - moderate dilatation and tortuosity, fornices obliterated'],
      ['V', 'V - gross dilatation and tortuosity, intrarenal reflux'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['vur-grade'], () => safe(o, () => {
      const r = M.vurGrade({ grade: val('vur-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
