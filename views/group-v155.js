// spec-v155 §2: renderers for the four suite-completion tiles of the spec-v150
// Post-Parity Coverage program — mipi (Mantle Cell Lymphoma International
// Prognostic Index), forrest (UGI-bleeding endoscopic stigmata), wagner-dfu
// (Wagner diabetic-foot-ulcer grade), and university-texas-dfu (UT grade × stage
// grid). All Clinical Scoring & Risk (Group G). PRECISE-DAPT is deferred under
// the spec-v97 >= 2-source rule (a non-transcribable spline nomogram) and ships
// no renderer (spec-v155 §2.1).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. mipi is
// a closed-form index whose log domain is guarded (LDH/ULN and WBC must be > 0 or
// a complete-the-fields fallback renders, spec-v59); forrest/wagner-dfu/
// university-texas-dfu are deterministic input -> class mappings where every
// combination resolves to one defined cell (spec-v100 §2 classification
// clarification). Per the spec-v50 §3 posture note each tile defers the
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score / class and its interpretation are the cited instrument’s, computed from the values you enter. The management decision (therapy intensity, endoscopic haemostasis, debridement, vascular referral, or amputation) stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ECOG_OPTS = [
  { value: '0', text: 'ECOG 0–1 (ambulatory)' },
  { value: '1', text: 'ECOG 2–4 (limited self-care or worse)' },
];
const FORREST_OPTS = [
  { value: 'Ia', text: 'Ia — active spurting haemorrhage' },
  { value: 'Ib', text: 'Ib — active oozing haemorrhage' },
  { value: 'IIa', text: 'IIa — non-bleeding visible vessel' },
  { value: 'IIb', text: 'IIb — adherent clot' },
  { value: 'IIc', text: 'IIc — flat pigmented spot' },
  { value: 'III', text: 'III — clean ulcer base' },
];
const WAGNER_OPTS = [
  { value: '0', text: '0 — intact skin / at-risk foot (no open lesion)' },
  { value: '1', text: '1 — superficial ulcer' },
  { value: '2', text: '2 — deep ulcer to tendon, capsule, or bone' },
  { value: '3', text: '3 — deep ulcer with abscess or osteomyelitis' },
  { value: '4', text: '4 — localized (forefoot/heel) gangrene' },
  { value: '5', text: '5 — gangrene of the whole foot' },
];
const UT_GRADE_OPTS = [
  { value: '0', text: '0 — epithelialized pre/post-ulcerative lesion' },
  { value: '1', text: '1 — superficial (not to tendon, capsule, or bone)' },
  { value: '2', text: '2 — penetrating to tendon or capsule' },
  { value: '3', text: '3 — penetrating to bone or joint' },
];
const UT_STAGE_OPTS = [
  { value: 'A', text: 'A — clean (no infection or ischemia)' },
  { value: 'B', text: 'B — infection' },
  { value: 'C', text: 'C — ischemia' },
  { value: 'D', text: 'D — infection + ischemia' },
];

export const renderers = {
  // ----- 2.2 mipi ------------------------------------------------------------
  mipi(root) {
    note(root, 'Mantle Cell Lymphoma International Prognostic Index (Hoster 2008): 0.03535·age + 0.6978·(ECOG 2–4) + 1.367·log₁₀(LDH/ULN) + 0.9393·log₁₀(WBC per µL). Bands low < 5.7, intermediate 5.7 to < 6.2, high ≥ 6.2. Enter WBC as the absolute count per microliter (e.g. 8000), not thousands. Near-neighbors: nccn-ipi, r-ipi, flipi.');
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

  // ----- 2.3 forrest ---------------------------------------------------------
  forrest(root) {
    note(root, 'Forrest classification (Forrest 1974): the endoscopic stigmata of a bleeding peptic ulcer. Ia/Ib (active bleeding) and IIa (visible vessel) are high-risk stigmata that warrant endoscopic therapy; IIb (adherent clot) is intermediate; IIc (flat spot) and III (clean base) are low-risk. Near-neighbors: rockall, gbs, aims65.');
    root.appendChild(pickField('Endoscopic finding', 'forrest-class', FORREST_OPTS));
    const o = out(); root.appendChild(o);
    wire(['forrest-class'], () => safe(o, () => {
      const r = M.forrest({ klass: val('forrest-class') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Forrest', value: r.klass },
        { label: 'Finding', value: r.bandLabel },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 wagner-dfu ------------------------------------------------------
  'wagner-dfu': function wagnerDfu(root) {
    note(root, 'Wagner (Meggitt-Wagner) diabetic foot ulcer grade (Wagner 1981): depth/extent from grade 0 (intact / at-risk foot) through 1 superficial, 2 deep to tendon/capsule/bone, 3 deep with abscess or osteomyelitis, 4 localized gangrene, 5 whole-foot gangrene. Near-neighbors: wifi, university-texas-dfu.');
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

  // ----- 2.5 university-texas-dfu --------------------------------------------
  'university-texas-dfu': function universityTexasDfu(root) {
    note(root, 'University of Texas diabetic foot ulcer classification (Lavery/Armstrong 1996/1998): a grade × stage grid — grade (depth) 0 epithelialized, 1 superficial, 2 to tendon/capsule, 3 to bone/joint; stage A clean, B infection, C ischemia, D infection + ischemia. Healing odds fall and amputation odds rise as both axes increase. Near-neighbors: wagner-dfu, wifi.');
    root.appendChild(pickField('Grade — wound depth', 'ut-grade', UT_GRADE_OPTS));
    root.appendChild(pickField('Stage — complication', 'ut-stage', UT_STAGE_OPTS));
    const o = out(); root.appendChild(o);
    wire(['ut-grade', 'ut-stage'], () => safe(o, () => {
      const r = M.universityTexasDfu({ grade: val('ut-grade'), stage: val('ut-stage') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'UT cell', value: r.cell },
        { label: 'Grade', value: `${r.grade}` },
        { label: 'Stage', value: r.stage },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
