// spec-v129 §2: renderers for the six acid-base tiles (stewart-sid-sig,
// base-excess, resp-acidosis-compensation, resp-alkalosis-compensation,
// met-alkalosis-compensation, urine-osmolal-gap). All home in Clinical Math &
// Conversions (Group E). v129 continues Wave 5 of the spec-v100 program,
// completing the compensation set `winters` opened and adding the
// physicochemical (Stewart) and urine-gap views beside `anion-gap-dd`.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames an
// acid-base quantity or an expected-vs-measured comparison, not management
// (spec-v11 §5.3). Each compute surfaces a complete-the-fields fallback rather
// than a bad number; every denominator is guarded in lib/acidbase-v129.js.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/acidbase-v129.js';
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
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The acid-base quantity or the expected-versus-measured comparison is the cited instrument’s, computed from the gas and electrolyte values you entered. The diagnosis and the management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

const ACUTE_CHRONIC_OPTS = [
  { value: 'acute', text: 'Acute' },
  { value: 'chronic', text: 'Chronic' },
];

export const renderers = {
  // ----- 2.1 stewart-sid-sig --------------------------------------------
  'stewart-sid-sig'(root) {
    note(root, 'Stewart strong ion difference / strong ion gap (Stewart 1983; Figge 1992). Apparent SID = (Na + K + Ca + Mg) − (Cl + lactate); effective SID = HCO3 + albumin charge + phosphate charge (Figge weak-acid charges evaluated at pH 7.4). SIG = apparent − effective; above ~2 mEq/L suggests unmeasured strong anions. Enter ionized Ca and Mg in mEq/L.');
    root.appendChild(field('Sodium (mEq/L)', 'ss-na', { step: '1', placeholder: 'e.g. 140' }));
    root.appendChild(field('Potassium (mEq/L)', 'ss-k', { step: '0.1', placeholder: 'e.g. 4.0' }));
    root.appendChild(field('Ionized calcium (mEq/L)', 'ss-ca', { step: '0.1', min: 0, placeholder: 'e.g. 2.4' }));
    root.appendChild(field('Ionized magnesium (mEq/L)', 'ss-mg', { step: '0.1', min: 0, placeholder: 'e.g. 1.0' }));
    root.appendChild(field('Chloride (mEq/L)', 'ss-cl', { step: '1', placeholder: 'e.g. 105' }));
    root.appendChild(field('Lactate (mEq/L)', 'ss-lac', { step: '0.1', min: 0, placeholder: 'e.g. 1.0' }));
    root.appendChild(field('Bicarbonate (mEq/L)', 'ss-hco3', { step: '0.1', min: 0, placeholder: 'e.g. 24' }));
    root.appendChild(field('Albumin (g/dL)', 'ss-alb', { step: '0.1', min: 0, placeholder: 'e.g. 4.0' }));
    root.appendChild(field('Phosphate (mg/dL)', 'ss-phos', { step: '0.1', min: 0, placeholder: 'e.g. 3.5' }));
    const o = out(); root.appendChild(o);
    wire(['ss-na', 'ss-k', 'ss-ca', 'ss-mg', 'ss-cl', 'ss-lac', 'ss-hco3', 'ss-alb', 'ss-phos'], () => safe(o, () => {
      const r = M.stewartSidSig({ sodium: optNum('ss-na'), potassium: optNum('ss-k'), calcium: optNum('ss-ca'), magnesium: optNum('ss-mg'), chloride: optNum('ss-cl'), lactate: optNum('ss-lac'), bicarbonate: optNum('ss-hco3'), albumin: optNum('ss-alb'), phosphate: optNum('ss-phos') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'SIG', value: `${r.sig} mEq/L` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 base-excess ------------------------------------------------
  'base-excess'(root) {
    note(root, 'Standard base excess (Siggaard-Andersen Van Slyke equation, NCCLS constants): BE = (1 − 0.0143 × Hb) × (HCO3 − 24.8 + (9.5 + 1.63 × Hb) × (pH − 7.4)). Negative = base deficit (metabolic acidosis); positive = base excess (metabolic alkalosis). The sign flips at zero.');
    root.appendChild(field('Arterial pH', 'be-ph', { step: '0.01', min: 0, placeholder: 'e.g. 7.40' }));
    root.appendChild(field('Bicarbonate (mEq/L)', 'be-hco3', { step: '0.1', min: 0, placeholder: 'e.g. 24.8' }));
    root.appendChild(field('Hemoglobin (g/dL)', 'be-hb', { step: '0.1', min: 0, placeholder: 'e.g. 15' }));
    const o = out(); root.appendChild(o);
    wire(['be-ph', 'be-hco3', 'be-hb'], () => safe(o, () => {
      const r = M.baseExcess({ ph: optNum('be-ph'), bicarbonate: optNum('be-hco3'), hemoglobin: optNum('be-hb') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Base excess', value: `${r.be > 0 ? '+' : ''}${r.be} mEq/L` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 resp-acidosis-compensation ---------------------------------
  'resp-acidosis-compensation'(root) {
    note(root, 'Expected HCO3 in respiratory acidosis (Brackett 1965 acute; Schwartz 1965 chronic): HCO3 rises ~1 mEq/L per 10 mmHg PaCO2 above 40 acutely, ~4 mEq/L per 10 chronically. A measured HCO3 outside the expected band flags an added metabolic disorder. Choose acute or chronic.');
    root.appendChild(field('Measured PaCO2 (mmHg)', 'ra-paco2', { step: '1', min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(field('Measured HCO3 (mEq/L)', 'ra-hco3', { step: '0.1', min: 0, placeholder: 'e.g. 26' }));
    root.appendChild(selectField('Acute or chronic', 'ra-ch', ACUTE_CHRONIC_OPTS));
    const o = out(); root.appendChild(o);
    wire(['ra-paco2', 'ra-hco3', 'ra-ch'], () => safe(o, () => {
      const r = M.respAcidosisCompensation({ paco2: optNum('ra-paco2'), bicarbonate: optNum('ra-hco3'), chronic: selVal('ra-ch') === 'chronic' });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Expected HCO3', value: `${r.expected} mEq/L` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 resp-alkalosis-compensation --------------------------------
  'resp-alkalosis-compensation'(root) {
    note(root, 'Expected HCO3 in respiratory alkalosis (Gennari 1972): HCO3 falls ~2 mEq/L per 10 mmHg PaCO2 below 40 acutely, ~4 mEq/L per 10 chronically (not below a physiologic floor). A measured HCO3 outside the expected band flags an added metabolic disorder. Choose acute or chronic.');
    root.appendChild(field('Measured PaCO2 (mmHg)', 'rl-paco2', { step: '1', min: 0, placeholder: 'e.g. 25' }));
    root.appendChild(field('Measured HCO3 (mEq/L)', 'rl-hco3', { step: '0.1', min: 0, placeholder: 'e.g. 21' }));
    root.appendChild(selectField('Acute or chronic', 'rl-ch', ACUTE_CHRONIC_OPTS));
    const o = out(); root.appendChild(o);
    wire(['rl-paco2', 'rl-hco3', 'rl-ch'], () => safe(o, () => {
      const r = M.respAlkalosisCompensation({ paco2: optNum('rl-paco2'), bicarbonate: optNum('rl-hco3'), chronic: selVal('rl-ch') === 'chronic' });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Expected HCO3', value: `${r.expected} mEq/L` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 met-alkalosis-compensation ---------------------------------
  'met-alkalosis-compensation'(root) {
    note(root, 'Expected PaCO2 in metabolic alkalosis (Narins-Emmett 1980): expected PaCO2 = 0.7 × (HCO3 − 24) + 40 (± 5). A measured PaCO2 outside the band flags an added respiratory disorder. The metabolic-alkalosis complement of Winter’s formula.');
    root.appendChild(field('Measured HCO3 (mEq/L)', 'ma-hco3', { step: '0.1', min: 0, placeholder: 'e.g. 40' }));
    root.appendChild(field('Measured PaCO2 (mmHg)', 'ma-paco2', { step: '1', min: 0, placeholder: 'e.g. 51' }));
    const o = out(); root.appendChild(o);
    wire(['ma-hco3', 'ma-paco2'], () => safe(o, () => {
      const r = M.metAlkalosisCompensation({ bicarbonate: optNum('ma-hco3'), paco2: optNum('ma-paco2') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Expected PaCO2', value: `${r.expected} mmHg` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 urine-osmolal-gap ------------------------------------------
  'urine-osmolal-gap'(root) {
    note(root, 'Urine osmolal gap (Halperin 1988): calculated osm = 2 × (Na + K) + urea nitrogen/2.8 + glucose/18; gap = measured − calculated, and half the gap ≈ urinary NH4+. In a non-anion-gap acidosis, a wide gap points to an extrarenal cause (e.g. diarrhea); a narrow gap points to renal tubular acidosis. Enter urea and glucose in mg/dL.');
    root.appendChild(field('Measured urine osmolality (mOsm/kg)', 'uo-meas', { step: '1', min: 0, placeholder: 'e.g. 600' }));
    root.appendChild(field('Urine sodium (mEq/L)', 'uo-na', { step: '1', min: 0, placeholder: 'e.g. 40' }));
    root.appendChild(field('Urine potassium (mEq/L)', 'uo-k', { step: '1', min: 0, placeholder: 'e.g. 20' }));
    root.appendChild(field('Urine urea nitrogen (mg/dL)', 'uo-urea', { step: '1', min: 0, placeholder: 'e.g. 280' }));
    root.appendChild(field('Urine glucose (mg/dL)', 'uo-glu', { step: '1', min: 0, placeholder: 'e.g. 0' }));
    const o = out(); root.appendChild(o);
    wire(['uo-meas', 'uo-na', 'uo-k', 'uo-urea', 'uo-glu'], () => safe(o, () => {
      const r = M.urineOsmolalGap({ measuredOsm: optNum('uo-meas'), urineNa: optNum('uo-na'), urineK: optNum('uo-k'), urineUrea: optNum('uo-urea'), urineGlucose: optNum('uo-glu') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Osmolal gap', value: `${r.gap} mOsm/kg` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
