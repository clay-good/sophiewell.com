// spec-v130 §2: renderers for the six urology tiles (prostate-volume,
// psa-density, psa-velocity, psa-doubling-time, damico-prostate-risk,
// gleason-grade-group). prostate-volume / psa-density / psa-velocity /
// psa-doubling-time home in Clinical Math & Conversions (Group E);
// damico-prostate-risk / gleason-grade-group in Clinical Scoring & Risk
// (Group G). v130 continues Wave 5 of the spec-v100 program, opening the
// prostate-cancer surface.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a
// urologic quantity or risk class, not management (spec-v11 §5.3). Each compute
// surfaces a complete-the-fields fallback rather than a bad number; every
// denominator is guarded in lib/uro-v130.js.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/uro-v130.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The urologic quantity or risk class is the cited instrument’s, computed from the measurements you entered. The diagnosis and the management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

const GLEASON_PATTERN_OPTS = [
  { value: '3', text: 'Pattern 3' },
  { value: '4', text: 'Pattern 4' },
  { value: '5', text: 'Pattern 5' },
];
const DAMICO_STAGE_OPTS = [
  { value: 'T1c', text: 'T1c' },
  { value: 'T2a', text: 'T2a' },
  { value: 'T2b', text: 'T2b' },
  { value: 'T2c', text: 'T2c' },
  { value: 'T3', text: 'T3' },
];

