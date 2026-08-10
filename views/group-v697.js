// spec-v697 §2: renderer for kings-score — the King's Score for liver fibrosis (Clinical
// Scoring & Risk, Group G). A companion noninvasive fibrosis index to FIB-4 / APRI.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Four number
// inputs; a formula returns the King's Score with a fibrosis band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/kings-score-v697.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '1', inputmode: 'decimal' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The King\'s Score is a noninvasive estimate derived in chronic hepatitis C; other liver diseases use different thresholds. It supports rather than replaces biopsy, elastography, and clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'kings-score'(root) {
    note(root, "King's Score (Cross 2009): a noninvasive liver-fibrosis index for chronic hepatitis C. Score = (age × AST × INR) / platelets (×10⁹/L). Cut-points: < 12.3 low, ≥ 12.3 significant fibrosis (Ishak F3–F6), ≥ 16.7 cirrhosis.");
    root.appendChild(numberField('Age (years)', 'ks-age', '1'));
    root.appendChild(numberField('AST (U/L)', 'ks-ast', '1'));
    root.appendChild(numberField('INR', 'ks-inr', '0.1'));
    root.appendChild(numberField('Platelet count (×10⁹/L)', 'ks-plt', '1'));
    const ids = ['ks-age', 'ks-ast', 'ks-inr', 'ks-plt'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.kingsScore({ age: val('ks-age'), ast: val('ks-ast'), inr: val('ks-inr'), platelets: val('ks-plt') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
