// spec-v698 §2: renderer for qcsi — the Quick COVID-19 Severity Index (Clinical Scoring &
// Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three number
// inputs (respiratory rate, SpO2, O2 flow); a banded sum 0-12 gives the 24-hour risk.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/qcsi-v698.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The qCSI was derived on admitted COVID-19 patients on low-flow oxygen and is not a substitute for continuous monitoring; it supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'qcsi'(root) {
    note(root, 'Quick COVID-19 Severity Index (Haimovich 2020): 24-hour risk of respiratory decompensation. Respiratory rate (≤ 22 = 0, 23–28 = 1, > 28 = 2), SpO2 (> 92 = 0, 89–92 = 2, ≤ 88 = 5), O2 flow (≤ 2 = 0, 3–4 = 4, ≥ 5 = 5). Total 0–12; > 3 is elevated.');
    root.appendChild(numberField('Respiratory rate (breaths/min)', 'qcsi-rr', '1'));
    root.appendChild(numberField('Pulse oximetry SpO2 (%)', 'qcsi-spo2', '1'));
    root.appendChild(numberField('Oxygen flow rate (L/min, 0 = room air)', 'qcsi-o2', '1'));
    const ids = ['qcsi-rr', 'qcsi-spo2', 'qcsi-o2'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.qcsi({ respiratoryRate: val('qcsi-rr'), spo2: val('qcsi-spo2'), o2Flow: val('qcsi-o2') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/12` },
        { label: '24h risk', value: r.risk },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
