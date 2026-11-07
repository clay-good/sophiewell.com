// spec-v1699: drug-interaction-kinetics tools 3, 7, 8 and 9.
// ddi-strength-classify, dose-history-level, two-compartment-params, emax-hill-effect.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as DSC from '../lib/ddi-strength-classify-v1699.js';
import * as DHL from '../lib/dose-history-level-v1699.js';
import * as TCP from '../lib/two-compartment-params-v1699.js';
import * as EHE from '../lib/emax-hill-effect-v1699.js';

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
function tool(root, pairs, compute) {
  const o = out(); root.appendChild(o);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    show(compute(args), o);
  }));
}

export const renderers = {
  'ddi-strength-classify'(root) {
    selectField(root, 'Which drug are you classifying?', 'dsc-role', DSC.ROLE_OPTIONS);
    numField(root, 'AUC ratio (with the other drug / without)', 'dsc-ratio', '6.2');
    numField(root, 'Or: AUC with the other drug', 'dsc-with', '');
    numField(root, 'and AUC without it (same units)', 'dsc-without', '');
    checkField(root, 'For a substrate: the other drug was a strong inhibitor of the pathway', 'dsc-strong');
    tool(root, [['dsc-role', 'role'], ['dsc-ratio', 'ratio'], ['dsc-with', 'aucWith'], ['dsc-without', 'aucWithout'], ['dsc-strong', 'strongInhibitor']], DSC.ddiStrengthClassify);
  },
  'dose-history-level'(root) {
    selectField(root, 'Route', 'dhl-route', DHL.ROUTE_OPTIONS);
    areaField(root, 'Doses given, one per line: time, amount in mg (time in hours from the first dose, or YYYY-MM-DD HH:MM)', 'dhl-doses', '0, 1000\n15, 1000');
    numField(root, 'Volume of distribution (L)', 'dhl-vd', '50');
    numField(root, 'Half-life (h)', 'dhl-hl', '12');
    numField(root, 'Or clearance (L/h), in place of the half-life', 'dhl-cl', '');
    numField(root, 'Scheduled dosing interval (h)', 'dhl-tau', '12');
    numField(root, 'IV infusion: duration (h)', 'dhl-tinf', '1');
    numField(root, 'Oral: absorption rate constant ka (per h)', 'dhl-ka', '1');
    numField(root, 'Oral: bioavailability F (0 to 1)', 'dhl-f', '1');
    textField(root, 'Times to evaluate, separated by semicolons (same form as the dose times)', 'dhl-eval', '24');
    tool(root, [['dhl-route', 'route'], ['dhl-doses', 'doses'], ['dhl-vd', 'vd'], ['dhl-hl', 'halfLife'], ['dhl-cl', 'clearance'], ['dhl-tau', 'interval'], ['dhl-tinf', 'infusionHours'], ['dhl-ka', 'ka'], ['dhl-f', 'bioavailability'], ['dhl-eval', 'evalTimes']], DHL.doseHistoryLevel);
  },
  'two-compartment-params'(root) {
    numField(root, 'IV bolus dose (mg)', 'tcp-dose', '150');
    numField(root, 'A, the fast-phase intercept (mg/L)', 'tcp-a', '10');
    numField(root, 'Alpha, the fast-phase rate constant (per h)', 'tcp-alpha', '1');
    numField(root, 'B, the slow-phase intercept (mg/L)', 'tcp-b', '5');
    numField(root, 'Beta, the slow-phase rate constant (per h)', 'tcp-beta', '0.1');
    tool(root, [['tcp-dose', 'dose'], ['tcp-a', 'a'], ['tcp-alpha', 'alpha'], ['tcp-b', 'b'], ['tcp-beta', 'beta']], TCP.twoCompartmentParams);
  },
  'emax-hill-effect'(root) {
    numField(root, 'Baseline effect E0', 'ehe-e0', '0');
    numField(root, 'Emax (negative for an inhibitory effect)', 'ehe-emax', '100');
    numField(root, 'EC50 (any concentration unit)', 'ehe-ec50', '10');
    numField(root, 'Hill coefficient n (1 for the plain Emax model)', 'ehe-n', '1');
    numField(root, 'Concentration, to get its effect', 'ehe-c', '20');
    numField(root, 'Or a target effect, to get the concentration', 'ehe-target', '');
    tool(root, [['ehe-e0', 'e0'], ['ehe-emax', 'emax'], ['ehe-ec50', 'ec50'], ['ehe-n', 'hill'], ['ehe-c', 'concentration'], ['ehe-target', 'targetEffect']], EHE.emaxHillEffect);
  },
};
