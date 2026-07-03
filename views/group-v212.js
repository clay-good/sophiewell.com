// spec-v212 §2: renderers for the hepatology fibrosis & portal-hypertension
// prognosis instruments — King's Score (and, as shipped, Baveno VII / BALAD-2 /
// HKLC). Group G. Shipped one tile at a time. (hepamet-fibrosis is already live
// from spec-v201 — not rendered here.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the biopsy / endoscopy / treatment
// decision to the clinician and the patient (spec-v11 §5.3) — these stratify
// probability, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hep-fibrosis-portal-v212.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal', ...attrs });
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The biopsy, endoscopy, and treatment decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.3 king-score ------------------------------------------------------
  'king-score'(root) {
    note(root, 'King’s Score (Cross 2009): a simple four-variable non-invasive marker of cirrhosis — King’s Score = (age × AST × INR) / platelets (×10⁹/L). A score ≥ 16.7 rules cirrhosis in (sensitivity 86%, specificity 80%, NPV 96%); ≥ 12.3 marks significant fibrosis (F3-6); < 12.3 rules it out. Used alongside FIB-4 and APRI. Near-neighbors: fib4, apri.');
    root.appendChild(num('Age (years)', 'king-age', { min: '0' }));
    root.appendChild(num('AST (IU/L)', 'king-ast', { min: '0' }));
    root.appendChild(num('INR', 'king-inr', { min: '0' }));
    root.appendChild(num('Platelet count (×10⁹/L)', 'king-plt', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['king-age', 'king-ast', 'king-inr', 'king-plt'];
    wire(ids, () => safe(o, () => {
      const r = M.kingScore({ age: val('king-age'), ast: val('king-ast'), inr: val('king-inr'), platelets: val('king-plt') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'King', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
