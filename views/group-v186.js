// spec-v186 §2: renderers for the six advanced specialty computations — BED/EQD2,
// PISA EROA, LV wall stress, Hb-corrected DLCO, VO₂max/METs, and the Wilson-score
// proportion CI. All Clinical Math & Conversions (Group E).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Every
// division / square-root / α–β denominator is guarded in
// lib/specialtymath-v186.js (a blank / non-finite / zero-denominator input
// renders a surfaced complete-the-fields fallback, never NaN / Infinity). Per
// the spec-v50 §3 posture note each tile defers the plan / decision to the
// clinician (spec-v11 §5.3) — no radiotherapy dose, valve-intervention, or
// exercise prescription in Sophie's voice.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/specialtymath-v186.js';
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
function num(label, id) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal' });
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The value and its interpretation are the cited source’s, computed from the inputs you enter. The plan — radiotherapy dose, valve-intervention decision, or exercise prescription — stays with the treating clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SEX_OPTS = [
  { value: 'male', text: 'Male' },
  { value: 'female', text: 'Female' },
];
const VO2_METHOD_OPTS = [
  { value: 'bruce', text: 'Bruce treadmill (time to exhaustion)' },
  { value: 'cooper', text: 'Cooper 12-minute run (distance)' },
];
const LEVEL_OPTS = [
  { value: '90', text: '90%' },
  { value: '95', text: '95%' },
  { value: '99', text: '99%' },
];

