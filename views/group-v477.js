// spec-v477: renderer for the SFU hydronephrosis grading (grades 0-4). Group G. The clinician picks the grade;
// the tile reports the grade and its dilatation description. As a grade descriptor it reports the grade the
// clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the SFU grade; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/sfu-hydronephrosis-v477.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sfu-hydronephrosis-v477.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the urology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'sfu-hydronephrosis'(root) {
    note(root, 'The Society for Fetal Urology (SFU) ultrasound grading of hydronephrosis, by renal-sinus and calyceal dilatation and parenchymal thinning. Pick the grade. 0: intact central renal complex; 1: renal pelvis only; 2: pelvis and a few calyces; 3: pelvis and all calyces uniformly dilated (normal parenchyma); 4: as grade 3 plus parenchymal thinning. Reports the grade the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: koff-bladder-capacity.');
    root.appendChild(select('SFU grade', 'sfu-grade', [
      ['0', '0 - intact central renal complex'],
      ['1', '1 - renal pelvis only'],
      ['2', '2 - pelvis and a few calyces'],
      ['3', '3 - pelvis and all calyces (normal parenchyma)'],
      ['4', '4 - grade 3 plus parenchymal thinning'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['sfu-grade'], () => safe(o, () => {
      const r = M.sfuHydronephrosis({ grade: val('sfu-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
