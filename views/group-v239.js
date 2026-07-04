// spec-v239 §2: renderers for the hepatology / GI-surgery scores — the Bonacini
// cirrhosis discriminant score, the Goteborg University Cirrhosis Index, the
// Mannheim Peritonitis Index, and the Boey score. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gisurg-v239.js';
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

export const renderers = {
  'bonacini-cds'(root) {
    note(root, 'Bonacini cirrhosis discriminant score (1997): platelets, ALT/AST ratio, and INR each binned to points (0-11). <= 3 unlikely, >= 8 cirrhosis likely. Near-neighbors: apri, fib4.');
    root.appendChild(numInput('Platelet count (10^3/uL)', 'bon-plt', { min: '0' }));
    root.appendChild(numInput('ALT / AST ratio', 'bon-ratio', { min: '0' }));
    root.appendChild(numInput('INR', 'bon-inr', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['bon-plt', 'bon-ratio', 'bon-inr'], () => safe(o, () => {
      render(o, M.bonaciniCds({ platelet: val('bon-plt'), altAstRatio: val('bon-ratio'), inr: val('bon-inr') }), 'Bonacini');
    }));
    postureNote(root);
  },
  'guci'(root) {
    note(root, 'GUCI (Islam 2005) = (AST / ULN) x INR x 100 / platelets (10^9/L). > 1.0 suggests cirrhosis. Near-neighbors: apri, fib4.');
    root.appendChild(numInput('AST (U/L)', 'guci-ast', { min: '0' }));
    root.appendChild(numInput('AST upper limit of normal (U/L)', 'guci-uln', { min: '0' }));
    root.appendChild(numInput('INR', 'guci-inr', { min: '0' }));
    root.appendChild(numInput('Platelet count (10^9/L)', 'guci-plt', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['guci-ast', 'guci-uln', 'guci-inr', 'guci-plt'], () => safe(o, () => {
      render(o, M.guci({ ast: val('guci-ast'), astUln: val('guci-uln'), inr: val('guci-inr'), platelet: val('guci-plt') }), 'GUCI');
    }));
    postureNote(root);
  },
  'mannheim-peritonitis-index'(root) {
    note(root, 'Mannheim Peritonitis Index (1987): weighted intraoperative factors, 0-47. > 26 marks high mortality risk. Near-neighbors: apache2.');
    root.appendChild(check('Age > 50 years (5)', 'mpi-age'));
    root.appendChild(check('Female sex (5)', 'mpi-female'));
    root.appendChild(check('Organ failure (7)', 'mpi-organ'));
    root.appendChild(check('Malignancy (4)', 'mpi-malig'));
    root.appendChild(check('Preoperative duration > 24 h (4)', 'mpi-dur'));
    root.appendChild(check('Origin of sepsis not colonic (4)', 'mpi-noncolonic'));
    root.appendChild(check('Diffuse generalized peritonitis (6)', 'mpi-diffuse'));
    root.appendChild(select('Exudate', 'mpi-exudate', [['0', 'Clear (0)'], ['6', 'Cloudy / purulent (6)'], ['12', 'Fecal (12)']]));
    const o = out(); root.appendChild(o);
    wire(['mpi-age', 'mpi-female', 'mpi-organ', 'mpi-malig', 'mpi-dur', 'mpi-noncolonic', 'mpi-diffuse', 'mpi-exudate'], () => safe(o, () => {
      render(o, M.mannheimPeritonitisIndex({ ageOver50: chk('mpi-age'), female: chk('mpi-female'), organFailure: chk('mpi-organ'), malignancy: chk('mpi-malig'), duration24: chk('mpi-dur'), nonColonic: chk('mpi-noncolonic'), diffuse: chk('mpi-diffuse'), exudate: val('mpi-exudate') }), 'MPI');
    }));
    postureNote(root);
  },
  'boey-score'(root) {
    note(root, 'Boey score (1987): preoperative shock, perforation > 24 h, significant comorbidity, each 1 point (0-3). Near-neighbors: mannheim-peritonitis-index.');
    root.appendChild(check('Preoperative shock (SBP < 100 mmHg)', 'boey-shock'));
    root.appendChild(check('Perforation present > 24 h', 'boey-delay'));
    root.appendChild(check('Significant medical comorbidity', 'boey-comorb'));
    const o = out(); root.appendChild(o);
    wire(['boey-shock', 'boey-delay', 'boey-comorb'], () => safe(o, () => {
      render(o, M.boeyScore({ shock: chk('boey-shock'), delayed: chk('boey-delay'), comorbidity: chk('boey-comorb') }), 'Boey');
    }));
    postureNote(root);
  },
};
