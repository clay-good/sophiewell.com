// spec-v658 §2: renderer for isgls-bile-leak — the ISGLS grading of bile leakage after
// hepatobiliary and pancreatic surgery (Clinical Scoring & Risk, Group G). Companion to
// isgps-popf and isgls-phlf.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. A bile-gate
// checkbox gates the leak; a relaparotomy and a management-change checkbox set the grade
// (most severe wins), otherwise Grade A.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/isgls-bile-leak-v658.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The grade follows the ISGLS definition from the drain-bilirubin gate and the postoperative course you entered; it is read with the surgical team and the full record.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'isgls-bile-leak'(root) {
    note(root, 'ISGLS grading of bile leakage after hepatobiliary/pancreatic surgery (Koch 2011). The gate is drain bilirubin at least 3x serum on/after POD 3, or need for radiologic/operative intervention. Given the gate: relaparotomy = Grade C; a change in management without relaparotomy (or a grade A leak > 1 week) = Grade B; otherwise Grade A (no/little management change).');
    root.appendChild(checkField('Drain bilirubin >= 3x serum on/after POD 3, OR need for radiologic/operative intervention (the bile-leak gate)', 'bile-gate'));
    root.appendChild(checkField('Requires relaparotomy (Grade C)', 'bile-c'));
    root.appendChild(checkField('Change in management without relaparotomy (percutaneous drainage, ERCP/stent), or a grade A leak persisting > 1 week (Grade B)', 'bile-b'));
    const ids = ['bile-gate', 'bile-c', 'bile-b'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.isglsBileLeak({ bileGate: chk('bile-gate'), relaparotomy: chk('bile-c'), managementChange: chk('bile-b') });
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
