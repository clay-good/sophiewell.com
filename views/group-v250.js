// spec-v250 §2: renderers for the obstetric calculators — the Pearl Index, the
// Robinson-Fleming CRL dating equation, the CARPREG II cardiac-risk score, and the
// Malinas imminent-delivery score. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/obgyn-v250.js';
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
const M012 = (labels) => [['0', labels[0]], ['1', labels[1]], ['2', labels[2]]];

export const renderers = {
  'pearl-index'(root) {
    note(root, 'Pearl Index = (accidental pregnancies x 1200) / woman-months of exposure = failures per 100 woman-years. Lower = more effective. Near-neighbors: due-date.');
    root.appendChild(numInput('Accidental pregnancies', 'pi-preg', { min: '0' }));
    root.appendChild(numInput('Total months of exposure', 'pi-months', { min: '1' }));
    const o = out(); root.appendChild(o);
    wire(['pi-preg', 'pi-months'], () => safe(o, () => {
      render(o, M.pearlIndex({ pregnancies: val('pi-preg'), months: val('pi-months') }), 'Pearl');
    }));
    postureNote(root);
  },
  'robinson-crl-dating'(root) {
    note(root, 'Robinson-Fleming (1975): GA (days) = 8.052 x sqrt(1.037 x CRL) + 23.73. Valid CRL 5-84 mm. Near-neighbors: due-date.');
    root.appendChild(numInput('Crown-rump length (mm)', 'crl-mm', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['crl-mm'], () => safe(o, () => {
      render(o, M.robinsonCrlDating({ crl: val('crl-mm') }), 'GA days');
    }));
    postureNote(root);
  },
  'carpreg-ii'(root) {
    note(root, 'CARPREG II (Silversides 2018): weighted maternal cardiac risk factors. Risk 0-1 = 5% ... > 4 = 41%. Near-neighbors: due-date.');
    root.appendChild(check('Prior cardiac events or arrhythmias (3)', 'cp-events'));
    root.appendChild(check('NYHA III-IV or cyanosis (3)', 'cp-nyha'));
    root.appendChild(check('Mechanical heart valve (3)', 'cp-valve'));
    root.appendChild(check('Systemic ventricular dysfunction (EF < 40%) (2)', 'cp-vent'));
    root.appendChild(check('High-risk left-sided valve / LVOT obstruction (2)', 'cp-left'));
    root.appendChild(check('Pulmonary hypertension (2)', 'cp-ph'));
    root.appendChild(check('High-risk aortopathy (2)', 'cp-aorta'));
    root.appendChild(check('Coronary artery disease (2)', 'cp-cad'));
    root.appendChild(check('No prior cardiac intervention (1)', 'cp-nointerv'));
    root.appendChild(check('Late pregnancy assessment (> 20 wk) (1)', 'cp-late'));
    const o = out(); root.appendChild(o);
    wire(['cp-events', 'cp-nyha', 'cp-valve', 'cp-vent', 'cp-left', 'cp-ph', 'cp-aorta', 'cp-cad', 'cp-nointerv', 'cp-late'], () => safe(o, () => {
      render(o, M.carpregII({ priorEvents: chk('cp-events'), nyha: chk('cp-nyha'), mechanicalValve: chk('cp-valve'), ventricularDysfunction: chk('cp-vent'), leftObstruction: chk('cp-left'), pulmonaryHypertension: chk('cp-ph'), aortopathy: chk('cp-aorta'), coronary: chk('cp-cad'), noPriorIntervention: chk('cp-nointerv'), lateAssessment: chk('cp-late') }), 'CARPREG');
    }));
    postureNote(root);
  },
  'malinas-score'(root) {
    note(root, 'Malinas score: 5 prehospital-labour criteria each 0-2, 0-10. >= 6 delivery likely imminent. Near-neighbors: bishop.');
    root.appendChild(select('Parity', 'mal-par', M012(['1st pregnancy (0)', '2nd (1)', '>= 3rd (2)'])));
    root.appendChild(select('Duration of labour', 'mal-dur', M012(['< 3 h (0)', '3-5 h (1)', '> 6 h (2)'])));
    root.appendChild(select('Contraction duration', 'mal-con', M012(['< 1 min (0)', '1 min (1)', '> 1 min (2)'])));
    root.appendChild(select('Interval between contractions', 'mal-int', M012(['> 5 min (0)', '3-5 min (1)', '< 3 min (2)'])));
    root.appendChild(select('Ruptured membranes', 'mal-mem', M012(['No (0)', 'Recent (1)', '> 1 h ago (2)'])));
    const o = out(); root.appendChild(o);
    wire(['mal-par', 'mal-dur', 'mal-con', 'mal-int', 'mal-mem'], () => safe(o, () => {
      render(o, M.malinasScore({ parity: val('mal-par'), duration: val('mal-dur'), contraction: val('mal-con'), interval: val('mal-int'), membranes: val('mal-mem') }), 'Malinas');
    }));
    postureNote(root);
  },
};
