// spec-v1634: medication review, medication safety and pharmacovigilance.
// or-rr-to-nnt, disproportionality-2x2, icer-dominance.

import { el, clear } from '../lib/dom.js';
import * as ON from '../lib/or-rr-to-nnt-v1634.js';
import * as DP from '../lib/disproportionality-2x2-v1634.js';
import * as IC from '../lib/icer-dominance-v1634.js';
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
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '3', placeholder }));
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

export const renderers = {
  'or-rr-to-nnt'(root) {
    const pairs = [['orn-measure', 'measure'], ['orn-ratio', 'ratio'], ['orn-risk', 'baselineRisk'], ['orn-lower', 'lower'], ['orn-upper', 'upper']];
    selectField(root, 'Effect measure', 'orn-measure', ON.MEASURES);
    numField(root, 'Odds ratio or relative risk', 'orn-ratio', '');
    numField(root, 'Baseline risk without treatment, %', 'orn-risk', '');
    numField(root, 'Lower 95% confidence limit (optional)', 'orn-lower', '');
    numField(root, 'Upper 95% confidence limit (optional)', 'orn-upper', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(ON.orRrToNnt(args), o);
    }));
  },
  'disproportionality-2x2'(root) {
    const pairs = [['dpr-a', 'a'], ['dpr-b', 'b'], ['dpr-c', 'c'], ['dpr-d', 'd'], ['dpr-monitoring', 'monitoring'], ['dpr-ime', 'ime']];
    numField(root, 'a: reports with the drug and the event', 'dpr-a', '');
    numField(root, 'b: reports with the drug and other events', 'dpr-b', '');
    numField(root, 'c: reports with other drugs and the event', 'dpr-c', '');
    numField(root, 'd: reports with other drugs and other events', 'dpr-d', '');
    selectField(root, 'EU additional monitoring list (optional)', 'dpr-monitoring', DP.MONITORING);
    selectField(root, 'Event on the Important Medical Event list (optional)', 'dpr-ime', DP.IME);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DP.disproportionality2x2(args), o);
    }));
  },
  'icer-dominance'(root) {
    const pairs = [['icd-options', 'options']];
    areaField(root, 'Options, one per line: name, cost, effect (for example QALYs)', 'icd-options', 'Standard care, 5000, 1');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(IC.icerDominance(args), o);
    }));
  },
};
