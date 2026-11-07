// spec-v1708: tpa-eligibility, the IV thrombolysis checklist from the AHA/ASA 2026 guideline beside the TNKase and
// Activase labels. Table 8's rows are grouped by its three tiers.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as TPA from '../lib/tpa-eligibility-v1708.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function textField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'text', autocomplete: 'off', placeholder }));
  root.appendChild(wrap);
}
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '5', placeholder }));
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ` ${label}` }));
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) {
  const n = document.getElementById(id);
  if (!n) return '';
  return n.type === 'checkbox' ? n.checked : n.value;
}
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}
// chart(result) -> a plot figure or null. It renders beside the answer region, not in it, so the live region
// announces the answer and not a table of plotted values (docs/design.md 7).
function tool(root, pairs, compute, chart) {
  const o = out(); root.appendChild(o);
  const area = el('div', { class: 'plot-area' });
  root.appendChild(area);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    clear(area);
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    const r = compute(args);
    show(r, o);
    if (chart && r.valid) { const fig = chart(r); if (fig) area.appendChild(fig); }
  }));
}

const TIERS = [
  ['absolute', 'Absolute contraindications (Table 8)'],
  ['relative', 'Relative contraindications (Table 8)'],
  ['favorable', 'Benefit generally greater than bleeding risk (Table 8)'],
];

export const renderers = {
  'tpa-eligibility'(root) {
    selectField(root, 'Time from last known well', 'tpa-timing', TPA.TIMING_OPTIONS);
    selectField(root, 'Are the deficits disabling?', 'tpa-disabling', TPA.DISABLING_OPTIONS);
    selectField(root, 'Extended windows: is thrombectomy an option?', 'tpa-evt', TPA.EVT_OPTIONS);
    checkField(root, 'Extended windows: salvageable penumbra on automated perfusion imaging', 'tpa-penumbra');
    checkField(root, 'Extended windows: large-vessel occlusion', 'tpa-lvo');
    checkField(root, 'Unknown onset: MRI-DWI lesion under one-third of the MCA territory, no marked FLAIR change', 'tpa-dwi');
    numField(root, 'Systolic BP (mm Hg)', 'tpa-sbp', '160');
    numField(root, 'Diastolic BP (mm Hg)', 'tpa-dbp', '90');
    numField(root, 'Glucose (mg/dL)', 'tpa-glu', '120');
    numField(root, 'Platelets (x1,000/mm³, optional)', 'tpa-plt', '');
    numField(root, 'INR (optional)', 'tpa-inr', '');
    numField(root, 'aPTT in seconds (optional)', 'tpa-aptt', '');
    numField(root, 'PT in seconds (optional)', 'tpa-pt', '');
    checkField(root, 'Recent warfarin or heparin use', 'tpa-anticoag');
    for (const [tier, title] of TIERS) {
      root.appendChild(el('h2', { text: title }));
      for (const c of TPA.CONDITIONS.filter((x) => x.tier === tier)) checkField(root, c.text, `tpa-c-${c.key}`);
    }
    root.appendChild(el('h2', { text: 'Contraindications in the labels only' }));
    checkField(root, 'Active internal bleeding', 'tpa-active-bleed');
    checkField(root, 'Subarachnoid hemorrhage', 'tpa-sah');
    const pairs = [['tpa-timing', 'timing'], ['tpa-disabling', 'disabling'], ['tpa-evt', 'evtCandidate'], ['tpa-penumbra', 'perfusionPenumbra'], ['tpa-lvo', 'lvo'], ['tpa-dwi', 'dwiFlairMismatch'], ['tpa-sbp', 'sbp'], ['tpa-dbp', 'dbp'], ['tpa-glu', 'glucose'], ['tpa-plt', 'platelets'], ['tpa-inr', 'inr'], ['tpa-aptt', 'aptt'], ['tpa-pt', 'pt'], ['tpa-anticoag', 'recentAnticoagulant'], ['tpa-active-bleed', 'activeInternalBleeding'], ['tpa-sah', 'subarachnoid'],
      ...TPA.CONDITIONS.map((c) => [`tpa-c-${c.key}`, c.key])];
    tool(root, pairs, TPA.tpaEligibility);
  },
};
