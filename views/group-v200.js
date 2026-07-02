// spec-v200 §2: renderers for the four critical-care severity, organ-dysfunction,
// and acid-base tiles — OASIS, LODS, delta-gap / delta-ratio, and the APPS score.
// Groups F / G.
//
// The proposed fifth tile (vasoactive-inotropic-score / VIS) was dropped at
// implementation: VIS is already computed by the live `vis` tile
// (lib/clinical-v4.js, spec-v13 §3.6). v200 ships +4, not +5.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// mortality logistics (OASIS, LODS) and the delta-ratio's zero denominator are
// finite-guarded in lib/critcare-severity-v200.js. Per the spec-v50 §3 posture
// note each tile defers the titration / ventilator / fluid / disposition
// decision to the intensivist and the patient (spec-v11 §5.3) — these quantify
// and stratify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/critcare-severity-v200.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal', ...attrs });
}
function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited source’s, computed from the inputs you enter. The vasopressor, ventilator, fluid, and disposition decisions stay with the intensivist and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.1 oasis -----------------------------------------------------------
  oasis(root) {
    note(root, 'OASIS (Johnson 2013): a 10-variable ICU severity score needing no lab panel. Banded per the published grid to 0–75; the total drives predicted in-hospital mortality. A low-input alternative to APACHE II / SAPS II. Near-neighbors: apache2, saps-ii.');
    root.appendChild(num('Pre-ICU length of stay (hours)', 'oasis-preicu', { min: '0' }));
    root.appendChild(num('Age (years)', 'oasis-age', { min: '0' }));
    root.appendChild(num('Glasgow Coma Scale (3–15)', 'oasis-gcs', { min: '3', max: '15' }));
    root.appendChild(num('Heart rate (bpm)', 'oasis-hr', { min: '0' }));
    root.appendChild(num('Mean arterial pressure (mmHg)', 'oasis-map', { min: '0' }));
    root.appendChild(num('Respiratory rate (breaths/min)', 'oasis-rr', { min: '0' }));
    root.appendChild(num('Temperature (°C)', 'oasis-temp', { min: '20', max: '45' }));
    root.appendChild(num('Urine output (mL / 24 h)', 'oasis-urine', { min: '0' }));
    root.appendChild(checkField('On mechanical ventilation (+9)', 'oasis-vent'));
    root.appendChild(checkField('Elective surgical admission (0 pts; leave unchecked for urgent / emergency / medical, +6)', 'oasis-elective'));
    const o = out(); root.appendChild(o);
    const ids = ['oasis-preicu', 'oasis-age', 'oasis-gcs', 'oasis-hr', 'oasis-map', 'oasis-rr', 'oasis-temp', 'oasis-urine', 'oasis-vent', 'oasis-elective'];
    wire(ids, () => safe(o, () => {
      const r = M.oasis({
        preIcuHours: val('oasis-preicu'), age: val('oasis-age'), gcs: val('oasis-gcs'), hr: val('oasis-hr'),
        map: val('oasis-map'), rr: val('oasis-rr'), temp: val('oasis-temp'), urine: val('oasis-urine'),
        mechVent: chk('oasis-vent'), elective: chk('oasis-elective'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'OASIS', value: `${r.score}` }, { label: 'Mortality', value: `${r.mortality}%` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 lods ------------------------------------------------------------
  lods(root) {
    note(root, 'LODS (Le Gall 1996): a six-system organ-dysfunction model. The worst first-24-hour value in each system maps to 0/1/3/5; total 0–22 drives predicted hospital mortality. A calibrated complement to SOFA. Near-neighbors: sofa, oasis.');
    root.appendChild(num('Glasgow Coma Scale (3–15)', 'lods-gcs', { min: '3', max: '15' }));
    root.appendChild(num('Heart rate (bpm)', 'lods-hr', { min: '0' }));
    root.appendChild(num('Systolic BP (mmHg)', 'lods-sbp', { min: '0' }));
    root.appendChild(num('BUN (mg/dL)', 'lods-bun', { min: '0' }));
    root.appendChild(num('Creatinine (mg/dL)', 'lods-creat', { min: '0' }));
    root.appendChild(num('Urine output (L / day)', 'lods-urine', { min: '0' }));
    root.appendChild(num('WBC (×10⁹/L)', 'lods-wbc', { min: '0' }));
    root.appendChild(num('Platelets (×10⁹/L)', 'lods-plt', { min: '0' }));
    root.appendChild(num('Bilirubin (mg/dL)', 'lods-bili', { min: '0' }));
    root.appendChild(checkField('On mechanical ventilation / CPAP', 'lods-vent'));
    root.appendChild(num('PaO₂/FiO₂ ratio (if ventilated)', 'lods-pf', { min: '0' }));
    root.appendChild(checkField('Prothrombin < 25% of standard (> 3 s above control)', 'lods-ptlow'));
    const o = out(); root.appendChild(o);
    const ids = ['lods-gcs', 'lods-hr', 'lods-sbp', 'lods-bun', 'lods-creat', 'lods-urine', 'lods-wbc', 'lods-plt', 'lods-bili', 'lods-vent', 'lods-pf', 'lods-ptlow'];
    wire(ids, () => safe(o, () => {
      const r = M.lods({
        gcs: val('lods-gcs'), hr: val('lods-hr'), sbp: val('lods-sbp'), bun: val('lods-bun'),
        creatinine: val('lods-creat'), urineL: val('lods-urine'), wbc: val('lods-wbc'), platelets: val('lods-plt'),
        bilirubin: val('lods-bili'), mechVent: chk('lods-vent'), pf: val('lods-pf'), ptLow: chk('lods-ptlow'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'LODS', value: `${r.score}` }, { label: 'Mortality', value: `${r.mortality}%` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 delta-gap -------------------------------------------------------
  'delta-gap'(root) {
    note(root, 'Delta gap / delta ratio (Wrenn 1990; Rastegar 2007): flags a mixed metabolic disorder behind a high anion gap. Delta ratio = (AG − normal AG) / (normal HCO₃ − HCO₃). Near-neighbors: anion-gap, corrected-anion-gap, winters.');
    root.appendChild(num('Sodium (mEq/L)', 'dg-na', { min: '0' }));
    root.appendChild(num('Chloride (mEq/L)', 'dg-cl', { min: '0' }));
    root.appendChild(num('Bicarbonate (mEq/L)', 'dg-hco3', { min: '0' }));
    root.appendChild(num('Albumin (g/dL) — optional, for corrected AG', 'dg-alb', { min: '0' }));
    root.appendChild(num('Normal anion gap (default 12)', 'dg-nag', { min: '0' }));
    root.appendChild(num('Normal bicarbonate (default 24)', 'dg-nhco3', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['dg-na', 'dg-cl', 'dg-hco3', 'dg-alb', 'dg-nag', 'dg-nhco3'];
    wire(ids, () => safe(o, () => {
      const r = M.deltaGap({ na: val('dg-na'), cl: val('dg-cl'), hco3: val('dg-hco3'), albumin: val('dg-alb'), normalAg: val('dg-nag'), normalHco3: val('dg-nhco3') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Δ-ratio', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 apps-ards -------------------------------------------------------
  'apps-ards'(root) {
    note(root, 'APPS score (Villar 2016): a simple ARDS outcome stratifier from three bedside variables at 24 h — age, PaO₂/FiO₂, and plateau pressure. Total 3–9; low 3–4, intermediate 5–7, high 8–9. Near-neighbors: berlin-ards, lis-murray.');
    root.appendChild(num('Age (years)', 'apps-age', { min: '0' }));
    root.appendChild(num('PaO₂/FiO₂ ratio (mmHg)', 'apps-pf', { min: '0' }));
    root.appendChild(num('Plateau pressure (cmH₂O)', 'apps-plateau', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['apps-age', 'apps-pf', 'apps-plateau'];
    wire(ids, () => safe(o, () => {
      const r = M.appsArds({ age: val('apps-age'), pf: val('apps-pf'), plateau: val('apps-plateau') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'APPS', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
