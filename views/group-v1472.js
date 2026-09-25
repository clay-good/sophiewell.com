// spec-v1472: renderer for cgm-time-in-range (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as TIR from '../lib/cgm-time-in-range-v1472.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, blankText) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  sel.appendChild(el('option', { value: '', text: blankText }));
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, min, max) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min, max, inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
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

const NA = '— choose —';

export const renderers = {
  'cgm-time-in-range'(root) {
    selectField(root, 'Population', 'tir-pop', TIR.TIR_POPULATIONS, NA);
    numField(root, 'Time below 54 mg/dL (%)', 'tir-vlow', 'e.g. 1', '0', '100');
    numField(root, 'Time from 54 to 69 mg/dL (%)', 'tir-low', 'e.g. 3', '0', '100');
    numField(root, 'Time from 70 to 180 mg/dL (%)', 'tir-in', 'e.g. 65', '0', '100');
    numField(root, 'Time from 181 to 250 mg/dL (%)', 'tir-high', 'e.g. 22', '0', '100');
    numField(root, 'Time above 250 mg/dL (%)', 'tir-vhigh', 'e.g. 9', '0', '100');
    numField(root, 'Glucose variability, %CV (optional)', 'tir-cv', 'e.g. 34', '0', '100');
    numField(root, 'Days worn (optional)', 'tir-days', 'e.g. 14', '1', '90');
    numField(root, 'Time the CGM was active, % (optional)', 'tir-active', 'e.g. 85', '1', '100');
    const ids = ['tir-pop', 'tir-vlow', 'tir-low', 'tir-in', 'tir-high', 'tir-vhigh', 'tir-cv', 'tir-days', 'tir-active'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = TIR.cgmTimeInRange({
        pop: val('tir-pop'), vlow: val('tir-vlow'), low: val('tir-low'), tir: val('tir-in'),
        high: val('tir-high'), vhigh: val('tir-vhigh'), cv: val('tir-cv'), days: val('tir-days'), active: val('tir-active'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Targets', value: r.bandLabel },
      ]);
      list(o, r.results.map((x) => `${x.met ? 'Met' : 'Not met'}: ${x.metric} ${x.value}% (target ${x.target}).`));
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
