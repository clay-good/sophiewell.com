// spec-v1631: clinical pharmacokinetics and therapeutic drug monitoring. Group F.
// pk-steady-state-predict, auc-trapezoid and tmic-beta-lactam.

import { el, clear } from '../lib/dom.js';
import * as PK from '../lib/pk-steady-state-predict-v1631.js';
import * as AT from '../lib/auc-trapezoid-v1631.js';
import * as TM from '../lib/tmic-beta-lactam-v1631.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
  return wrap;
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
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
// One renderer shape for every tool here: read each field, hand the lot to the library, show the result.
function run(root, pairs, compute) {
  const o = out(); root.appendChild(o);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    show(compute(args), o);
  }));
}

export const renderers = {
  'pk-steady-state-predict'(root) {
    numField(root, 'Dose, mg', 'pk-dose', '');
    numField(root, 'Infusion time, hours (0 for a bolus)', 'pk-tinf', '');
    numField(root, 'Dosing interval, hours', 'pk-tau', '');
    numField(root, 'Volume of distribution, L', 'pk-vd', '');
    numField(root, 'Half-life, hours (enter one of these three)', 'pk-half', '');
    numField(root, 'or elimination rate constant, per hour', 'pk-k', '');
    numField(root, 'or clearance, L/hour', 'pk-cl', '');
    numField(root, 'Dose number (optional)', 'pk-n', '');
    numField(root, 'Hours after that dose started (optional)', 'pk-t', '');
    numField(root, 'A level, mg/L (optional)', 'pk-level', '');
    numField(root, 'Target to fall to, mg/L (optional)', 'pk-target', '');
    run(root, [['pk-dose', 'dose'], ['pk-tinf', 'infusionHours'], ['pk-tau', 'interval'], ['pk-vd', 'vd'], ['pk-half', 'halfLife'], ['pk-k', 'k'], ['pk-cl', 'clearance'], ['pk-n', 'doseNumber'], ['pk-t', 'timeAfter'], ['pk-level', 'level'], ['pk-target', 'target']], PK.pkSteadyStatePredict);
  },

  'auc-trapezoid'(root) {
    textareaField(root, 'Samples, one per line: time in hours, then the concentration', 'at-points', '');
    selectField(root, 'Method', 'at-method', AT.METHODS);
    selectField(root, 'Extrapolate to infinity?', 'at-extra', AT.YES_NO);
    numField(root, 'Last samples to fit the terminal slope through (when extrapolating)', 'at-n', '');
    numField(root, 'Dose, for clearance (optional)', 'at-dose', '');
    run(root, [['at-points', 'points'], ['at-method', 'method'], ['at-extra', 'extrapolate'], ['at-n', 'terminalPoints'], ['at-dose', 'dose']], AT.aucTrapezoid);
  },

  'tmic-beta-lactam'(root) {
    numField(root, 'Dose, mg', 'tm-dose', '');
    numField(root, 'Infusion time, hours (0 for a bolus)', 'tm-tinf', '');
    numField(root, 'Dosing interval, hours', 'tm-tau', '');
    numField(root, 'Volume of distribution, L', 'tm-vd', '');
    numField(root, 'Half-life, hours', 'tm-half', '');
    numField(root, 'or elimination rate constant, per hour', 'tm-k', '');
    numField(root, 'Unbound fraction, from 0 to 1', 'tm-fu', '');
    numField(root, 'MIC, mg/L', 'tm-mic', '');
    run(root, [['tm-dose', 'dose'], ['tm-tinf', 'infusionHours'], ['tm-tau', 'interval'], ['tm-vd', 'vd'], ['tm-half', 'halfLife'], ['tm-k', 'k'], ['tm-fu', 'unboundFraction'], ['tm-mic', 'mic']], TM.tmicBetaLactam);
  },
};
