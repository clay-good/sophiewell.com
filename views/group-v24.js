// spec-v98 §2: renderers for the four pediatric decision-rule / prognostic tiles
// (kawasaki-criteria, kocher-criteria, pim3, catch-head).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The pim3
// logistic renders its linear-predictor terms as a derivation; the criteria tiles
// name which features/factors fired. Each tile renders the spec-v50 §3 clinical
// posture note and frames its output as the cited rule's verdict/probability --
// none authors a treatment, imaging, or aspiration order in Sophie's voice
// (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/peds-v98.js';
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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) {
  const n = document.getElementById(id);
  return n && n.value !== '' ? Number(n.value) : null;
}
function selVal(id) { return document.getElementById(id).value; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The probability, score, and threshold are the cited rule’s, computed from the inputs you entered; they do not guarantee an outcome. The decision to image, aspirate, admit, or treat stays with the clinician and local protocol.' }));
}
function derivation(root, caption, terms) {
  root.appendChild(el('p', { class: 'muted', text: caption }));
  root.appendChild(el('ul', {}, terms.map((t) => {
    const v = typeof t.value === 'number' && Number.isFinite(t.value)
      ? (t.value >= 0 ? `+${t.value}` : String(t.value))
      : '--';
    return el('li', { class: 'muted', text: `${t.label}: ${v}` });
  })));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 kawasaki-criteria -------------------------------------------
  'kawasaki-criteria'(root) {
    root.appendChild(field('Fever duration (days)', 'kaw-fever', { min: 0, max: 60, placeholder: '5' }));
    root.appendChild(el('p', { class: 'muted', text: 'Principal clinical features present:' }));
    const pIds = [];
    for (const f of M.KAWASAKI_PRINCIPAL_FEATURES) {
      const id = `kaw-p-${f.key}`;
      root.appendChild(checkField(f.label, id));
      pIds.push({ id, key: f.key });
    }
    root.appendChild(el('p', { class: 'muted', text: 'For the incomplete-Kawasaki pathway (fever + 2-3 features):' }));
    root.appendChild(field('CRP (mg/dL)', 'kaw-crp', { min: 0, max: 99, step: '0.1', placeholder: '3.0' }));
    root.appendChild(field('ESR (mm/hr)', 'kaw-esr', { min: 0, max: 200, placeholder: '40' }));
    root.appendChild(el('p', { class: 'muted', text: 'Supplementary laboratory criteria:' }));
    const sIds = [];
    for (const s of M.KAWASAKI_SUPPLEMENTARY_CRITERIA) {
      const id = `kaw-s-${s.key}`;
      root.appendChild(checkField(s.label, id));
      sIds.push({ id, key: s.key });
    }
    root.appendChild(checkField('Echocardiogram positive for coronary involvement', 'kaw-echo'));
    const o = out(); root.appendChild(o);
    const ids = ['kaw-fever', ...pIds.map((p) => p.id), 'kaw-crp', 'kaw-esr', ...sIds.map((s) => s.id), 'kaw-echo'];
    wire(ids, () => safe(o, () => {
      const principal = pIds.filter((p) => chk(p.id)).map((p) => p.key);
      const supplementary = sIds.filter((s) => chk(s.id)).map((s) => s.key);
      const r = M.kawasakiCriteria({
        feverDays: optNum('kaw-fever'), principal,
        crp: optNum('kaw-crp'), esr: optNum('kaw-esr'),
        supplementary, echoPositive: chk('kaw-echo'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const warn = r.pathway === 'classic' || (r.pathway === 'incomplete' && r.supports);
      resultRow(o, [
        { text: r.band, cls: warn ? 'warn' : null },
        { label: 'Principal features', value: `${r.principalCount} of 5` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 kocher-criteria ---------------------------------------------
  'kocher-criteria'(root) {
    root.appendChild(checkField('Non-weight-bearing on affected side', 'koch-nwb'));
    root.appendChild(checkField('Oral temperature > 38.5 C', 'koch-fever'));
    root.appendChild(checkField('ESR > 40 mm/hr', 'koch-esr'));
    root.appendChild(checkField('Serum WBC > 12,000 cells/uL', 'koch-wbc'));
    const o = out(); root.appendChild(o);
    wire(['koch-nwb', 'koch-fever', 'koch-esr', 'koch-wbc'], () => safe(o, () => {
      const r = M.kocherCriteria({
        nonWeightBearing: chk('koch-nwb'), fever: chk('koch-fever'),
        esr: chk('koch-esr'), wbc: chk('koch-wbc'),
      });
      resultRow(o, [
        { text: r.band, cls: r.count >= 2 ? 'warn' : null },
        { label: 'Predictors present', value: `${r.count} of 4` },
        { label: 'Predicted septic arthritis', value: r.probability },
      ]);
      derivation(o, 'Predictors:', r.predictors.map((p) => ({ label: p.label, value: p.present ? 1 : 0 })));
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 pim3 --------------------------------------------------------
  'pim3'(root) {
    root.appendChild(field('Systolic blood pressure (mmHg)', 'pim-sbp', { min: 0, max: 300, placeholder: '90' }));
    root.appendChild(checkField('Both pupils > 3 mm and fixed to light', 'pim-pupils'));
    root.appendChild(field('FiO2 (fraction, e.g. 0.5) -- if ventilated', 'pim-fio2', { min: 0, max: 1, step: '0.01', placeholder: '0.5' }));
    root.appendChild(field('PaO2 (mmHg) -- if ventilated', 'pim-pao2', { min: 0, max: 800, placeholder: '80' }));
    root.appendChild(field('Base excess (mmol/L)', 'pim-be', { min: -50, max: 50, step: '0.1', placeholder: '-5' }));
    root.appendChild(checkField('Mechanical ventilation in first hour', 'pim-vent'));
    root.appendChild(checkField('Elective admission', 'pim-elective'));
    root.appendChild(selectField('Recovery from procedure', 'pim-recovery', [
      { value: 'none', text: 'Not a recovery admission' },
      { value: 'bypass-cardiac', text: 'Cardiac procedure with bypass' },
      { value: 'nonbypass-cardiac', text: 'Cardiac procedure without bypass' },
      { value: 'noncardiac', text: 'Non-cardiac procedure' },
    ]));
    root.appendChild(selectField('Diagnosis risk category', 'pim-risk', [
      { value: 'none', text: 'None of the listed diagnoses' },
      { value: 'low', text: 'Low-risk diagnosis (asthma, bronchiolitis, croup, OSA, DKA, seizure)' },
      { value: 'high', text: 'High-risk diagnosis (cerebral hemorrhage, cardiomyopathy, HLHS, neurodegenerative, NEC)' },
      { value: 'very-high', text: 'Very-high-risk (cardiac arrest pre-ICU, SCID, leukemia/lymphoma post-induction, BMT, liver failure)' },
    ]));
    const o = out(); root.appendChild(o);
    const ids = ['pim-sbp', 'pim-pupils', 'pim-fio2', 'pim-pao2', 'pim-be', 'pim-vent', 'pim-elective', 'pim-recovery', 'pim-risk'];
    wire(ids, () => safe(o, () => {
      const r = M.pim3({
        sbp: optNum('pim-sbp'), pupilsFixed: chk('pim-pupils'),
        fio2: optNum('pim-fio2'), paO2: optNum('pim-pao2'), baseExcess: optNum('pim-be'),
        mechVent: chk('pim-vent'), elective: chk('pim-elective'),
        recovery: selVal('pim-recovery'), riskCategory: selVal('pim-risk'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.risk >= 5 ? 'warn' : null },
        { label: 'Predicted mortality', value: `${r.risk}%` },
        { label: 'Logit', value: String(r.x) },
      ]);
      derivation(o, 'logit = sum of:', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 catch-head --------------------------------------------------
  'catch-head'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'High-risk factors (predict need for neurosurgical intervention):' }));
    const hIds = [];
    for (const f of M.CATCH_HIGH_RISK) {
      const id = `catch-h-${f.key}`;
      root.appendChild(checkField(f.label, id));
      hIds.push({ id, key: f.key });
    }
    root.appendChild(el('p', { class: 'muted', text: 'Medium-risk factors (predict brain injury on CT):' }));
    const mIds = [];
    for (const f of M.CATCH_MEDIUM_RISK) {
      const id = `catch-m-${f.key}`;
      root.appendChild(checkField(f.label, id));
      mIds.push({ id, key: f.key });
    }
    const o = out(); root.appendChild(o);
    const ids = [...hIds.map((h) => h.id), ...mIds.map((m) => m.id)];
    wire(ids, () => safe(o, () => {
      const high = hIds.filter((h) => chk(h.id)).map((h) => h.key);
      const medium = mIds.filter((m) => chk(m.id)).map((m) => m.key);
      const r = M.catchHead({ high, medium });
      resultRow(o, [
        { text: r.band, cls: r.indicated ? 'warn' : null },
        { label: 'High-risk factors', value: String(r.highCount) },
        { label: 'Medium-risk factors', value: String(r.mediumCount) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
