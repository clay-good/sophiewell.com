// spec-v127 §2: renderers for the four nephrology-prognosis and AKI-staging
// instruments (kfre, rifle-aki, akin-aki, ufr-dialysis). kfre / rifle-aki /
// akin-aki home in Clinical Scoring & Risk (Group G); ufr-dialysis is Clinical
// Math & Conversions (Group E). v127 continues Wave 5 of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a
// probability, class, or rate, not management (spec-v11 §5.3). The logistic /
// ratio tiles surface a complete-the-fields fallback rather than a bad number.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nephro-v127.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const op of options) sel.appendChild(el('option', { value: op.value, text: op.text }));
  wrap.appendChild(sel);
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The probability, class, or rate is the cited instrument’s, computed from the values you entered. The management decision stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

const UO_RIFLE = [
  { value: '0', text: 'Normal / not assessed' },
  { value: '1', text: 'Risk — < 0.5 mL/kg/hr × 6 hr' },
  { value: '2', text: 'Injury — < 0.5 mL/kg/hr × 12 hr' },
  { value: '3', text: 'Failure — < 0.3 × 24 hr or anuria × 12 hr' },
];

export const renderers = {
  // ----- 2.1 kfre -------------------------------------------------------
  kfre(root) {
    note(root, 'Kidney Failure Risk Equation (Tangri 2011): the 2- and 5-year probability of treated kidney failure in CKD G3-G5. Enter age, sex, eGFR, and urine ACR (mg/g, converted internally to mg/mmol). The 8-variable mode adds calcium, phosphate, bicarbonate, and albumin. North American baseline survivals.');
    root.appendChild(selectField('Model', 'kf-mode', [
      { value: '4', text: '4-variable (age, sex, eGFR, ACR)' },
      { value: '8', text: '8-variable (+ Ca, PO4, HCO3, albumin)' },
    ]));
    root.appendChild(field('Age (years)', 'kf-age', { min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(checkField('Male', 'kf-male'));
    root.appendChild(field('eGFR (mL/min/1.73m²)', 'kf-egfr', { step: '0.1', min: 0, placeholder: 'e.g. 30' }));
    root.appendChild(field('Urine albumin-to-creatinine ratio (mg/g)', 'kf-acr', { step: '1', min: 0, placeholder: 'e.g. 300' }));
    root.appendChild(field('Serum calcium (mg/dL) — 8-var', 'kf-ca', { step: '0.1', min: 0, placeholder: 'e.g. 9.0' }));
    root.appendChild(field('Phosphate (mg/dL) — 8-var', 'kf-po4', { step: '0.1', min: 0, placeholder: 'e.g. 4.5' }));
    root.appendChild(field('Bicarbonate (mEq/L) — 8-var', 'kf-hco3', { step: '0.1', min: 0, placeholder: 'e.g. 22' }));
    root.appendChild(field('Serum albumin (g/dL) — 8-var', 'kf-alb', { step: '0.1', min: 0, placeholder: 'e.g. 3.5' }));
    const o = out(); root.appendChild(o);
    wire(['kf-mode', 'kf-age', 'kf-male', 'kf-egfr', 'kf-acr', 'kf-ca', 'kf-po4', 'kf-hco3', 'kf-alb'], () => safe(o, () => {
      const r = M.kfre({
        mode: selVal('kf-mode'), age: optNum('kf-age'), male: chk('kf-male'), egfr: optNum('kf-egfr'), acr: optNum('kf-acr'),
        calcium: optNum('kf-ca'), phosphate: optNum('kf-po4'), bicarbonate: optNum('kf-hco3'), albumin: optNum('kf-alb'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Model', value: `${r.mode}-variable` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 rifle-aki --------------------------------------------------
  'rifle-aki'(root) {
    note(root, 'RIFLE criteria for AKI (Bellomo 2004, ADQI): the class is the worst of the creatinine/GFR and urine-output criteria. Enter baseline and current creatinine (mg/dL) and select the urine-output category. Risk / Injury / Failure.');
    root.appendChild(field('Baseline creatinine (mg/dL)', 'ri-base', { step: '0.1', min: 0, placeholder: 'e.g. 1.0' }));
    root.appendChild(field('Current creatinine (mg/dL)', 'ri-curr', { step: '0.1', min: 0, placeholder: 'e.g. 2.2' }));
    root.appendChild(selectField('Urine output', 'ri-uo', UO_RIFLE));
    const o = out(); root.appendChild(o);
    wire(['ri-base', 'ri-curr', 'ri-uo'], () => safe(o, () => {
      const r = M.rifleAki({ baselineCr: optNum('ri-base'), currentCr: optNum('ri-curr'), uoClass: selVal('ri-uo') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'RIFLE', value: r.className }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 akin-aki ---------------------------------------------------
  'akin-aki'(root) {
    note(root, 'AKIN criteria for AKI (Mehta 2007): within a 48-hour window, the stage is the worse of the creatinine and urine-output criteria. Enter baseline and current creatinine, mark RRT, and select the urine-output category. RRT initiation forces stage 3.');
    root.appendChild(field('Baseline creatinine (mg/dL)', 'ak-base', { step: '0.1', min: 0, placeholder: 'e.g. 1.0' }));
    root.appendChild(field('Current creatinine (mg/dL)', 'ak-curr', { step: '0.1', min: 0, placeholder: 'e.g. 3.5' }));
    root.appendChild(checkField('Renal replacement therapy initiated', 'ak-rrt'));
    root.appendChild(selectField('Urine output', 'ak-uo', [
      { value: '0', text: 'Normal / not assessed' },
      { value: '1', text: 'Stage 1 — < 0.5 mL/kg/hr × > 6 hr' },
      { value: '2', text: 'Stage 2 — < 0.5 mL/kg/hr × > 12 hr' },
      { value: '3', text: 'Stage 3 — < 0.3 × 24 hr or anuria × 12 hr' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['ak-base', 'ak-curr', 'ak-rrt', 'ak-uo'], () => safe(o, () => {
      const r = M.akinAki({ baselineCr: optNum('ak-base'), currentCr: optNum('ak-curr'), rrt: chk('ak-rrt'), uoClass: selVal('ak-uo') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'AKIN', value: `Stage ${r.stage}` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 ufr-dialysis -----------------------------------------------
  'ufr-dialysis'(root) {
    note(root, 'Ultrafiltration rate (Flythe 2011): the fluid-removal rate during hemodialysis = volume / (post-dialysis weight × hours), in mL/kg/hr. A rate above 13 mL/kg/hr is associated with higher cardiovascular morbidity and mortality.');
    root.appendChild(field('Ultrafiltration volume (L)', 'uf-vol', { step: '0.1', min: 0, placeholder: 'e.g. 3.5' }));
    root.appendChild(field('Session duration (hours)', 'uf-hr', { step: '0.1', min: 0, placeholder: 'e.g. 3' }));
    root.appendChild(field('Post-dialysis (dry) weight (kg)', 'uf-wt', { step: '0.1', min: 0, placeholder: 'e.g. 70' }));
    const o = out(); root.appendChild(o);
    wire(['uf-vol', 'uf-hr', 'uf-wt'], () => safe(o, () => {
      const r = M.ufrDialysis({ volume: optNum('uf-vol'), hours: optNum('uf-hr'), weight: optNum('uf-wt') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'UF rate', value: `${r.ufr} mL/kg/hr` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
