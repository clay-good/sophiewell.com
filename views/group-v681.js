// spec-v681 §2: renderer for sano-kawasaki — the Sano score for IVIG resistance in
// Kawasaki disease (Clinical Scoring & Risk, Group G). Completes the cluster with egami
// and kobayashi-kawasaki.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three lab
// number inputs; a count of criteria (0-3) maps to a low/high resistance-risk band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sano-kawasaki-v681.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Sano score estimates the risk of IVIG resistance in Kawasaki disease from three pre-treatment labs; meeting 2 or more of 3 criteria flags high risk. Discrimination is lower in Western and infant cohorts. It supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'sano-kawasaki'(root) {
    note(root, 'Sano score (Sano 2007): predicts resistance to IVIG in Kawasaki disease from three pre-treatment labs. AST ≥ 200 IU/L, total bilirubin ≥ 0.9 mg/dL, and CRP ≥ 7 mg/dL each count 1 point (total 0–3). Meeting ≥ 2 of the 3 is high risk.');
    root.appendChild(numberField('AST (IU/L)', 'sano-ast', '1'));
    root.appendChild(numberField('Total bilirubin (mg/dL)', 'sano-bili', '0.1'));
    root.appendChild(numberField('CRP (mg/dL)', 'sano-crp', '0.1'));
    const ids = ['sano-ast', 'sano-bili', 'sano-crp'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.sanoKawasaki({ ast: val('sano-ast'), bilirubin: val('sano-bili'), crp: val('sano-crp') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/3` },
        { label: 'Risk', value: r.tier === 'high' ? 'high' : 'low' },
      ]);
      note(o, r.factors.length ? `Criteria met: ${r.factors.join(', ')}.` : 'No criteria met (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
