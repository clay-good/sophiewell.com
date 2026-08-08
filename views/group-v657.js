// spec-v657 §2: renderer for isgls-phlf — the ISGLS grading of post-hepatectomy liver
// failure (Clinical Scoring & Risk, Group G). Companion to isgps-popf.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. A lab-gate
// checkbox gates the PHLF; an invasive-treatment and a management-deviation checkbox set
// the grade (most severe wins), otherwise Grade A.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/isgls-phlf-v657.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The grade follows the ISGLS definition from the lab gate and the postoperative course you entered; it is read with the surgical team and the full record.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'isgls-phlf'(root) {
    note(root, 'ISGLS grading of post-hepatectomy liver failure (Rahbari 2011). The gate is increased INR (or FFP need) and hyperbilirubinemia on/after POD 5 (rising if abnormal preop). Given the gate: invasive treatment = Grade C; a deviation managed without invasive treatment = Grade B; otherwise Grade A (abnormal labs, no management change).');
    root.appendChild(checkField('Increased INR (or FFP need) AND hyperbilirubinemia on/after POD 5 (the PHLF gate)', 'phlf-gate'));
    root.appendChild(checkField('Requires invasive treatment: hemodialysis/RRT, mechanical ventilation, vasopressors, rescue hepatectomy or salvage transplant (Grade C)', 'phlf-c'));
    root.appendChild(checkField('Deviation managed without invasive treatment: FFP, albumin, diuretics, non-invasive ventilation, or ICU admission alone (Grade B)', 'phlf-b'));
    const ids = ['phlf-gate', 'phlf-c', 'phlf-b'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.isglsPhlf({ labGate: chk('phlf-gate'), invasiveTreatment: chk('phlf-c'), managementDeviation: chk('phlf-b') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.code },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
