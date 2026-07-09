// spec-v266 §2.2: renderer for the SSIGN score (Stage, Size, Grade, Necrosis) — the Mayo
// cancer-specific-survival model for clear-cell RCC after nephrectomy. Group G. The
// Leibovich and UISS tiles are parked this slice (spec-v266 §7); only SSIGN ships.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note the tile defers the surveillance/treatment decision to the
// oncology team (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rcc-prognosis-v266.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The decision to surveil, offer adjuvant therapy, or enroll stays with the oncology team and the patient.' }));
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
  'ssign-score'(root) {
    note(root, 'SSIGN score (Frank/Mayo 2002): cancer-specific survival after nephrectomy for clear-cell RCC. Total 0-17; uses 1997 TNM and Fuhrman grade. Near-neighbors: imdc-rcc, mskcc-rcc, ecog-karnofsky.');
    root.appendChild(select('Primary tumor (pT) stage', 'ss-t', [['pt1', 'pT1 (0)'], ['pt2', 'pT2 (+1)'], ['pt3', 'pT3 (+2)'], ['pt4', 'pT4 (+4)']]));
    root.appendChild(select('Regional lymph nodes', 'ss-n', [['n0', 'pNx or pN0 (0)'], ['n1', 'pN1 or pN2 (+2)']]));
    root.appendChild(select('Distant metastasis', 'ss-m', [['m0', 'M0 (0)'], ['m1', 'M1 (+4)']]));
    root.appendChild(select('Tumor size', 'ss-size', [['lt5', '< 5 cm (0)'], ['ge5', '>= 5 cm (+2)']]));
    root.appendChild(select('Fuhrman nuclear grade', 'ss-grade', [['g12', 'Grade 1-2 (0)'], ['g3', 'Grade 3 (+1)'], ['g4', 'Grade 4 (+3)']]));
    root.appendChild(select('Coagulative tumor necrosis', 'ss-necrosis', [['absent', 'Absent (0)'], ['present', 'Present (+2)']]));
    const o = out(); root.appendChild(o);
    wire(['ss-t', 'ss-n', 'ss-m', 'ss-size', 'ss-grade', 'ss-necrosis'], () => safe(o, () => {
      render(o, M.ssign({
        tStage: val('ss-t'), nStage: val('ss-n'), mStage: val('ss-m'),
        size: val('ss-size'), grade: val('ss-grade'), necrosis: val('ss-necrosis'),
      }), 'SSIGN');
    }));
    postureNote(root);
  },
};
