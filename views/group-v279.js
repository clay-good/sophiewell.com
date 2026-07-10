// spec-v279 §2: renderers for the resected-RCC prognostic instruments — the
// Leibovich progression score and the UCLA Integrated Staging System (UISS).
// Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers surveillance and adjuvant-therapy
// decisions to the oncology team (spec-v11 §5.3): it reports a recurrence risk or
// a risk tier, never a treatment order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rcc-prognosis-v279.js';
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
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The surveillance and adjuvant-therapy decision stays with the oncology team and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.bandLabel, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'leibovich-rcc'(root) {
    note(root, 'Leibovich progression score (2003) for clear-cell RCC after radical nephrectomy — the recurrence-risk model that stratifies for adjuvant trials. Total 0–11: low 0–2, intermediate 3–5, high ≥ 6. Near-neighbors: ssign-score, uiss-rcc, imdc-rcc.');
    root.appendChild(select('Primary tumor stage (pT)', 'leib-pt', [['pt1a', 'pT1a (0)'], ['pt1b', 'pT1b (+2)'], ['pt2', 'pT2 (+3)'], ['pt3-4', 'pT3–pT4 (+4)']]));
    root.appendChild(select('Regional lymph nodes', 'leib-n', [['n0', 'pNx / pN0 (0)'], ['n1-2', 'pN1 / pN2 (+2)']]));
    root.appendChild(select('Tumor size', 'leib-size', [['lt10', '< 10 cm (0)'], ['ge10', '≥ 10 cm (+1)']]));
    root.appendChild(select('Nuclear (Fuhrman) grade', 'leib-grade', [['g1-2', 'Grade 1–2 (0)'], ['g3', 'Grade 3 (+1)'], ['g4', 'Grade 4 (+3)']]));
    root.appendChild(check('Coagulative tumor necrosis present (+1)', 'leib-necrosis'));
    const o = out(); root.appendChild(o);
    wire(['leib-pt', 'leib-n', 'leib-size', 'leib-grade', 'leib-necrosis'], () => safe(o, () => {
      render(o, M.leibovichRcc({
        ptStage: val('leib-pt'), nodes: val('leib-n'), size: val('leib-size'),
        grade: val('leib-grade'), necrosis: chk('leib-necrosis'),
      }), 'Leibovich');
    }));
    postureNote(root);
  },
  'uiss-rcc'(root) {
    note(root, 'UCLA Integrated Staging System (UISS) for surgically resected, localized (N0M0) RCC — integrates 1997 TNM stage, Fuhrman grade, and ECOG performance status into low / intermediate / high tiers (5-year overall survival ~92% / 67% / 44%). The node-positive/metastatic branch is out of scope; use imdc-rcc / mskcc-rcc there. Near-neighbors: leibovich-rcc, ssign-score, mskcc-rcc.');
    root.appendChild(select('Primary tumor stage (T, 1997 TNM)', 'uiss-t', [['t1', 'T1'], ['t2', 'T2'], ['t3', 'T3'], ['t4', 'T4']]));
    root.appendChild(select('Fuhrman grade', 'uiss-grade', [['1', 'Grade 1'], ['2', 'Grade 2'], ['3', 'Grade 3'], ['4', 'Grade 4']]));
    root.appendChild(select('ECOG performance status', 'uiss-ecog', [['ecog0', 'ECOG 0'], ['ecog1plus', 'ECOG ≥ 1']]));
    const o = out(); root.appendChild(o);
    wire(['uiss-t', 'uiss-grade', 'uiss-ecog'], () => safe(o, () => {
      render(o, M.uissRcc({
        tStage: val('uiss-t'), grade: val('uiss-grade'), ecog: val('uiss-ecog'),
      }), 'UISS');
    }));
    postureNote(root);
  },
};
