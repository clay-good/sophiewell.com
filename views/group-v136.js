// spec-v136 §2: renderers for the five endocrine / metabolic index tiles --
// homa-ir, quicki, tyg-index (Clinical Math & Conversions, Group E), and
// metabolic-syndrome, osteoporosis-prescreen (Clinical Scoring & Risk, Group G)
// -- beside eag-a1c.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames an index /
// verdict, not management (spec-v11 §5.3). Each compute surfaces a complete-the-
// fields fallback rather than a bad value; the insulin-resistance indices guard
// glucose/insulin/TG > 0 so a zero/blank never yields log(0) or a divide-by-zero
// (lib/endo-v136.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/endo-v136.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The index or verdict is the cited instrument’s, computed from the values you entered. The diagnosis and the management decision — diagnose insulin resistance or metabolic syndrome, order densitometry, start therapy — stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

const BLANK = { value: '', text: 'Select…' };
const YN = [BLANK, { value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
const OPT_YN = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

export const renderers = {
  // ----- 2.1 homa-ir ----------------------------------------------------
  'homa-ir'(root) {
    note(root, 'HOMA-IR (Matthews 1985): insulin-resistance surrogate = (fasting insulin µU/mL × fasting glucose) ÷ 405 (mg/dL) or ÷ 22.5 (mmol/L). Higher = greater insulin resistance; no universal diagnostic cut-point. Also reports the linear HOMA-%B β-cell estimate when glucose > 3.5 mmol/L. Cross-links QUICKI, the TyG index and eAG/A1c.');
    root.appendChild(field('Fasting insulin (µU/mL)', 'hir-insulin', { step: '0.1', min: 0, placeholder: 'e.g. 12' }));
    root.appendChild(field('Fasting glucose', 'hir-glucose', { step: '0.1', min: 0, placeholder: 'e.g. 100' }));
    root.appendChild(selectField('Glucose unit', 'hir-unit', [{ value: 'mgdl', text: 'mg/dL' }, { value: 'mmol', text: 'mmol/L' }]));
    const o = out(); root.appendChild(o);
    wire(['hir-insulin', 'hir-glucose', 'hir-unit'], () => safe(o, () => {
      const r = M.homaIr({ insulin: optNum('hir-insulin'), glucose: optNum('hir-glucose'), unit: selVal('hir-unit') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'HOMA-IR', value: String(r.value) }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 quicki -----------------------------------------------------
  'quicki'(root) {
    note(root, 'QUICKI (Katz 2000): insulin-sensitivity index = 1 ÷ [log₁₀(fasting insulin µU/mL) + log₁₀(fasting glucose mg/dL)]. Lower = lower insulin sensitivity; reference ~0.45 (healthy) to ~0.30–0.35 (type 2 diabetes), no universal cut-point. Cross-links HOMA-IR.');
    root.appendChild(field('Fasting insulin (µU/mL)', 'qui-insulin', { step: '0.1', min: 0, placeholder: 'e.g. 12' }));
    root.appendChild(field('Fasting glucose (mg/dL)', 'qui-glucose', { step: '0.1', min: 0, placeholder: 'e.g. 100' }));
    const o = out(); root.appendChild(o);
    wire(['qui-insulin', 'qui-glucose'], () => safe(o, () => {
      const r = M.quicki({ insulin: optNum('qui-insulin'), glucose: optNum('qui-glucose') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'QUICKI', value: String(r.value) }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 tyg-index --------------------------------------------------
  'tyg-index'(root) {
    note(root, 'TyG index (Simental-Mendía 2008): fasting-insulin-free insulin-resistance surrogate = ln[(fasting triglycerides × fasting glucose) ÷ 2], both mg/dL. Higher = greater insulin resistance; no universal cut-point. Cross-links HOMA-IR.');
    root.appendChild(field('Fasting triglycerides (mg/dL)', 'tyg-tg', { step: '1', min: 0, placeholder: 'e.g. 150' }));
    root.appendChild(field('Fasting glucose (mg/dL)', 'tyg-glucose', { step: '1', min: 0, placeholder: 'e.g. 100' }));
    const o = out(); root.appendChild(o);
    wire(['tyg-tg', 'tyg-glucose'], () => safe(o, () => {
      const r = M.tygIndex({ tg: optNum('tyg-tg'), glucose: optNum('tyg-glucose') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'TyG', value: String(r.value) }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 metabolic-syndrome -----------------------------------------
  'metabolic-syndrome'(root) {
    note(root, 'Metabolic syndrome (Harmonized 2009 / IDF 2006): five criteria — elevated waist (sex/population cut-point), triglycerides ≥150 mg/dL (or treated), HDL <40 (men) / <50 (women) mg/dL (or treated), BP ≥130/85 (or treated), fasting glucose ≥100 mg/dL (or treated). Harmonized = any 3 of 5; IDF = central obesity required + any 2 others. Cross-links HOMA-IR. Treatment toggles default to “No.”');
    root.appendChild(selectField('Definition', 'ms-def', [BLANK, { value: 'harmonized', text: 'Harmonized (any 3 of 5)' }, { value: 'idf', text: 'IDF (central obesity + 2)' }]));
    root.appendChild(selectField('Sex', 'ms-sex', [BLANK, { value: 'male', text: 'Male' }, { value: 'female', text: 'Female' }]));
    root.appendChild(selectField('Waist cut-point standard', 'ms-wstd', [BLANK, { value: 'us', text: 'US / ATP III (M ≥102, F ≥88 cm)' }, { value: 'europid', text: 'IDF Europid (M ≥94, F ≥80 cm)' }, { value: 'asian', text: 'Asian (M ≥90, F ≥80 cm)' }]));
    root.appendChild(field('Waist circumference (cm)', 'ms-waist', { step: '0.1', min: 0, placeholder: 'e.g. 104' }));
    root.appendChild(field('Triglycerides (mg/dL)', 'ms-tg', { step: '1', min: 0, placeholder: 'e.g. 160' }));
    root.appendChild(selectField('On treatment for high triglycerides?', 'ms-tgtx', OPT_YN));
    root.appendChild(field('HDL cholesterol (mg/dL)', 'ms-hdl', { step: '1', min: 0, placeholder: 'e.g. 45' }));
    root.appendChild(selectField('On treatment for low HDL?', 'ms-hdltx', OPT_YN));
    root.appendChild(field('Systolic BP (mmHg)', 'ms-sbp', { step: '1', min: 0, placeholder: 'e.g. 128' }));
    root.appendChild(field('Diastolic BP (mmHg)', 'ms-dbp', { step: '1', min: 0, placeholder: 'e.g. 82' }));
    root.appendChild(selectField('On antihypertensive treatment?', 'ms-bptx', OPT_YN));
    root.appendChild(field('Fasting glucose (mg/dL)', 'ms-glu', { step: '1', min: 0, placeholder: 'e.g. 105' }));
    root.appendChild(selectField('On treatment for elevated glucose?', 'ms-glutx', OPT_YN));
    const o = out(); root.appendChild(o);
    wire(['ms-def', 'ms-sex', 'ms-wstd', 'ms-waist', 'ms-tg', 'ms-tgtx', 'ms-hdl', 'ms-hdltx', 'ms-sbp', 'ms-dbp', 'ms-bptx', 'ms-glu', 'ms-glutx'], () => safe(o, () => {
      const r = M.metabolicSyndrome({
        definition: selVal('ms-def'), sex: selVal('ms-sex'), waistStandard: selVal('ms-wstd'),
        waist: optNum('ms-waist'), tg: optNum('ms-tg'), tgTreated: selVal('ms-tgtx'),
        hdl: optNum('ms-hdl'), hdlTreated: selVal('ms-hdltx'), sbp: optNum('ms-sbp'),
        dbp: optNum('ms-dbp'), bpTreated: selVal('ms-bptx'), glucose: optNum('ms-glu'), glucoseTreated: selVal('ms-glutx'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Metabolic syndrome', value: r.present ? 'Present' : 'Not met' }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 osteoporosis-prescreen -------------------------------------
  'osteoporosis-prescreen'(root) {
    note(root, 'OST / ORAI DXA pre-screen (Koh 2001 OST/OSTA; Cadarette 2000 ORAI): two free indices that flag postmenopausal women who warrant bone densitometry. OST index = (weight kg − age yr) × 0.2, truncated toward zero; index < 2 flags increased risk (Caucasian cutoff). ORAI sums age/weight/estrogen bands; score ≥ 9 selects for DXA. The licensed FRAX is excluded; this is the free substitute.');
    root.appendChild(field('Age (years)', 'ost-age', { step: '1', min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(field('Weight (kg)', 'ost-weight', { step: '0.1', min: 0, placeholder: 'e.g. 72' }));
    root.appendChild(selectField('Currently using estrogen?', 'ost-estrogen', YN));
    const o = out(); root.appendChild(o);
    wire(['ost-age', 'ost-weight', 'ost-estrogen'], () => safe(o, () => {
      const r = M.osteoporosisPrescreen({ age: optNum('ost-age'), weight: optNum('ost-weight'), estrogen: selVal('ost-estrogen') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'OST / ORAI', value: `OST ${r.ost} / ORAI ${r.orai}` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
