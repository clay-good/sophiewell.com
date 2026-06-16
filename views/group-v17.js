// spec-v91 §2: renderers for the five pulmonary-function / chronic-respiratory
// tiles (gold-spirometry, bode-index, gap-ipf, predicted-spirometry,
// mmrc-dyspnea).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Nullable numeric outputs route through fmt() so a guarded null never reaches
// the DOM as NaN/undefined (spec-v53 §3.2). Each tile renders the spec-v50 §3
// clinical posture note and quotes the cited source's own grade / band /
// mortality - none authors a management order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import * as M from '../lib/pulm-v91.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not an order. The grades, bands, and mortality estimates are the cited source’s; the diagnosis and the management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

const MMRC_OPTIONS = [
  { value: '0', text: '0 — breathless only with strenuous exercise' },
  { value: '1', text: '1 — short of breath hurrying on the level / slight hill' },
  { value: '2', text: '2 — walks slower than peers, or stops for breath at own pace' },
  { value: '3', text: '3 — stops for breath after ~100 m or a few minutes' },
  { value: '4', text: '4 — too breathless to leave the house / when dressing' },
];

export const renderers = {
  // ----- 2.1 gold-spirometry ---------------------------------------------
  'gold-spirometry'(root) {
    root.appendChild(field('FEV1 (% predicted) — grades the obstruction', 'gs-pct', { placeholder: 'e.g. 45', inputmode: 'decimal' }));
    root.appendChild(field('FEV1/FVC ratio (0–1) — leave blank to compute from volumes', 'gs-ratio', { placeholder: 'e.g. 0.6', inputmode: 'decimal' }));
    root.appendChild(field('FEV1 (L) — optional, to compute the ratio', 'gs-fev1', { placeholder: 'optional', inputmode: 'decimal' }));
    root.appendChild(field('FVC (L) — optional, to compute the ratio', 'gs-fvc', { placeholder: 'optional', inputmode: 'decimal' }));
    const o = out(); root.appendChild(o);
    wire(['gs-pct', 'gs-ratio', 'gs-fev1', 'gs-fvc'], () => safe(o, () => {
      const r = M.goldSpirometry({
        fev1Pct: optNum('gs-pct'), ratio: optNum('gs-ratio'),
        fev1L: optNum('gs-fev1'), fvcL: optNum('gs-fvc'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: (r.grade >= 3) ? 'warn' : null },
        { label: 'FEV1/FVC ratio', value: fmt(r.ratio, { fallback: '--' }) },
        { label: 'Obstruction (ratio < 0.70)', value: r.obstruction ? 'present' : 'absent' },
        { label: 'GOLD grade', value: r.gradeLabel || (r.obstruction ? '(enter FEV1 %predicted)' : 'not assigned') },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 bode-index --------------------------------------------------
  'bode-index'(root) {
    root.appendChild(field('Body-mass index (BMI, kg/m²)', 'bo-bmi', { placeholder: 'e.g. 24', inputmode: 'decimal' }));
    root.appendChild(field('FEV1 (% predicted)', 'bo-pct', { placeholder: 'e.g. 45', inputmode: 'decimal' }));
    root.appendChild(selectField('mMRC dyspnea grade', 'bo-mmrc', MMRC_OPTIONS));
    root.appendChild(field('6-minute walk distance (m)', 'bo-6mwd', { placeholder: 'e.g. 300', inputmode: 'numeric' }));
    const o = out(); root.appendChild(o);
    wire(['bo-bmi', 'bo-pct', 'bo-mmrc', 'bo-6mwd'], () => safe(o, () => {
      const r = M.bodeIndex({
        bmi: optNum('bo-bmi'), fev1Pct: optNum('bo-pct'),
        mmrc: Number(selVal('bo-mmrc')), sixMwd: optNum('bo-6mwd'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.total >= 5 ? 'warn' : null },
        { label: 'BODE total', value: `${r.total} of 10` },
        { label: 'Points (BMI / obstruction / dyspnea / exercise)', value: `${r.bmiPts} / ${r.obsPts} / ${r.dysPts} / ${r.exPts}` },
        { label: 'Approximate 4-year survival', value: r.survival },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 gap-ipf -----------------------------------------------------
  'gap-ipf'(root) {
    root.appendChild(selectField('Sex', 'gp-sex', [
      { value: 'male', text: 'Male (Gender point = 1)' },
      { value: 'female', text: 'Female (Gender point = 0)' },
    ]));
    root.appendChild(field('Age (years)', 'gp-age', { placeholder: 'e.g. 68', inputmode: 'numeric' }));
    root.appendChild(field('FVC (% predicted)', 'gp-fvc', { placeholder: 'e.g. 60', inputmode: 'decimal' }));
    root.appendChild(field('DLCO (% predicted)', 'gp-dlco', { placeholder: 'e.g. 40', inputmode: 'decimal' }));
    root.appendChild(selectField('DLCO cannot be performed', 'gp-dlco-cannot', [
      { value: 'no', text: 'No — a DLCO value is available' },
      { value: 'yes', text: 'Yes — cannot perform (3 points)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['gp-sex', 'gp-age', 'gp-fvc', 'gp-dlco', 'gp-dlco-cannot'], () => safe(o, () => {
      const r = M.gapIpf({
        sex: selVal('gp-sex'), age: optNum('gp-age'), fvcPct: optNum('gp-fvc'),
        dlcoPct: optNum('gp-dlco'), dlcoCannotPerform: selVal('gp-dlco-cannot') === 'yes',
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.stage === 'III' ? 'warn' : null },
        { label: 'GAP total', value: `${r.total} points` },
        { label: 'Points (gender / age / FVC% / DLCO%)', value: `${r.genderPts} / ${r.agePts} / ${r.fvcPts} / ${r.dlcoPts}` },
        { label: 'GAP stage', value: r.stage },
        { label: 'Estimated mortality', value: r.mortality },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 predicted-spirometry ----------------------------------------
  'predicted-spirometry'(root) {
    root.appendChild(field('Age (years, 3–95)', 'ps-age', { placeholder: 'e.g. 40', inputmode: 'numeric' }));
    root.appendChild(field('Height (cm)', 'ps-height', { placeholder: 'e.g. 175', inputmode: 'decimal' }));
    root.appendChild(selectField('Sex', 'ps-sex', [
      { value: 'male', text: 'Male' },
      { value: 'female', text: 'Female' },
    ]));
    root.appendChild(selectField('Ethnicity group (GLI-2012)', 'ps-eth', [
      { value: 'caucasian', text: 'Caucasian' },
      { value: 'african-american', text: 'African-American' },
      { value: 'ne-asian', text: 'North-East Asian' },
      { value: 'se-asian', text: 'South-East Asian' },
      { value: 'other', text: 'Other / mixed' },
    ]));
    root.appendChild(field('Measured FEV1 (L) — optional, for % predicted', 'ps-fev1', { placeholder: 'optional', inputmode: 'decimal' }));
    root.appendChild(field('Measured FVC (L) — optional, for % predicted', 'ps-fvc', { placeholder: 'optional', inputmode: 'decimal' }));
    const o = out(); root.appendChild(o);
    wire(['ps-age', 'ps-height', 'ps-sex', 'ps-eth', 'ps-fev1', 'ps-fvc'], () => safe(o, () => {
      const r = M.predictedSpirometry({
        age: optNum('ps-age'), heightCm: optNum('ps-height'), sex: selVal('ps-sex'),
        ethnicity: selVal('ps-eth'), measuredFev1: optNum('ps-fev1'), measuredFvc: optNum('ps-fvc'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const rows = [
        { text: r.band },
        { label: 'Predicted FEV1', value: `${fmt(r.predFev1, { fallback: '--' })} L (LLN ${fmt(r.llnFev1, { fallback: '--' })})` },
        { label: 'Predicted FVC', value: `${fmt(r.predFvc, { fallback: '--' })} L (LLN ${fmt(r.llnFvc, { fallback: '--' })})` },
        { label: 'Predicted FEV1/FVC', value: `${fmt(r.predRatio, { fallback: '--' })} (LLN ${fmt(r.llnRatio, { fallback: '--' })})` },
      ];
      if (r.fev1Pct != null) rows.push({ label: 'Measured FEV1 % predicted', value: `${fmt(r.fev1Pct, { fallback: '--' })}% (${r.fev1BelowLln ? 'below LLN' : 'within reference range'})` });
      if (r.fvcPct != null) rows.push({ label: 'Measured FVC % predicted', value: `${fmt(r.fvcPct, { fallback: '--' })}% (${r.fvcBelowLln ? 'below LLN' : 'within reference range'})` });
      resultRow(o, rows);
      if (r.ethnicityFallback) note(o, 'Ethnicity group not in the GLI-2012 sets; the other/mixed coefficient set was used.');
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 mmrc-dyspnea ------------------------------------------------
  'mmrc-dyspnea'(root) {
    root.appendChild(selectField('mMRC dyspnea grade', 'md-grade', MMRC_OPTIONS));
    const o = out(); root.appendChild(o);
    wire(['md-grade'], () => safe(o, () => {
      const r = M.mmrcDyspnea({ grade: Number(selVal('md-grade')) });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.grade >= 3 ? 'warn' : null },
        { label: 'mMRC grade', value: String(r.grade) },
        { label: 'Descriptor', value: r.descriptor },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
