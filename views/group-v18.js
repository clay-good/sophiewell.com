// spec-v92 §2: renderers for the five nephrology tiles (ckd-staging, uacr-upcr,
// ktv-urr, mehran-cin, ckd-epi-cystatin).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Nullable numeric outputs route through fmt() so a guarded null never reaches
// the DOM as NaN/undefined (spec-v53 §3.2). Each tile renders the spec-v50 §3
// clinical posture note and quotes the cited source's own cell / band / target /
// estimate - none authors a management order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nephro-v92.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || 'any');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  if (opts.inputmode) inp.setAttribute('inputmode', opts.inputmode);
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not an order. The KDIGO cell, ratio, adequacy target, contrast-risk band, and eGFR estimate are the cited source’s; the diagnosis and management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

const YESNO = [
  { value: 'no', text: 'No' },
  { value: 'yes', text: 'Yes' },
];

export const renderers = {
  // ----- 2.1 ckd-staging -------------------------------------------------
  'ckd-staging'(root) {
    root.appendChild(field('eGFR (mL/min/1.73m²)', 'cs-egfr', { placeholder: 'e.g. 38', inputmode: 'decimal' }));
    root.appendChild(field('UACR (mg/g) — urine albumin-to-creatinine ratio', 'cs-uacr', { placeholder: 'e.g. 340', inputmode: 'decimal' }));
    root.appendChild(selectField('Albuminuria category — use only if no UACR above', 'cs-acat', [
      { value: '', text: '— derive from the UACR above —' },
      { value: 'A1', text: 'A1 (< 30 mg/g)' },
      { value: 'A2', text: 'A2 (30–300 mg/g)' },
      { value: 'A3', text: 'A3 (> 300 mg/g)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['cs-egfr', 'cs-uacr', 'cs-acat'], () => safe(o, () => {
      const cat = selVal('cs-acat');
      const r = M.ckdStaging({
        egfr: optNum('cs-egfr'), uacr: optNum('cs-uacr'),
        aCategory: cat === '' ? undefined : cat,
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: (r.riskKey === 'vhigh' || r.riskKey === 'high') ? 'warn' : null },
        { label: 'GFR category', value: r.gLabel },
        { label: 'Albuminuria category', value: r.aLabel },
        { label: 'KDIGO risk cell', value: `${r.gStage}/${r.aStage} — ${r.risk}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 uacr-upcr ---------------------------------------------------
  'uacr-upcr'(root) {
    root.appendChild(field('Urine albumin — for the UACR + A-stage', 'uu-alb', { placeholder: 'e.g. 30', inputmode: 'decimal' }));
    root.appendChild(selectField('Urine albumin unit', 'uu-unit', [
      { value: 'mg/dL', text: 'mg/dL' },
      { value: 'mg/L', text: 'mg/L' },
    ]));
    root.appendChild(field('Urine protein (mg/dL) — optional, for the UPCR', 'uu-prot', { placeholder: 'optional', inputmode: 'decimal' }));
    root.appendChild(field('Urine creatinine (mg/dL) — must be > 0', 'uu-cr', { placeholder: 'e.g. 100', inputmode: 'decimal' }));
    const o = out(); root.appendChild(o);
    wire(['uu-alb', 'uu-unit', 'uu-prot', 'uu-cr'], () => safe(o, () => {
      const r = M.uacrUpcr({
        albumin: optNum('uu-alb'), albuminUnit: selVal('uu-unit'),
        protein: optNum('uu-prot'), urineCr: optNum('uu-cr'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const rows = [{ text: r.band, cls: r.aStage === 'A3' ? 'warn' : null }];
      if (r.uacr != null) rows.push({ label: 'UACR', value: `${r.uacr} mg/g (${r.aStage})` });
      if (r.upcr != null) rows.push({ label: 'UPCR', value: `${r.upcr} mg/g` });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 ktv-urr -----------------------------------------------------
  'ktv-urr'(root) {
    root.appendChild(field('Pre-dialysis BUN (mg/dL) — must be > 0', 'kt-pre', { placeholder: 'e.g. 60', inputmode: 'decimal' }));
    root.appendChild(field('Post-dialysis BUN (mg/dL)', 'kt-post', { placeholder: 'e.g. 18', inputmode: 'decimal' }));
    root.appendChild(field('Ultrafiltration volume (L) — for Kt/V', 'kt-uf', { placeholder: 'e.g. 3', inputmode: 'decimal' }));
    root.appendChild(field('Dialysis session time (h) — for Kt/V', 'kt-time', { placeholder: 'e.g. 4', inputmode: 'decimal' }));
    root.appendChild(field('Post-dialysis weight (kg) — for Kt/V', 'kt-wt', { placeholder: 'e.g. 70', inputmode: 'decimal' }));
    const o = out(); root.appendChild(o);
    wire(['kt-pre', 'kt-post', 'kt-uf', 'kt-time', 'kt-wt'], () => safe(o, () => {
      const r = M.ktvUrr({
        preBun: optNum('kt-pre'), postBun: optNum('kt-post'),
        ufVolume: optNum('kt-uf'), dialysisTime: optNum('kt-time'), postWeight: optNum('kt-wt'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const rows = [
        { text: r.band, cls: (!r.urrMet || r.ktvMet === false) ? 'warn' : null },
        { label: 'Urea reduction ratio (URR)', value: `${r.urr}% (target ≥ 65%)` },
      ];
      if (r.ktv != null) rows.push({ label: 'Single-pool Kt/V', value: `${r.ktv} (target ≥ 1.2)` });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 mehran-cin --------------------------------------------------
  'mehran-cin'(root) {
    root.appendChild(selectField('Hypotension (5 points)', 'me-hypo', YESNO));
    root.appendChild(selectField('Intra-aortic balloon pump (5 points)', 'me-iabp', YESNO));
    root.appendChild(selectField('Congestive heart failure (5 points)', 'me-chf', YESNO));
    root.appendChild(selectField('Age > 75 (4 points)', 'me-age', YESNO));
    root.appendChild(selectField('Anemia (3 points)', 'me-anemia', YESNO));
    root.appendChild(selectField('Diabetes (3 points)', 'me-dm', YESNO));
    root.appendChild(field('Contrast volume (mL) — 1 point per 100 mL', 'me-contrast', { placeholder: 'e.g. 300', inputmode: 'numeric' }));
    root.appendChild(field('eGFR (mL/min/1.73m²) — 40–60=2, 20–40=4, <20=6', 'me-egfr', { placeholder: 'e.g. 30', inputmode: 'decimal' }));
    const o = out(); root.appendChild(o);
    wire(['me-hypo', 'me-iabp', 'me-chf', 'me-age', 'me-anemia', 'me-dm', 'me-contrast', 'me-egfr'], () => safe(o, () => {
      const r = M.mehranCin({
        hypotension: selVal('me-hypo'), iabp: selVal('me-iabp'), chf: selVal('me-chf'),
        ageOver75: selVal('me-age'), anemia: selVal('me-anemia'), diabetes: selVal('me-dm'),
        contrastVolume: optNum('me-contrast'), egfr: optNum('me-egfr'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const p = r.points;
      resultRow(o, [
        { text: r.band, cls: (r.riskKey === 'high' || r.riskKey === 'vhigh') ? 'warn' : null },
        { label: 'Total score', value: String(r.total) },
        { label: 'Points (hypo / IABP / CHF / age / anemia / DM / contrast / eGFR)', value: `${p.hypotension} / ${p.iabp} / ${p.chf} / ${p.ageOver75} / ${p.anemia} / ${p.diabetes} / ${p.contrast} / ${p.egfr}` },
        { label: 'Risk band', value: r.risk },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 ckd-epi-cystatin --------------------------------------------
  'ckd-epi-cystatin'(root) {
    root.appendChild(field('Serum cystatin C (mg/L) — must be > 0', 'cc-cys', { placeholder: 'e.g. 1.5', inputmode: 'decimal' }));
    root.appendChild(field('Serum creatinine (mg/dL) — optional, for the combined estimate', 'cc-cr', { placeholder: 'e.g. 1.1', inputmode: 'decimal' }));
    root.appendChild(field('Age (years)', 'cc-age', { placeholder: 'e.g. 70', inputmode: 'numeric' }));
    root.appendChild(selectField('Sex', 'cc-sex', [
      { value: 'male', text: 'Male' },
      { value: 'female', text: 'Female' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['cc-cys', 'cc-cr', 'cc-age', 'cc-sex'], () => safe(o, () => {
      const r = M.ckdEpiCystatin({
        cystatinC: optNum('cc-cys'), creatinine: optNum('cc-cr'),
        age: optNum('cc-age'), sex: selVal('cc-sex'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const rows = [
        { text: r.band },
        { label: 'eGFRcys (cystatin-only)', value: `${r.egfrCys} mL/min/1.73m²` },
      ];
      if (r.egfrCrCys != null) rows.push({ label: 'eGFRcr-cys (combined, confirmatory)', value: `${r.egfrCrCys} mL/min/1.73m²` });
      if (r.egfrCr != null) rows.push({ label: 'eGFRcr (creatinine-only, for comparison)', value: `${r.egfrCr} mL/min/1.73m²` });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
