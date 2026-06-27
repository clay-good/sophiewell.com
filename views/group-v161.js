// spec-v161 §2: renderers for the four endocrine / metabolic / nutrition-support
// arithmetic tiles of the spec-v157 Subspecialty Depth program — arr
// (Aldosterone-Renin Ratio), calciumPhosphateProduct (CKD-MBD), freeThyroxineIndex
// (FTI), and nitrogenBalance. arr / calciumPhosphateProduct / freeThyroxineIndex
// are Clinical Math & Conversions (Group E); nitrogenBalance is Medication &
// Infusion (Group F, nutrition-support context).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each is
// closed-form arithmetic over finite-checked labs; every division (arr renin,
// freeThyroxineIndex reference) is guarded in lib/endo-metab-v161.js. Per the
// spec-v50 §3 posture note each tile states it is screening/monitoring arithmetic
// over labs (confirmation and treatment are clinical) and defers the decision to
// the clinician (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/endo-metab-v161.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function numField(label, id, attrs = {}) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal', ...attrs });
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
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. These are screening / monitoring computations over the labs you enter; confirmation and treatment are clinical decisions that stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const RENIN_UNITS = [
  { value: 'pra', text: 'Plasma renin activity — PRA (ng/mL/h)' },
  { value: 'drc', text: 'Direct renin concentration — DRC (mIU/L)' },
];
const CAPO4_UNITS = [
  { value: 'mg-dl', text: 'mg/dL (US conventional)' },
  { value: 'mmol-l', text: 'mmol/L (SI)' },
];

export const renderers = {
  // ----- 2.1 arr -------------------------------------------------------------
  arr(root) {
    note(root, 'Aldosterone-Renin Ratio (Endocrine Society 2016): ARR = plasma aldosterone (ng/dL) ÷ renin. The cutoff differs by renin unit — with PRA ~20–40 (representative 30) and with DRC ~3.7 — and is never compared across unit systems; a positive screen also needs aldosterone ≥ 15 ng/dL and warrants confirmatory testing. Near-neighbors: corrected-calcium.');
    root.appendChild(numField('Plasma aldosterone concentration (ng/dL)', 'arr-aldo', { min: '0' }));
    root.appendChild(numField('Renin value (> 0)', 'arr-renin', { min: '0' }));
    root.appendChild(pickField('Renin assay unit', 'arr-unit', RENIN_UNITS));
    const o = out(); root.appendChild(o);
    wire(['arr-aldo', 'arr-renin', 'arr-unit'], () => safe(o, () => {
      const r = M.arr({ aldosterone: val('arr-aldo'), renin: val('arr-renin'), reninUnit: val('arr-unit') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ARR', value: `${r.ratio}` },
        { label: 'Screen', value: r.bandLabel },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 calcium-phosphate-product ---------------------------------------
  'calcium-phosphate-product'(root) {
    note(root, 'Calcium-phosphate product (CKD-MBD): Ca × PO₄ in mg²/dL². A product above 55 was a historical caution threshold. Contemporary KDIGO guidance favors tracking calcium and phosphate individually over the product, so the product is shown as context, not a target. Near-neighbors: corrected-calcium.');
    root.appendChild(pickField('Input units', 'capo4-unit', CAPO4_UNITS));
    root.appendChild(numField('Serum calcium', 'capo4-ca', { min: '0' }));
    root.appendChild(numField('Serum phosphate', 'capo4-po', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['capo4-unit', 'capo4-ca', 'capo4-po'], () => safe(o, () => {
      const r = M.calciumPhosphateProduct({ unit: val('capo4-unit') || 'mg-dl', calcium: val('capo4-ca'), phosphate: val('capo4-po') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Ca × PO₄', value: `${r.product} mg²/dL²` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 free-thyroxine-index --------------------------------------------
  'free-thyroxine-index'(root) {
    note(root, 'Free Thyroxine Index (FTI / T7): FTI = total T4 × (T3-resin uptake % ÷ reference-mean T3RU%, default 30%). Corrects total T4 for binding-protein changes — pregnancy/estrogen raise TBG and total T4 but the FTI stays normal. A legacy index where direct free-T4 immunoassay is unavailable. Near-neighbors: eag-a1c.');
    root.appendChild(numField('Total T4 (µg/dL)', 'fti-t4', { min: '0' }));
    root.appendChild(numField('T3-resin uptake (%)', 'fti-t3ru', { min: '0', max: '100' }));
    root.appendChild(numField('Reference-mean T3RU (%, optional — default 30)', 'fti-ref', { min: '0', max: '100' }));
    const o = out(); root.appendChild(o);
    wire(['fti-t4', 'fti-t3ru', 'fti-ref'], () => safe(o, () => {
      const r = M.freeThyroxineIndex({ t4: val('fti-t4'), t3ru: val('fti-t3ru'), reference: val('fti-ref') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'FTI', value: `${r.fti}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 nitrogen-balance ------------------------------------------------
  'nitrogen-balance'(root) {
    note(root, 'Nitrogen balance (ASPEN): N balance = (24-hour protein g ÷ 6.25) − (24-hour urine urea nitrogen g + insensible losses, default 4 g/day). Positive is anabolic, negative catabolic. Needs a complete 24-hour urine collection and is unreliable in renal impairment. Near-neighbors: icu-nutrition-target, mifflin-st-jeor.');
    root.appendChild(numField('24-hour protein (or amino-acid) intake (g)', 'nbal-protein', { min: '0' }));
    root.appendChild(numField('24-hour urine urea nitrogen UUN (g)', 'nbal-uun', { min: '0' }));
    root.appendChild(numField('Insensible losses (g/day, optional — default 4)', 'nbal-insensible', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['nbal-protein', 'nbal-uun', 'nbal-insensible'], () => safe(o, () => {
      const r = M.nitrogenBalance({ protein: val('nbal-protein'), uun: val('nbal-uun'), insensible: val('nbal-insensible') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'N balance', value: `${r.balance} g/day` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
