// spec-v89 §2: renderers for the four subspecialty tiles
// (das28, kings-college, asa-ps, surgical-apgar).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Nullable numeric outputs route through fmt() so a guarded null never reaches
// the DOM as NaN/undefined (spec-v53 §3.2). Each tile renders the spec-v50 §3
// clinical posture note and quotes the cited source's own band / class /
// definition - none authors a management order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import * as M from '../lib/rheum-periop-v89.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not an order. The bands, classes, and definitions are the cited source’s; the diagnosis and the management decision stay with the clinician and local protocol.' }));
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
  // ----- 2.1 das28 --------------------------------------------------------
  das28(root) {
    root.appendChild(field('Tender 28-joint count (TJC28, 0–28)', 'da-tjc', { placeholder: 'e.g. 8' }));
    root.appendChild(field('Swollen 28-joint count (SJC28, 0–28)', 'da-sjc', { placeholder: 'e.g. 4' }));
    root.appendChild(selectField('Inflammatory marker form', 'da-form', [
      { value: 'esr', text: 'ESR (DAS28-ESR)' },
      { value: 'crp', text: 'CRP (DAS28-CRP)' },
    ]));
    root.appendChild(field('ESR (mm/hr — for the ESR form)', 'da-esr', { placeholder: 'e.g. 30' }));
    root.appendChild(field('CRP (mg/L — for the CRP form)', 'da-crp', { placeholder: 'e.g. 10' }));
    root.appendChild(field('Patient global health VAS (0–100 mm)', 'da-gh', { placeholder: 'e.g. 50' }));
    const o = out(); root.appendChild(o);
    wire(['da-tjc', 'da-sjc', 'da-form', 'da-esr', 'da-crp', 'da-gh'], () => safe(o, () => {
      const r = M.das28({
        tjc28: optNum('da-tjc'), sjc28: optNum('da-sjc'), form: selVal('da-form'),
        esr: optNum('da-esr'), crp: optNum('da-crp'), globalHealth: optNum('da-gh'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: (r.activity === 'moderate' || r.activity === 'high') ? 'warn' : null },
        { label: 'Score', value: fmt(r.score, { fallback: '--' }) },
        { label: 'Form', value: r.formLabel },
        { label: 'EULAR activity', value: r.activity },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 kings-college ------------------------------------------------
  'kings-college'(root) {
    root.appendChild(field('Arterial pH (after fluid resuscitation)', 'kc-ph', { placeholder: 'e.g. 7.25' }));
    root.appendChild(field('INR', 'kc-inr', { placeholder: 'e.g. 7.0' }));
    root.appendChild(field('PT (seconds — alternative to INR)', 'kc-pt', { placeholder: 'e.g. 110' }));
    root.appendChild(field('Serum creatinine', 'kc-cr', { placeholder: 'e.g. 4.0' }));
    root.appendChild(selectField('Creatinine unit', 'kc-crunit', [
      { value: 'mg/dl', text: 'mg/dL (threshold > 3.4)' },
      { value: 'umol/l', text: 'µmol/L (threshold > 300)' },
    ]));
    root.appendChild(selectField('Grade III/IV hepatic encephalopathy', 'kc-enc', [
      { value: 'no', text: 'No (grade 0–II or not present)' },
      { value: 'yes', text: 'Yes (grade III/IV)' },
    ]));
    root.appendChild(field('Arterial lactate (mmol/L — modified criterion)', 'kc-lac', { placeholder: 'e.g. 4.0' }));
    root.appendChild(selectField('Lactate timing', 'kc-lactime', [
      { value: 'resuscitated', text: 'After fluid resuscitation (threshold > 3.0)' },
      { value: 'early', text: 'Early / on admission (threshold > 3.5)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['kc-ph', 'kc-inr', 'kc-pt', 'kc-cr', 'kc-crunit', 'kc-enc', 'kc-lac', 'kc-lactime'], () => safe(o, () => {
      const r = M.kingsCollege({
        ph: optNum('kc-ph'), inr: optNum('kc-inr'), pt: optNum('kc-pt'),
        creatinine: optNum('kc-cr'), creatinineUnit: selVal('kc-crunit'),
        encephalopathy: selVal('kc-enc'), lactate: optNum('kc-lac'), lactateTiming: selVal('kc-lactime'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.meets ? 'warn' : null },
        { label: 'pH < 7.30 limb', value: metTag(r.phLimb) },
        { label: 'Coagulopathy (INR > 6.5 / PT > 100 s)', value: metTag(r.coag) },
        { label: 'Creatinine above threshold', value: metTag(r.creatHigh) },
        { label: 'Grade III/IV encephalopathy', value: metTag(r.enceph) },
        { label: 'Three-part limb', value: r.threePartComplete ? metTag(r.threePartMet) : 'incomplete' },
        { label: 'Modified lactate limb', value: metTag(r.lactateLimb) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 asa-ps -------------------------------------------------------
  'asa-ps'(root) {
    root.appendChild(selectField('ASA Physical Status class', 'as-class', [
      { value: '1', text: 'I — A normal healthy patient' },
      { value: '2', text: 'II — Mild systemic disease' },
      { value: '3', text: 'III — Severe systemic disease' },
      { value: '4', text: 'IV — Severe systemic disease, constant threat to life' },
      { value: '5', text: 'V — Moribund, not expected to survive without the operation' },
      { value: '6', text: 'VI — Declared brain-dead, organ donor' },
    ]));
    root.appendChild(selectField('Emergency (E modifier)', 'as-emerg', [
      { value: 'no', text: 'No (elective)' },
      { value: 'yes', text: 'Yes — delay would significantly increase the threat to life/body part' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['as-class', 'as-emerg'], () => safe(o, () => {
      const r = M.asaPs({ asaClass: Number(selVal('as-class')), emergency: selVal('as-emerg') === 'yes' });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.display, cls: r.asaClass >= 4 ? 'warn' : null },
        { label: 'Definition', value: r.definition },
        { label: 'Example conditions', value: r.examples },
        ...(r.eSuppressed ? [{ label: 'E modifier', value: 'not applicable to ASA I or VI' }] : []),
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 surgical-apgar ----------------------------------------------
  'surgical-apgar'(root) {
    root.appendChild(field('Estimated intraoperative blood loss (mL)', 'sa-ebl', { placeholder: 'e.g. 200' }));
    root.appendChild(field('Lowest intraoperative mean arterial pressure (mmHg)', 'sa-map', { placeholder: 'e.g. 60' }));
    root.appendChild(field('Lowest intraoperative heart rate (bpm)', 'sa-hr', { placeholder: 'e.g. 80' }));
    const o = out(); root.appendChild(o);
    wire(['sa-ebl', 'sa-map', 'sa-hr'], () => safe(o, () => {
      const r = M.surgicalApgar({ ebl: optNum('sa-ebl'), lowestMap: optNum('sa-map'), lowestHr: optNum('sa-hr') });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.risk === 'high' ? 'warn' : null },
        { label: 'Score', value: `${r.score} of 10` },
        { label: 'Blood-loss points', value: fmt(r.eblPts, { fallback: '(enter EBL)' }) },
        { label: 'Lowest-MAP points', value: fmt(r.mapPts, { fallback: '(enter MAP)' }) },
        { label: 'Lowest-HR points', value: fmt(r.hrPts, { fallback: '(enter HR)' }) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
