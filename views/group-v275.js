// spec-v275 §2: renderer for the RDW-to-platelet ratio (RPR) — a non-invasive
// liver-fibrosis marker. Group E. It joins the fibrosis family beside FIB-4 / APRI /
// Forns / Lok.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note the tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fibrosis-v275.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'rpr'(root) {
    note(root, 'RDW-to-platelet ratio = RDW (%) / platelet count (10⁹/L) (Chen 2013). A non-invasive liver-fibrosis marker; higher marks more advanced fibrosis (source cutoff ~0.1). Near-neighbors: fib4, apri, forns-index.');
    root.appendChild(num('Red cell distribution width (%)', 'rpr-rdw', { min: '0' }));
    root.appendChild(num('Platelet count (10⁹/L)', 'rpr-plt', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['rpr-rdw', 'rpr-plt'], () => safe(o, () => {
      render(o, M.rpr({ rdw: val('rpr-rdw'), platelets: val('rpr-plt') }), 'RPR');
    }));
    postureNote(root);
  },
};
