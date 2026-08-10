// spec-v684 §2: renderer for fractional-excretion-potassium — FEK (Clinical Scoring &
// Risk, Group G). Completes the fractional-excretion family alongside FENa / FEurea / FEMg.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Four number
// inputs (urine/plasma potassium and creatinine); a formula returns FEK %.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fractional-excretion-potassium-v684.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '0.1', inputmode: 'decimal' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. FEK distinguishes renal from extrarenal potassium handling, but its meaning flips with the serum potassium, so read it alongside the potassium and the clinical picture. It supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'fractional-excretion-potassium'(root) {
    note(root, 'Fractional excretion of potassium (FEK) = (urine K × plasma creatinine) / (plasma K × urine creatinine) × 100. Distinguishes renal from extrarenal potassium handling. Typical diet averages ~8%; interpretation depends on the serum potassium.');
    root.appendChild(numberField('Urine potassium (mEq/L)', 'fek-uk', '0.1'));
    root.appendChild(numberField('Plasma/serum potassium (mEq/L)', 'fek-pk', '0.1'));
    root.appendChild(numberField('Urine creatinine (mg/dL)', 'fek-ucr', '1'));
    root.appendChild(numberField('Plasma/serum creatinine (mg/dL)', 'fek-pcr', '0.1'));
    const ids = ['fek-uk', 'fek-pk', 'fek-ucr', 'fek-pcr'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.fractionalExcretionPotassium({ urineK: val('fek-uk'), plasmaK: val('fek-pk'), urineCr: val('fek-ucr'), plasmaCr: val('fek-pcr') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'FEK', value: `${r.fek}%` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
