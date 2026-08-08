// spec-v671 §2: renderer for acr-eular-boolean — the ACR/EULAR Boolean-based
// remission definition for rheumatoid arthritis (Clinical Scoring & Risk, Group G).
// Companion to the built RA disease-activity indices (das28, cdai-ra, sdai-ra).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Four number
// inputs (TJC28, SJC28, CRP mg/dL, PtGA 0-10); a strict AND of four thresholds yields
// the 2011 and 2022 Boolean 2.0 remission verdicts.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/acr-eular-boolean-v671.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step, max) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const attrs = { id, type: 'number', min: '0', step, inputmode: step === '1' ? 'numeric' : 'decimal' };
  if (max !== undefined) attrs.max = max;
  wrap.appendChild(el('input', attrs));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. Boolean remission is a strict all-four rule; the 2011 and 2022 versions differ only in the patient-global threshold. Watch the units — CRP is mg/dL (1 mg/dL = 10 mg/L) and the patient global is a 0-10 scale. The separate index-based SDAI definition is not computed here. Treatment decisions stay with the clinician and patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'acr-eular-boolean'(root) {
    note(root, 'ACR/EULAR Boolean remission (Felson 2011; 2022 revision): remission requires ALL of TJC28 ≤ 1, SJC28 ≤ 1, CRP ≤ 1 mg/dL, and patient global ≤ 1 (2011) or ≤ 2 (2022 Boolean 2.0) on a 0–10 scale. Companion tiles: das28, cdai-ra, sdai-ra.');
    root.appendChild(numberField('Tender joint count (28-joint)', 'boolean-tjc', '1', '28'));
    root.appendChild(numberField('Swollen joint count (28-joint)', 'boolean-sjc', '1', '28'));
    root.appendChild(numberField('C-reactive protein (mg/dL)', 'boolean-crp', '0.1'));
    root.appendChild(numberField('Patient global assessment (0–10 scale)', 'boolean-ptga', '0.1', '10'));
    const ids = ['boolean-tjc', 'boolean-sjc', 'boolean-crp', 'boolean-ptga'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.acrEularBoolean({ tjc: val('boolean-tjc'), sjc: val('boolean-sjc'), crp: val('boolean-crp'), ptga: val('boolean-ptga') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: '2022 Boolean 2.0', value: r.remission2022 ? 'remission' : 'active' },
        { label: '2011 Boolean', value: r.remission2011 ? 'remission' : 'active' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