export const renderers = {
  // ----- 2.1 prostate-volume --------------------------------------------
  'prostate-volume'(root) {
    note(root, 'Prostate volume by the prolate-ellipsoid formula (Terris & Stamey 1991): volume = AP × TR × CC × 0.52, all three dimensions in centimeters, volume in cc (= mL). Above ~30 cc is the conventional enlarged (BPH) range; the volume is also the denominator for PSA density.');
    root.appendChild(field('Anteroposterior diameter (cm)', 'pvol-ap', { step: '0.1', min: 0, placeholder: 'e.g. 4.0' }));
    root.appendChild(field('Transverse diameter (cm)', 'pvol-tr', { step: '0.1', min: 0, placeholder: 'e.g. 5.0' }));
    root.appendChild(field('Craniocaudal diameter (cm)', 'pvol-cc', { step: '0.1', min: 0, placeholder: 'e.g. 4.0' }));
    const o = out(); root.appendChild(o);
    wire(['pvol-ap', 'pvol-tr', 'pvol-cc'], () => safe(o, () => {
      const r = M.prostateVolume({ ap: optNum('pvol-ap'), tr: optNum('pvol-tr'), cc: optNum('pvol-cc') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Volume', value: `${r.volume} cc` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 psa-density ------------------------------------------------
  'psa-density'(root) {
    note(root, 'PSA density (Benson 1992): serum PSA (ng/mL) ÷ prostate volume (cc). A density above 0.15 ng/mL/cc raises suspicion for clinically significant cancer and helps refine biopsy decisions in the PSA gray zone.');
    root.appendChild(field('Serum PSA (ng/mL)', 'psad-psa', { step: '0.1', min: 0, placeholder: 'e.g. 6.0' }));
    root.appendChild(field('Prostate volume (cc)', 'psad-vol', { step: '0.1', min: 0, placeholder: 'e.g. 30' }));
    const o = out(); root.appendChild(o);
    wire(['psad-psa', 'psad-vol'], () => safe(o, () => {
      const r = M.psaDensity({ psa: optNum('psad-psa'), volume: optNum('psad-vol') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'PSA density', value: `${r.density} ng/mL/cc` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 psa-velocity -----------------------------------------------
  'psa-velocity'(root) {
    note(root, 'PSA velocity (Carter 1992): the rate of PSA rise. This is the two-point bedside approximation (later − earlier PSA ÷ interval in years); the validated method averages consecutive yearly rates over ≥3 measurements spanning ≥18 months. Above 0.75 ng/mL/yr raises suspicion (≈0.35–0.4 when baseline PSA < 4).');
    root.appendChild(field('Earlier PSA (ng/mL)', 'psav-psa1', { step: '0.1', min: 0, placeholder: 'e.g. 3.0' }));
    root.appendChild(field('Later PSA (ng/mL)', 'psav-psa2', { step: '0.1', min: 0, placeholder: 'e.g. 4.5' }));
    root.appendChild(field('Interval (months)', 'psav-mo', { step: '1', min: 0, placeholder: 'e.g. 12' }));
    const o = out(); root.appendChild(o);
    wire(['psav-psa1', 'psav-psa2', 'psav-mo'], () => safe(o, () => {
      const r = M.psaVelocity({ psa1: optNum('psav-psa1'), psa2: optNum('psav-psa2'), months: optNum('psav-mo') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'PSA velocity', value: `${r.velocity > 0 ? '+' : ''}${r.velocity} ng/mL/yr` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 psa-doubling-time ------------------------------------------
  'psa-doubling-time'(root) {
    note(root, 'PSA doubling time (Pound 1999): PSADT = ln(2) × T ÷ (ln(later PSA) − ln(earlier PSA)), T in months. Requires a rising PSA. Under ~12 months signals more aggressive disease; under ~3 months very aggressive.');
    root.appendChild(field('Earlier PSA (ng/mL)', 'psadt-psa1', { step: '0.1', min: 0, placeholder: 'e.g. 4.0' }));
    root.appendChild(field('Later PSA (ng/mL)', 'psadt-psa2', { step: '0.1', min: 0, placeholder: 'e.g. 8.0' }));
    root.appendChild(field('Interval (months)', 'psadt-mo', { step: '1', min: 0, placeholder: 'e.g. 6' }));
    const o = out(); root.appendChild(o);
    wire(['psadt-psa1', 'psadt-psa2', 'psadt-mo'], () => safe(o, () => {
      const r = M.psaDoublingTime({ psa1: optNum('psadt-psa1'), psa2: optNum('psadt-psa2'), months: optNum('psadt-mo') });
      if (!r.valid) { showInvalid(o, r); return; }
      const rows = [{ text: r.band, cls: r.abnormal ? 'warn' : null }];
      if (r.rising) rows.push({ label: 'Doubling time', value: `${r.dt} months` });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 damico-prostate-risk ---------------------------------------
  'damico-prostate-risk'(root) {
    note(root, 'D’Amico risk classification (D’Amico 1998): biochemical-recurrence risk after definitive local therapy from clinical T stage, PSA, and Gleason score. The worst single feature governs. Low = ≤T2a AND PSA ≤10 AND Gleason ≤6; Intermediate = T2b OR PSA >10–20 OR Gleason 7; High = ≥T2c OR PSA >20 OR Gleason ≥8.');
    root.appendChild(field('Serum PSA (ng/mL)', 'dam-psa', { step: '0.1', min: 0, placeholder: 'e.g. 6.0' }));
    root.appendChild(field('Gleason score (2–10)', 'dam-gl', { step: '1', min: 2, max: 10, placeholder: 'e.g. 7' }));
    root.appendChild(selectField('Clinical T stage', 'dam-stage', DAMICO_STAGE_OPTS));
    const o = out(); root.appendChild(o);
    wire(['dam-psa', 'dam-gl', 'dam-stage'], () => safe(o, () => {
      const r = M.damicoProstateRisk({ psa: optNum('dam-psa'), gleason: optNum('dam-gl'), stage: selVal('dam-stage') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Risk group', value: r.risk }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 gleason-grade-group ----------------------------------------
  'gleason-grade-group'(root) {
    note(root, 'Gleason Grade Group (Epstein 2016 / ISUP 2014): the primary + secondary Gleason patterns map to a prognostic Grade Group 1–5. GG1 = ≤6; GG2 = 3+4; GG3 = 4+3; GG4 = 8; GG5 = 9–10. The primary pattern governs the 3+4 vs 4+3 split.');
    root.appendChild(selectField('Primary (most common) pattern', 'gl-pri', GLEASON_PATTERN_OPTS));
    root.appendChild(selectField('Secondary pattern', 'gl-sec', GLEASON_PATTERN_OPTS));
    const o = out(); root.appendChild(o);
    wire(['gl-pri', 'gl-sec'], () => safe(o, () => {
      const r = M.gleasonGradeGroup({ primary: Number(selVal('gl-pri')), secondary: Number(selVal('gl-sec')) });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Grade Group', value: `${r.group} of 5` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
