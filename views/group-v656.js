// spec-v656 §2: renderer for isgps-popf — the ISGPS 2016 grading of postoperative
// pancreatic fistula (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. An amylase-gate
// checkbox gates the POPF; a grade-C and a grade-B checkbox set the grade (most severe
// wins), otherwise a biochemical leak.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/isgps-popf-v656.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The grade follows the ISGPS 2016 definition from the drain-amylase gate and the postoperative course you entered; it is read with the surgical team and the full record.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'isgps-popf'(root) {
    note(root, 'ISGPS 2016 grading of postoperative pancreatic fistula (Bassi 2017). The gate is drain amylase over 3x the upper limit of normal serum amylase on/after POD 3. Given the gate: reoperation/organ failure/death = Grade C; a clinically relevant change in management = Grade B; otherwise a biochemical leak (the former Grade A, no longer a true fistula).');
    root.appendChild(checkField('Drain amylase > 3x upper limit of normal serum amylase, on/after POD 3 (the POPF gate)', 'popf-gate'));
    root.appendChild(checkField('Reoperation, single/multiple organ failure, or death attributable to POPF (Grade C)', 'popf-c'));
    root.appendChild(checkField('Clinically relevant change in management: drains > 3 wk or repositioned, percutaneous/endoscopic drainage, octreotide/antibiotics, angio for bleeding, or infection without organ failure (Grade B)', 'popf-b'));
    const ids = ['popf-gate', 'popf-c', 'popf-b'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.isgpsPopf({ amylaseGate: chk('popf-gate'), gradeCFeature: chk('popf-c'), gradeBFeature: chk('popf-b') });
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
