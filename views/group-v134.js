// spec-v134 §2: renderers for the six plasma-cell and myeloid-neoplasm staging
// tiles -- myeloma-iss, myeloma-r-iss, myeloma-r2-iss, mgus-risk, dipss-mf,
// dipss-plus-mf -- all in Clinical Scoring & Risk (Group G), beside ipss-r-mds
// and flipi.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a stage /
// risk group, not management (spec-v11 §5.3). Each compute surfaces a complete-
// the-fields fallback rather than a bad stage; the yes/no and category selects
// carry a blank leading option so a partial entry is reported as not-assessed,
// not silently scored 0 (lib/onc-v134.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/onc-v134.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The stage or risk group is the cited instrument’s, computed from the values you entered. The diagnosis and the management decision — treatment line, transplant eligibility, surveillance interval — stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

const BLANK = { value: '', text: 'Select…' };
const YN = [BLANK, { value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
const ISS_OPTS = [BLANK, { value: 'I', text: 'ISS I' }, { value: 'II', text: 'ISS II' }, { value: 'III', text: 'ISS III' }];
const ISOTYPE_OPTS = [BLANK, { value: 'IgG', text: 'IgG' }, { value: 'IgA', text: 'IgA' }, { value: 'IgM', text: 'IgM' }];
const DIPSS_GROUP_OPTS = [BLANK,
  { value: 'low', text: 'Low' }, { value: 'int-1', text: 'Intermediate-1' },
  { value: 'int-2', text: 'Intermediate-2' }, { value: 'high', text: 'High' }];

export const renderers = {
  // ----- 2.1 myeloma-iss ------------------------------------------------
  'myeloma-iss'(root) {
    note(root, 'Multiple myeloma ISS (Greipp 2005): a two-variable stage from serum β2-microglobulin and albumin. Stage I = β2M <3.5 mg/L AND albumin ≥3.5 g/dL; Stage III = β2M ≥5.5 mg/L (whatever the albumin); Stage II = neither. Median OS ~62 / 44 / 29 months in the 2005 derivation cohort. Cross-links the R-ISS.');
    root.appendChild(field('Serum β2-microglobulin (mg/L)', 'iss-b2m', { step: '0.1', min: 0, placeholder: 'e.g. 3.2' }));
    root.appendChild(field('Serum albumin (g/dL)', 'iss-alb', { step: '0.1', min: 0, placeholder: 'e.g. 4.0' }));
    const o = out(); root.appendChild(o);
    wire(['iss-b2m', 'iss-alb'], () => safe(o, () => {
      const r = M.myelomaIss({ b2m: optNum('iss-b2m'), albumin: optNum('iss-alb') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'ISS stage', value: r.stage }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 myeloma-r-iss ----------------------------------------------
  'myeloma-r-iss'(root) {
    note(root, 'Revised ISS (Palumbo 2015, IMWG): refines the ISS with serum LDH and high-risk iFISH (del(17p), t(4;14), or t(14;16)). The tile recomputes the ISS from β2M + albumin so the chain cannot desync. Stage I = ISS I + normal LDH + no high-risk iFISH; Stage III = ISS III + (high LDH OR high-risk iFISH); Stage II = all others. 5-yr OS ~82 / 62 / 40%.');
    root.appendChild(field('Serum β2-microglobulin (mg/L)', 'riss-b2m', { step: '0.1', min: 0, placeholder: 'e.g. 6.0' }));
    root.appendChild(field('Serum albumin (g/dL)', 'riss-alb', { step: '0.1', min: 0, placeholder: 'e.g. 3.2' }));
    root.appendChild(selectField('Serum LDH above the upper limit of normal?', 'riss-ldh', YN));
    root.appendChild(selectField('High-risk iFISH — del(17p), t(4;14), or t(14;16)?', 'riss-fish', YN));
    const o = out(); root.appendChild(o);
    wire(['riss-b2m', 'riss-alb', 'riss-ldh', 'riss-fish'], () => safe(o, () => {
      const r = M.myelomaRIss({ b2m: optNum('riss-b2m'), albumin: optNum('riss-alb'), ldhHigh: selVal('riss-ldh'), highRiskFish: selVal('riss-fish') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'R-ISS stage', value: r.stage }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 myeloma-r2-iss ---------------------------------------------
  'myeloma-r2-iss'(root) {
    note(root, 'Second-Revision ISS (D’Agostino 2022, EMN/HARMONY): an additive weighted model. ISS II = 1.0, ISS III = 1.5; high LDH = 1.0; del(17p) = 1.0; t(4;14) = 1.0; gain/amp 1q21 = 0.5. Total 0–5 → strata 0 = I (low), 0.5–1 = II (low-intermediate), 1.5–2.5 = III (intermediate-high), 3–5 = IV (high). Cross-links the R-ISS.');
    root.appendChild(selectField('ISS stage', 'r2-iss', ISS_OPTS));
    root.appendChild(selectField('Serum LDH above the upper limit of normal?', 'r2-ldh', YN));
    root.appendChild(selectField('del(17p) present?', 'r2-del17p', YN));
    root.appendChild(selectField('t(4;14) present?', 'r2-t414', YN));
    root.appendChild(selectField('Gain / amplification of 1q21 present?', 'r2-gain1q', YN));
    const o = out(); root.appendChild(o);
    wire(['r2-iss', 'r2-ldh', 'r2-del17p', 'r2-t414', 'r2-gain1q'], () => safe(o, () => {
      const r = M.myelomaR2Iss({ iss: selVal('r2-iss'), ldhHigh: selVal('r2-ldh'), del17p: selVal('r2-del17p'), t414: selVal('r2-t414'), gain1q: selVal('r2-gain1q') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'R2-ISS', value: `${r.total} of 5 (${r.stratum})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 mgus-risk --------------------------------------------------
  'mgus-risk'(root) {
    note(root, 'Mayo MGUS risk stratification (Rajkumar 2005): counts three factors — serum M-protein ≥1.5 g/dL, a non-IgG isotype (IgA or IgM), and an abnormal serum free-light-chain ratio (outside 0.26–1.65). The 0–3 count maps to a 20-year progression risk of 5 / 21 / 37 / 58%, driving the surveillance interval.');
    root.appendChild(field('Serum M-protein (g/dL)', 'mg-mspike', { step: '0.1', min: 0, placeholder: 'e.g. 1.2' }));
    root.appendChild(selectField('Monoclonal isotype', 'mg-iso', ISOTYPE_OPTS));
    root.appendChild(field('Serum free-light-chain (κ/λ) ratio', 'mg-flc', { step: '0.01', min: 0, placeholder: 'e.g. 1.4' }));
    const o = out(); root.appendChild(o);
    wire(['mg-mspike', 'mg-iso', 'mg-flc'], () => safe(o, () => {
      const r = M.mgusRisk({ mspike: optNum('mg-mspike'), isotype: selVal('mg-iso'), flcRatio: optNum('mg-flc') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'MGUS risk', value: `${r.count} of 3 (${r.tier})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 dipss-mf ---------------------------------------------------
  'dipss-mf'(root) {
    note(root, 'DIPSS for primary myelofibrosis (Passamonti 2010): a dynamic survival score. Age >65 = 1, WBC >25 ×10⁹/L = 1, hemoglobin <10 g/dL = 2 (weighted), peripheral blasts ≥1% = 1, constitutional symptoms = 1. Total 0–6 → low (0), int-1 (1–2), int-2 (3–4), high (5–6). Median survival not-reached / 14.2 / 4 / 1.5 years. Cross-links DIPSS-Plus.');
    root.appendChild(field('Age (years)', 'dp-age', { step: '1', min: 0, placeholder: 'e.g. 68' }));
    root.appendChild(field('WBC (×10⁹/L)', 'dp-wbc', { step: '0.1', min: 0, placeholder: 'e.g. 12' }));
    root.appendChild(field('Hemoglobin (g/dL)', 'dp-hgb', { step: '0.1', min: 0, placeholder: 'e.g. 9.5' }));
    root.appendChild(field('Peripheral blood blasts (%)', 'dp-blast', { step: '0.1', min: 0, placeholder: 'e.g. 1' }));
    root.appendChild(selectField('Constitutional symptoms (weight loss, fever, night sweats)?', 'dp-const', YN));
    const o = out(); root.appendChild(o);
    wire(['dp-age', 'dp-wbc', 'dp-hgb', 'dp-blast', 'dp-const'], () => safe(o, () => {
      const r = M.dipssMf({ age: optNum('dp-age'), wbc: optNum('dp-wbc'), hgb: optNum('dp-hgb'), blasts: optNum('dp-blast'), constitutional: selVal('dp-const') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'DIPSS', value: `${r.total} of 6 (${r.group})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 dipss-plus-mf ----------------------------------------------
  'dipss-plus-mf'(root) {
    note(root, 'DIPSS-Plus (Gangat 2011): refines DIPSS with three further variables. The DIPSS group is carried forward (int-1 = 1, int-2 = 2, high = 3; low = 0), then platelet <100 ×10⁹/L = 1, red-cell transfusion need = 1, unfavorable karyotype = 1. Total 0–6 → low (0), int-1 (1), int-2 (2–3), high (4–6). Median survival 15.4 / 6.5 / 2.9 / 1.3 years.');
    root.appendChild(selectField('DIPSS risk group', 'dpp-grp', DIPSS_GROUP_OPTS));
    root.appendChild(field('Platelet count (×10⁹/L)', 'dpp-plt', { step: '1', min: 0, placeholder: 'e.g. 90' }));
    root.appendChild(selectField('Red-cell transfusion need?', 'dpp-tx', YN));
    root.appendChild(selectField('Unfavorable karyotype?', 'dpp-kar', YN));
    const o = out(); root.appendChild(o);
    wire(['dpp-grp', 'dpp-plt', 'dpp-tx', 'dpp-kar'], () => safe(o, () => {
      const r = M.dipssPlusMf({ dipssGroup: selVal('dpp-grp'), platelet: optNum('dpp-plt'), transfusion: selVal('dpp-tx'), karyotype: selVal('dpp-kar') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'DIPSS-Plus', value: `${r.total} of 6 (${r.group})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
