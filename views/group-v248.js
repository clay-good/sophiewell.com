// spec-v248 §2: renderers for the wound-care + infectious-disease scores — the
// ABSI, the SINBAD diabetic-foot-ulcer score, the ATLAS C. difficile score, and the
// INCREMENT-CPE mortality score. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/woundid-v248.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}
const T012 = [['0', '0'], ['1', '1'], ['2', '2']];

export const renderers = {
  'absi-burn'(root) {
    note(root, 'ABSI (Tobiasen 1982): sex + age band + inhalation + full-thickness + %TBSA band. Threat to life 2-3 very low to >= 12 maximum. Near-neighbors: lund-browder, burn-fluid.');
    root.appendChild(select('Sex', 'absi-sex', [['male', 'Male'], ['female', 'Female']]));
    root.appendChild(numInput('Age (years)', 'absi-age', { min: '0' }));
    root.appendChild(numInput('%TBSA burned', 'absi-tbsa', { min: '0', max: '100' }));
    root.appendChild(check('Inhalation injury', 'absi-inhal'));
    root.appendChild(check('Full-thickness (third-degree) burn', 'absi-ft'));
    const o = out(); root.appendChild(o);
    wire(['absi-sex', 'absi-age', 'absi-tbsa', 'absi-inhal', 'absi-ft'], () => safe(o, () => {
      render(o, M.absiBurn({ sex: val('absi-sex'), age: val('absi-age'), tbsa: val('absi-tbsa'), inhalation: chk('absi-inhal'), fullThickness: chk('absi-ft') }), 'ABSI');
    }));
    postureNote(root);
  },
  'sinbad-score'(root) {
    note(root, 'SINBAD (Ince 2008): 6 diabetic-foot-ulcer features each 0/1, 0-6. >= 3 predicts poorer outcome. Near-neighbors: wagner-dfu, university-texas-dfu.');
    root.appendChild(check('Site: mid- or hindfoot (vs forefoot)', 'sin-site'));
    root.appendChild(check('Ischemia: pedal pulses absent', 'sin-isch'));
    root.appendChild(check('Neuropathy: protective sensation lost', 'sin-neuro'));
    root.appendChild(check('Bacterial infection present', 'sin-inf'));
    root.appendChild(check('Area >= 1 cm^2', 'sin-area'));
    root.appendChild(check('Depth: reaches muscle/tendon/bone', 'sin-depth'));
    const o = out(); root.appendChild(o);
    wire(['sin-site', 'sin-isch', 'sin-neuro', 'sin-inf', 'sin-area', 'sin-depth'], () => safe(o, () => {
      render(o, M.sinbadScore({ site: chk('sin-site'), ischemia: chk('sin-isch'), neuropathy: chk('sin-neuro'), infection: chk('sin-inf'), area: chk('sin-area'), depth: chk('sin-depth') }), 'SINBAD');
    }));
    postureNote(root);
  },
  'atlas-cdi'(root) {
    note(root, 'ATLAS (Miller 2013): age + antibiotics + leukocyte + albumin + creatinine, 0-10. Predicted cure = 100 - 5.08 x score. Near-neighbors: sirs.');
    root.appendChild(select('Age (< 60 = 0, 60-79 = 1, >= 80 = 2)', 'atl-age', T012));
    root.appendChild(select('Systemic antibiotics during CDI therapy', 'atl-abx', [['0', 'No (0)'], ['2', 'Yes (2)']]));
    root.appendChild(select('Leukocyte count (< 16 = 0, 16-25 = 1, > 25 = 2) x10^9/L', 'atl-wbc', T012));
    root.appendChild(select('Albumin (> 35 = 0, 26-35 = 1, <= 25 = 2) g/L', 'atl-alb', T012));
    root.appendChild(select('Serum creatinine (<= 120 = 0, 121-179 = 1, >= 180 = 2) umol/L', 'atl-cr', T012));
    const o = out(); root.appendChild(o);
    wire(['atl-age', 'atl-abx', 'atl-wbc', 'atl-alb', 'atl-cr'], () => safe(o, () => {
      render(o, M.atlasCdi({ age: val('atl-age'), antibiotics: val('atl-abx'), leukocyte: val('atl-wbc'), albumin: val('atl-alb'), creatinine: val('atl-cr') }), 'ATLAS');
    }));
    postureNote(root);
  },
  'increment-cpe'(root) {
    note(root, 'INCREMENT-CPE (Gutierrez-Gutierrez 2017): septic shock 5, Pitt >= 6 →4, Charlson >= 2 →3, non-urinary/biliary source 3. 0-15; >= 8 high risk. Near-neighbors: sirs.');
    root.appendChild(check('Severe sepsis or septic shock at presentation (5)', 'inc-shock'));
    root.appendChild(check('Pitt bacteremia score >= 6 (4)', 'inc-pitt'));
    root.appendChild(check('Charlson comorbidity index >= 2 (3)', 'inc-charl'));
    root.appendChild(check('Source other than urinary/biliary tract (3)', 'inc-src'));
    const o = out(); root.appendChild(o);
    wire(['inc-shock', 'inc-pitt', 'inc-charl', 'inc-src'], () => safe(o, () => {
      render(o, M.incrementCpe({ shock: chk('inc-shock'), pitt: chk('inc-pitt'), charlson: chk('inc-charl'), source: chk('inc-src') }), 'ICS');
    }));
    postureNote(root);
  },
};
