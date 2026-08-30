// spec-v155 §2: renderers for the suite-completion tiles of the spec-v150
// Post-Parity Coverage program — mipi (Mantle Cell Lymphoma International
// Prognostic Index) and wagner-dfu (Wagner diabetic-foot-ulcer grade). Both
// Clinical Scoring & Risk (Group G). Two more shipped here and were retired in
// spec-v913 as duplicates of tiles that already existed: forrest, whose
// instrument is forrest-classification, and university-texas-dfu, whose
// instrument is ut-diabetic-foot. PRECISE-DAPT is deferred under
// the spec-v97 >= 2-source rule (a non-transcribable spline nomogram) and ships
// no renderer (spec-v155 §2.1).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. mipi is
// a closed-form index whose log domain is guarded (LDH/ULN and WBC must be > 0 or
// a complete-the-fields fallback renders, spec-v59); wagner-dfu is a
// deterministic input -> class mapping where every combination resolves to one
// defined grade (spec-v100 §2 classification clarification). Per the spec-v50 §3 posture note each tile defers the
// management decision to the clinician (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/suites-v155.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
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
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score / class and its interpretation are the cited instrument’s, computed from the values you enter. The management decision (therapy intensity, endoscopic hemostasis, debridement, vascular referral, or amputation) stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ECOG_OPTS = [
  { value: '0', text: 'ECOG 0–1 (ambulatory)' },
  { value: '1', text: 'ECOG 2–4 (limited self-care or worse)' },
];
const WAGNER_OPTS = [
  { value: '0', text: '0 — intact skin / at-risk foot (no open lesion)' },
  { value: '1', text: '1 — superficial ulcer' },
  { value: '2', text: '2 — deep ulcer to tendon, capsule, or bone' },
  { value: '3', text: '3 — deep ulcer with abscess or osteomyelitis' },
  { value: '4', text: '4 — localized (forefoot/heel) gangrene' },
  { value: '5', text: '5 — gangrene of the whole foot' },
];

export const renderers = {
  // ----- 2.2 mipi ------------------------------------------------------------
  mipi(root) {
    note(root, 'Mantle Cell Lymphoma International Prognostic Index (Hoster 2008): 0.03535·age + 0.6978·(ECOG 2–4) + 1.367·log₁₀(LDH/ULN) + 0.9393·log₁₀(WBC per µL). Bands low < 5.7, intermediate 5.7 to < 6.2, high ≥ 6.2. Enter WBC as the absolute count per microliter (e.g. 8000), not thousands.');
    root.appendChild(field('Age (years)', 'mipi-age', { type: 'number', min: '0', step: '1', inputmode: 'numeric' }));
    root.appendChild(pickField('ECOG performance status', 'mipi-ecog', ECOG_OPTS));
    root.appendChild(field('Serum LDH (U/L)', 'mipi-ldh', { type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
    root.appendChild(field('LDH upper limit of normal (U/L)', 'mipi-uln', { type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
    root.appendChild(field('White-cell count (per µL, absolute)', 'mipi-wbc', { type: 'number', min: '0', step: 'any', inputmode: 'numeric' }));
    const o = out(); root.appendChild(o);
    wire(['mipi-age', 'mipi-ecog', 'mipi-ldh', 'mipi-uln', 'mipi-wbc'], () => safe(o, () => {
      const r = M.mipi({ age: val('mipi-age'), ecog: val('mipi-ecog'), ldh: val('mipi-ldh'), uln: val('mipi-uln'), wbc: val('mipi-wbc') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'MIPI index', value: `${r.score}` },
        { label: 'Risk', value: r.bandLabel },
        { label: 'LDH/ULN', value: `${r.ldhRatio}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },


  // ----- 2.4 wagner-dfu ------------------------------------------------------
  'wagner-dfu': function wagnerDfu(root) {
    note(root, 'Wagner (Meggitt-Wagner) diabetic foot ulcer grade (Wagner 1981): depth/extent from grade 0 (intact / at-risk foot) through 1 superficial, 2 deep to tendon/capsule/bone, 3 deep with abscess or osteomyelitis, 4 localized gangrene, 5 whole-foot gangrene.');
    root.appendChild(pickField('Lesion depth / extent', 'wagner-grade', WAGNER_OPTS));
    const o = out(); root.appendChild(o);
    wire(['wagner-grade'], () => safe(o, () => {
      const r = M.wagnerDfu({ grade: val('wagner-grade') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Wagner grade', value: `${r.grade}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

};