export const renderers = {
  // ----- 2.1 bed-eqd2 --------------------------------------------------------
  'bed-eqd2'(root) {
    note(root, 'Radiotherapy BED & EQD2 (Fowler 1989, linear-quadratic): BED = n·d·(1 + d/(α/β)); EQD2 = BED/(1 + 2/(α/β)). α/β ≈ 10 tumor / early tissue, 3 late normal tissue. Compares schedules on an equal-effect basis. Near-neighbors: none.');
    root.appendChild(num('Number of fractions', 'bed-n'));
    root.appendChild(num('Dose per fraction (Gy)', 'bed-d'));
    root.appendChild(num('α/β ratio (Gy) — 10 tumor, 3 late tissue', 'bed-ab'));
    const o = out(); root.appendChild(o);
    wire(['bed-n', 'bed-d', 'bed-ab'], () => safe(o, () => {
      const r = M.bedEqd2({ n: val('bed-n'), d: val('bed-d'), ab: val('bed-ab') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'BED', value: `${r.bed} Gy` },
        { label: 'EQD2', value: `${r.eqd2} Gy` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 pisa-eroa -------------------------------------------------------
  'pisa-eroa'(root) {
    note(root, 'PISA effective regurgitant orifice & regurgitant volume (ASE, Zoghbi 2017): flow = 2π·r²·Va; EROA = flow/peak Vreg; RVol = EROA·VTIreg. Mitral EROA severe ≥ 0.40 cm². Near-neighbors: lvot-stroke-volume, aortic-valve-area.');
    root.appendChild(num('PISA radius (cm)', 'pisa-r'));
    root.appendChild(num('Aliasing velocity Va (cm/s)', 'pisa-va'));
    root.appendChild(num('Peak regurgitant velocity (cm/s)', 'pisa-vpeak'));
    root.appendChild(num('Regurgitant-jet VTI (cm)', 'pisa-vti'));
    const o = out(); root.appendChild(o);
    wire(['pisa-r', 'pisa-va', 'pisa-vpeak', 'pisa-vti'], () => safe(o, () => {
      const r = M.pisaEroa({ r: val('pisa-r'), va: val('pisa-va'), vpeak: val('pisa-vpeak'), vti: val('pisa-vti') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'EROA', value: `${r.eroa} cm²` },
        { label: 'Regurgitant volume', value: `${r.rvol} mL` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 lv-wall-stress --------------------------------------------------
  'lv-wall-stress'(root) {
    note(root, 'LV meridional wall stress (Grossman 1975; Laplace): σ = P·r/(2·h); with 1 mmHg = 1.36 g/cm². Relates pressure and cavity size to afterload and the hypertrophy pattern. Near-neighbors: lv-mass-index, teichholz-lvef.');
    root.appendChild(num('LV pressure (mmHg) — systolic or end-systolic', 'lvws-p'));
    root.appendChild(num('LV internal radius (cm)', 'lvws-r'));
    root.appendChild(num('Wall thickness (cm)', 'lvws-h'));
    const o = out(); root.appendChild(o);
    wire(['lvws-p', 'lvws-r', 'lvws-h'], () => safe(o, () => {
      const r = M.lvWallStress({ p: val('lvws-p'), r: val('lvws-r'), h: val('lvws-h') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Wall stress', value: `${r.gcm2} g/cm²` },
        { label: 'Wall stress', value: `${r.dyn} ×10³ dyn/cm²` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 dlco-correction -------------------------------------------------
  'dlco-correction'(root) {
    note(root, 'Hemoglobin-corrected DLCO (Cotes; ATS/ERS 2005): Hb-adjusted DLCO = observed·(10.22 + Hb)/(1.7·Hb) men, ·(9.38 + Hb)/(1.7·Hb) women/children; KCO = DLCO/VA. Anemia falsely lowers, polycythemia falsely raises. Near-neighbors: predicted-spirometry.');
    root.appendChild(num('Measured DLCO (mL/min/mmHg)', 'dlco-dlco'));
    root.appendChild(num('Hemoglobin (g/dL)', 'dlco-hb'));
    root.appendChild(num('Alveolar volume VA (L)', 'dlco-va'));
    root.appendChild(pickField('Sex', 'dlco-sex', SEX_OPTS));
    const o = out(); root.appendChild(o);
    wire(['dlco-dlco', 'dlco-hb', 'dlco-va', 'dlco-sex'], () => safe(o, () => {
      const r = M.dlcoCorrection({ dlco: val('dlco-dlco'), hb: val('dlco-hb'), va: val('dlco-va'), sex: val('dlco-sex') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Hb-corrected DLCO', value: `${r.corrected} mL/min/mmHg` },
        { label: 'KCO', value: `${r.kco}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 vo2max-exercise -------------------------------------------------
  'vo2max-exercise'(root) {
    note(root, 'Estimated VO₂max & METs (Bruce 1973 / Cooper 1968). Bruce: men 14.76 − 1.379·T + 0.451·T² − 0.012·T³, women 4.38·T − 3.9 (T = min). Cooper: (distance_m − 504.9)/44.73. METs = VO₂max/3.5. Near-neighbors: duke-treadmill.');
    root.appendChild(selectField('Method', 'vo2-method', VO2_METHOD_OPTS));
    root.appendChild(num('Treadmill time to exhaustion (min) — Bruce', 'vo2-time'));
    root.appendChild(pickField('Sex — Bruce', 'vo2-sex', SEX_OPTS));
    root.appendChild(num('12-minute distance (m) — Cooper', 'vo2-distance'));
    const o = out(); root.appendChild(o);
    wire(['vo2-method', 'vo2-time', 'vo2-sex', 'vo2-distance'], () => safe(o, () => {
      const r = M.vo2maxExercise({ method: val('vo2-method'), time: val('vo2-time'), sex: val('vo2-sex'), distance: val('vo2-distance') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'VO₂max', value: `${r.vo2max} mL/kg/min` },
        { label: 'METs', value: `${r.mets}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 proportion-ci ---------------------------------------------------
  'proportion-ci'(root) {
    note(root, 'Confidence interval for a proportion (Wilson score, 1927): the interval stays within [0, 1] and behaves well near 0/1, unlike the naive Wald interval (shown for teaching). Near-neighbors: diagnostic-2x2, nnt-arr.');
    root.appendChild(field('Number of events', 'prop-events', { type: 'number', min: '0', step: '1', inputmode: 'numeric' }));
    root.appendChild(field('Sample size n', 'prop-n', { type: 'number', min: '1', step: '1', inputmode: 'numeric' }));
    root.appendChild(selectField('Confidence level', 'prop-level', LEVEL_OPTS));
    const o = out(); root.appendChild(o);
    wire(['prop-events', 'prop-n', 'prop-level'], () => safe(o, () => {
      const r = M.proportionCi({ events: val('prop-events'), n: val('prop-n'), level: val('prop-level') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Proportion', value: `${r.proportion} %` },
        { label: `${r.level}% CI`, value: `${r.ciLow}–${r.ciHigh} %` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
