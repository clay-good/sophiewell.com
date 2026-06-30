// spec-v93 §2: renderers for the six hepatology & GI disease-activity tiles
// (nafld-fibrosis, glasgow-imrie, truelove-witts, harvey-bradshaw, mayo-uc,
// milan-criteria).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Nullable numeric outputs route through fmt() so a guarded null never reaches
// the DOM as NaN/undefined (spec-v53 §3.2). Each tile renders the spec-v50 §3
// clinical posture note and quotes the cited source's own band / class / index /
// criterion - none authors a management or listing order in Sophie's voice
// (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hepgi-v93.js';
import { resultRow } from '../lib/result-copy.js';
import { unitField, unitNumOpt, TEMP_UNITS } from '../lib/field-units.js';

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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not an order. The fibrosis band, severity class, activity index, and eligibility criterion are the cited source’s; the diagnosis, the admit / IV-steroid / biologic decision, and the transplant-listing decision stay with the clinician and local protocol.' }));
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
const ord = (max, labels) => Array.from({ length: max + 1 }, (_, i) => ({ value: String(i), text: labels[i] }));

export const renderers = {
  // ----- 2.1 nafld-fibrosis ----------------------------------------------
  'nafld-fibrosis'(root) {
    root.appendChild(field('Age (years)', 'nf-age', { placeholder: 'e.g. 60', inputmode: 'numeric' }));
    root.appendChild(field('BMI (kg/m²)', 'nf-bmi', { placeholder: 'e.g. 30', inputmode: 'decimal' }));
    root.appendChild(selectField('Impaired fasting glucose or diabetes', 'nf-ifg', YESNO));
    root.appendChild(field('AST (U/L)', 'nf-ast', { placeholder: 'e.g. 60', inputmode: 'decimal' }));
    root.appendChild(field('ALT (U/L) — must be > 0', 'nf-alt', { placeholder: 'e.g. 40', inputmode: 'decimal' }));
    root.appendChild(field('Platelet count (×10⁹/L)', 'nf-plt', { placeholder: 'e.g. 200', inputmode: 'decimal' }));
    root.appendChild(field('Albumin (g/dL)', 'nf-alb', { placeholder: 'e.g. 4.0', inputmode: 'decimal' }));
    const o = out(); root.appendChild(o);
    wire(['nf-age', 'nf-bmi', 'nf-ifg', 'nf-ast', 'nf-alt', 'nf-plt', 'nf-alb'], () => safe(o, () => {
      const r = M.nafldFibrosis({
        age: optNum('nf-age'), bmi: optNum('nf-bmi'), ifgDm: selVal('nf-ifg'),
        ast: optNum('nf-ast'), alt: optNum('nf-alt'),
        platelets: optNum('nf-plt'), albumin: optNum('nf-alb'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.bandKey === 'high' ? 'warn' : null },
        { label: 'NAFLD Fibrosis Score', value: String(r.score) },
        { label: 'AST/ALT ratio', value: String(r.astAltRatio) },
        { label: 'Interpretation', value: r.interpretation },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 glasgow-imrie -----------------------------------------------
  'glasgow-imrie'(root) {
    root.appendChild(field('PaO₂ (mmHg) — 1 point if < 60', 'gi-pao2', { placeholder: 'e.g. 55', inputmode: 'decimal' }));
    root.appendChild(field('Age (years) — 1 point if > 55', 'gi-age', { placeholder: 'e.g. 60', inputmode: 'numeric' }));
    root.appendChild(field('WBC (×10⁹/L) — 1 point if > 15', 'gi-wbc', { placeholder: 'e.g. 18', inputmode: 'decimal' }));
    root.appendChild(field('Calcium (mmol/L) — 1 point if < 2', 'gi-ca', { placeholder: 'e.g. 1.8', inputmode: 'decimal' }));
    root.appendChild(field('Urea (mmol/L) — 1 point if > 16', 'gi-urea', { placeholder: 'e.g. 20', inputmode: 'decimal' }));
    root.appendChild(field('LDH (IU/L) — 1 point if > 600', 'gi-ldh', { placeholder: 'e.g. 700', inputmode: 'decimal' }));
    root.appendChild(field('Albumin (g/L) — 1 point if < 32', 'gi-alb', { placeholder: 'e.g. 30', inputmode: 'decimal' }));
    root.appendChild(field('Glucose (mmol/L) — 1 point if > 10', 'gi-glu', { placeholder: 'e.g. 12', inputmode: 'decimal' }));
    const o = out(); root.appendChild(o);
    const ids = ['gi-pao2', 'gi-age', 'gi-wbc', 'gi-ca', 'gi-urea', 'gi-ldh', 'gi-alb', 'gi-glu'];
    wire(ids, () => safe(o, () => {
      const r = M.glasgowImrie({
        pao2: optNum('gi-pao2'), age: optNum('gi-age'), wbc: optNum('gi-wbc'),
        calcium: optNum('gi-ca'), urea: optNum('gi-urea'), ldh: optNum('gi-ldh'),
        albumin: optNum('gi-alb'), glucose: optNum('gi-glu'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.severe ? 'warn' : null },
        { label: 'Total (0–8)', value: String(r.total) },
        { label: 'Items assessed', value: `${r.scored} of 8` },
      ]);
      o.appendChild(el('ul', {}, r.items.map((it) => el('li', { text: `${it.label}: ${it.state}` }))));
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 truelove-witts ----------------------------------------------
  'truelove-witts'(root) {
    root.appendChild(field('Stools per day', 'tw-stools', { placeholder: 'e.g. 8', inputmode: 'numeric' }));
    root.appendChild(selectField('Rectal bleeding', 'tw-bleed', [
      { value: 'none', text: 'None' },
      { value: 'present', text: 'Present' },
    ]));
    root.appendChild(unitField('Temperature', 'tw-temp', TEMP_UNITS, { placeholder: 'e.g. 38' }));
    root.appendChild(field('Heart rate (bpm)', 'tw-hr', { placeholder: 'e.g. 100', inputmode: 'numeric' }));
    root.appendChild(field('Hemoglobin (g/dL)', 'tw-hgb', { placeholder: 'e.g. 9.5', inputmode: 'decimal' }));
    root.appendChild(field('ESR (mm/h)', 'tw-esr', { placeholder: 'e.g. 40', inputmode: 'decimal' }));
    const o = out(); root.appendChild(o);
    wire(['tw-stools', 'tw-bleed', 'tw-temp', 'tw-temp-unit', 'tw-hr', 'tw-hgb', 'tw-esr'], () => safe(o, () => {
      const r = M.trueloveWitts({
        stools: optNum('tw-stools'), bleeding: selVal('tw-bleed'),
        temp: unitNumOpt('tw-temp'), heartRate: optNum('tw-hr'),
        hemoglobin: optNum('tw-hgb'), esr: optNum('tw-esr'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.severe ? 'warn' : null },
        { label: 'Severity', value: r.bandKey },
        { label: 'Systemic criteria met', value: r.systemic.length ? r.systemic.join('; ') : 'none' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 harvey-bradshaw ---------------------------------------------
  'harvey-bradshaw'(root) {
    root.appendChild(selectField('General wellbeing', 'hb-wb', ord(4, [
      '0 — very well', '1 — slightly below par', '2 — poor', '3 — very poor', '4 — terrible',
    ])));
    root.appendChild(selectField('Abdominal pain', 'hb-pain', ord(3, [
      '0 — none', '1 — mild', '2 — moderate', '3 — severe',
    ])));
    root.appendChild(field('Liquid/soft stools per day', 'hb-stools', { placeholder: 'e.g. 4', inputmode: 'numeric' }));
    root.appendChild(selectField('Abdominal mass', 'hb-mass', ord(3, [
      '0 — none', '1 — dubious', '2 — definite', '3 — definite and tender',
    ])));
    root.appendChild(field('Complications (count, 1 point each)', 'hb-cx', { placeholder: 'arthralgia, uveitis, fistula …', inputmode: 'numeric' }));
    const o = out(); root.appendChild(o);
    wire(['hb-wb', 'hb-pain', 'hb-stools', 'hb-mass', 'hb-cx'], () => safe(o, () => {
      const r = M.harveyBradshaw({
        wellbeing: optNum('hb-wb'), pain: optNum('hb-pain'), stools: optNum('hb-stools'),
        mass: optNum('hb-mass'), complications: optNum('hb-cx'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const c = r.components;
      resultRow(o, [
        { text: r.band, cls: (r.bandKey === 'moderate' || r.bandKey === 'severe') ? 'warn' : null },
        { label: 'Total HBI', value: String(r.total) },
        { label: 'Components (wellbeing / pain / stools / mass / complications)', value: `${c.wellbeing} / ${c.pain} / ${c.stools} / ${c.mass} / ${c.complications}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 mayo-uc -----------------------------------------------------
  'mayo-uc'(root) {
    root.appendChild(selectField('Stool frequency subscore', 'mu-sf', ord(3, [
      '0 — normal', '1 — 1–2 more/day', '2 — 3–4 more/day', '3 — 5+ more/day',
    ])));
    root.appendChild(selectField('Rectal bleeding subscore', 'mu-rb', ord(3, [
      '0 — none', '1 — streaks < half the time', '2 — obvious blood most of the time', '3 — blood alone passed',
    ])));
    root.appendChild(selectField('Physician global assessment', 'mu-pg', ord(3, [
      '0 — normal', '1 — mild', '2 — moderate', '3 — severe',
    ])));
    root.appendChild(selectField('Endoscopy subscore — leave blank for partial Mayo', 'mu-en', [
      { value: '', text: '— omit (partial Mayo) —' },
      { value: '0', text: '0 — normal/inactive' },
      { value: '1', text: '1 — mild (erythema, decreased vascular pattern)' },
      { value: '2', text: '2 — moderate (marked erythema, erosions)' },
      { value: '3', text: '3 — severe (spontaneous bleeding, ulceration)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['mu-sf', 'mu-rb', 'mu-pg', 'mu-en'], () => safe(o, () => {
      const enRaw = selVal('mu-en');
      const r = M.mayoUc({
        stoolFreq: optNum('mu-sf'), rectalBleeding: optNum('mu-rb'),
        physicianGlobal: optNum('mu-pg'), endoscopy: enRaw === '' ? null : Number(enRaw),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const c = r.components;
      const compStr = r.form === 'full'
        ? `${c.stoolFreq} / ${c.rectalBleeding} / ${c.physicianGlobal} / ${c.endoscopy}`
        : `${c.stoolFreq} / ${c.rectalBleeding} / ${c.physicianGlobal}`;
      resultRow(o, [
        { text: r.band, cls: (r.bandKey === 'moderate' || r.bandKey === 'severe') ? 'warn' : null },
        { label: 'Form', value: r.form === 'full' ? 'full Mayo (0–12)' : 'partial Mayo (0–9)' },
        { label: r.form === 'full' ? 'Subscores (stool / bleeding / PGA / endoscopy)' : 'Subscores (stool / bleeding / PGA)', value: compStr },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 milan-criteria ----------------------------------------------
  'milan-criteria'(root) {
    root.appendChild(field('Number of HCC nodules', 'mc-n', { placeholder: 'e.g. 1', inputmode: 'numeric', step: '1' }));
    root.appendChild(field('Largest nodule size (cm)', 'mc-size', { placeholder: 'e.g. 4.5', inputmode: 'decimal' }));
    root.appendChild(selectField('Macrovascular invasion', 'mc-inv', YESNO));
    root.appendChild(selectField('Extrahepatic spread', 'mc-spread', YESNO));
    const o = out(); root.appendChild(o);
    wire(['mc-n', 'mc-size', 'mc-inv', 'mc-spread'], () => safe(o, () => {
      const r = M.milanCriteria({
        nodules: optNum('mc-n'), largestSize: optNum('mc-size'),
        macrovascular: selVal('mc-inv'), extrahepatic: selVal('mc-spread'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.within ? null : 'warn' },
        { label: 'Eligibility', value: r.within ? 'within Milan criteria' : 'exceeds Milan criteria' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
