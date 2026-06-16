// spec-v88 §2: renderers for the three endocrine/oncology tiles
// (dka-hhs, calvert-carboplatin, tls-cairo-bishop).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Nullable numeric outputs route through fmt() so a guarded null never reaches
// the DOM as NaN/undefined (spec-v53 §3.2). Each tile renders the spec-v50 §3
// clinical posture note and quotes the cited source's own classification /
// grade - none authors a management order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import * as M from '../lib/metabolic-onc-v88.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || 'any');
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
function optNum(id) {
  const v = document.getElementById(id).value;
  return v === '' ? null : Number(v);
}
function selVal(id) { return document.getElementById(id).value; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not an order. The thresholds and grades are the cited source’s; the diagnosis and the management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}
// "met" / "not met" / "—" (unknown) tag for a criterion-grid row.
function metTag(b) { return b === true ? 'met' : (b === false ? 'not met' : '—'); }

export const renderers = {
  // ----- 2.1 dka-hhs ------------------------------------------------------
  'dka-hhs'(root) {
    root.appendChild(field('Plasma glucose (mg/dL)', 'dk-glu', { placeholder: 'e.g. 520' }));
    root.appendChild(field('Arterial or venous pH', 'dk-ph', { placeholder: 'e.g. 6.95' }));
    root.appendChild(field('Serum bicarbonate (mEq/L)', 'dk-hco3', { placeholder: 'e.g. 6' }));
    root.appendChild(field('Beta-hydroxybutyrate (mmol/L, for ketosis)', 'dk-bohb', { placeholder: 'e.g. 6' }));
    root.appendChild(selectField('Mental status', 'dk-mental', [
      { value: 'alert', text: 'Alert' },
      { value: 'drowsy', text: 'Drowsy' },
      { value: 'stupor', text: 'Stupor / coma' },
    ]));
    root.appendChild(field('Sodium (mEq/L, for osmolality + anion gap)', 'dk-na', { placeholder: 'e.g. 130' }));
    root.appendChild(field('Chloride (mEq/L, for anion gap)', 'dk-cl', { placeholder: 'e.g. 95' }));
    const o = out(); root.appendChild(o);
    wire(['dk-glu', 'dk-ph', 'dk-hco3', 'dk-bohb', 'dk-mental', 'dk-na', 'dk-cl'], () => safe(o, () => {
      const r = M.dkaHhs({
        glucose: optNum('dk-glu'), ph: optNum('dk-ph'), bicarbonate: optNum('dk-hco3'),
        betaHydroxybutyrate: optNum('dk-bohb'), mental: selVal('dk-mental'),
        sodium: optNum('dk-na'), chloride: optNum('dk-cl'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const c = r.criteria;
      resultRow(o, [
        { text: r.band, cls: r.classification !== 'none' ? 'warn' : null },
        { label: 'Anion gap', value: fmt(r.anionGap, { fallback: '(enter Na + Cl)' }), units: 'mEq/L' },
        { label: 'Effective serum osmolality', value: fmt(r.effOsm, { fallback: '(enter Na)' }), units: 'mOsm/kg' },
        { label: 'Hyperglycemia (glucose ≥ 250)', value: metTag(c.hyperglycemia) },
        { label: 'Acidosis (pH < 7.30 and HCO3 < 18)', value: metTag(c.acidosis) },
        { label: 'Ketosis (β-OHB ≥ 3.0)', value: metTag(c.ketosis) },
        { label: 'Hyperosmolar (glucose > 600, eff. osm > 320)', value: metTag(c.hyperosmolar) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 calvert-carboplatin -----------------------------------------
  'calvert-carboplatin'(root) {
    root.appendChild(field('Target AUC (mg/mL·min, typically 4–6)', 'cv-auc', { placeholder: 'e.g. 5' }));
    root.appendChild(field('GFR (mL/min)', 'cv-gfr', { placeholder: 'e.g. 140' }));
    root.appendChild(selectField('GFR cap (FDA)', 'cv-cap', [
      { value: 'on', text: 'Cap estimated GFR at 125 mL/min (FDA, recommended)' },
      { value: 'off', text: 'Do not cap (measured GFR)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['cv-auc', 'cv-gfr', 'cv-cap'], () => safe(o, () => {
      const r = M.calvertCarboplatin({
        targetAuc: optNum('cv-auc'), gfr: optNum('cv-gfr'), capGfr: selVal('cv-cap'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { label: 'Carboplatin dose', value: fmt(r.dose, { fallback: '--' }), units: 'mg' },
        { label: 'Derivation', value: `AUC ${r.auc} × (GFR ${r.gfrUsed} + 25)` },
        { text: r.band, cls: r.wasCapped ? 'warn' : null },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 tls-cairo-bishop --------------------------------------------
  'tls-cairo-bishop'(root) {
    root.appendChild(selectField('Patient', 'tl-age', [
      { value: 'adult', text: 'Adult (phosphate threshold 4.5 mg/dL)' },
      { value: 'pediatric', text: 'Pediatric (phosphate threshold 6.5 mg/dL)' },
    ]));
    root.appendChild(field('Uric acid (mg/dL)', 'tl-ua', { placeholder: 'e.g. 9' }));
    root.appendChild(field('Uric acid baseline (mg/dL, optional)', 'tl-uab', { placeholder: 'for 25% change' }));
    root.appendChild(field('Potassium (mEq/L)', 'tl-k', { placeholder: 'e.g. 6.5' }));
    root.appendChild(field('Potassium baseline (mEq/L, optional)', 'tl-kb', { placeholder: 'for 25% change' }));
    root.appendChild(field('Phosphate (mg/dL)', 'tl-phos', { placeholder: 'e.g. 5' }));
    root.appendChild(field('Phosphate baseline (mg/dL, optional)', 'tl-phosb', { placeholder: 'for 25% change' }));
    root.appendChild(field('Calcium (mg/dL)', 'tl-ca', { placeholder: 'e.g. 6' }));
    root.appendChild(field('Calcium baseline (mg/dL, optional)', 'tl-cab', { placeholder: 'for 25% change' }));
    root.appendChild(field('Albumin (g/dL, optional — corrects calcium)', 'tl-alb', { placeholder: 'e.g. 4' }));
    root.appendChild(field('Creatinine (mg/dL, for clinical TLS)', 'tl-cr', { placeholder: 'e.g. 2.4' }));
    root.appendChild(field('Creatinine ULN for age/sex (mg/dL)', 'tl-uln', { placeholder: 'e.g. 1.2' }));
    root.appendChild(selectField('Cardiac arrhythmia / sudden death', 'tl-arr', [
      { value: 'none', text: 'None' },
      { value: 'present', text: 'Symptomatic arrhythmia' },
      { value: 'life-threatening', text: 'Life-threatening arrhythmia' },
      { value: 'sudden-death', text: 'Sudden death' },
    ]));
    root.appendChild(selectField('Seizure', 'tl-sz', [
      { value: 'none', text: 'None' },
      { value: 'single', text: 'Single brief generalized seizure' },
      { value: 'poorly-controlled', text: 'Seizure with altered consciousness / poorly controlled' },
      { value: 'prolonged', text: 'Prolonged or repetitive seizures' },
    ]));
    const o = out(); root.appendChild(o);
    const ids = ['tl-age', 'tl-ua', 'tl-uab', 'tl-k', 'tl-kb', 'tl-phos', 'tl-phosb', 'tl-ca', 'tl-cab', 'tl-alb', 'tl-cr', 'tl-uln', 'tl-arr', 'tl-sz'];
    wire(ids, () => safe(o, () => {
      const r = M.tlsCairoBishop({
        pediatric: selVal('tl-age') === 'pediatric',
        uricAcid: optNum('tl-ua'), uricBaseline: optNum('tl-uab'),
        potassium: optNum('tl-k'), potassiumBaseline: optNum('tl-kb'),
        phosphate: optNum('tl-phos'), phosphateBaseline: optNum('tl-phosb'),
        calcium: optNum('tl-ca'), calciumBaseline: optNum('tl-cab'), albumin: optNum('tl-alb'),
        creatinine: optNum('tl-cr'), creatinineUln: optNum('tl-uln'),
        arrhythmia: selVal('tl-arr'), seizure: selVal('tl-sz'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const c = r.criteria;
      resultRow(o, [
        { text: r.band, cls: (r.labTls || r.clinicalTls) ? 'warn' : null },
        { label: 'Metabolic criteria met', value: `${r.metCount} of 4` },
        { label: 'Cairo-Bishop grade', value: r.gradeRoman },
        { label: 'Creatinine ratio', value: fmt(r.crRatio, { fallback: '(enter creatinine + ULN)' }), units: '× ULN' },
        { label: 'Corrected calcium', value: fmt(r.correctedCa, { fallback: '(enter calcium)' }), units: 'mg/dL' },
        { label: 'Uric acid ≥ 8 (or +25%)', value: metTag(c.uaMet) },
        { label: 'Potassium ≥ 6 (or +25%)', value: metTag(c.kMet) },
        { label: 'Phosphate ≥ threshold (or +25%)', value: metTag(c.phosMet) },
        { label: 'Corrected calcium ≤ 7 (or −25%)', value: metTag(c.caMet) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
