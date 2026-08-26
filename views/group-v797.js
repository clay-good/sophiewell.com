// spec-v797 §2: renderer for nen-who-grade — the WHO 2022 grade for gastroenteropancreatic
// neuroendocrine neoplasms (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two proliferation
// indices, of which the HIGHER decides the grade, plus a differentiation select that
// decides the entity rather than the grade.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nen-who-grade-v797.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function numberField(label, id, opts) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('min', String(opts.min));
  inp.setAttribute('max', String(opts.max));
  inp.setAttribute('step', opts.step);
  inp.setAttribute('inputmode', opts.step === '1' ? 'numeric' : 'decimal');
  inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reads numbers a pathologist has already reported. It does not examine tissue and it does not decide treatment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const DIFFERENTIATION = [
  { value: 'well', text: 'Well differentiated (a neuroendocrine tumor, graded below)' },
  { value: 'poor', text: 'Poorly differentiated (a neuroendocrine carcinoma, high grade by definition)' },
];

export const renderers = {
  'nen-who-grade'(root) {
    note(root, 'WHO 2022 grading: the HIGHER of the two proliferation indices decides the grade, so a Ki-67 of 25 percent with a single mitosis is still G3. Differentiation is a separate axis and decides the entity, not the grade.');
    root.appendChild(selectField('Differentiation', 'nen-diff', DIFFERENTIATION));
    root.appendChild(numberField('Ki-67 index (%)', 'nen-ki67', { min: 0, max: 100, step: '0.1', placeholder: 'e.g. 25' }));
    root.appendChild(numberField('Mitotic count (per 2 mm squared)', 'nen-mitoses', { min: 0, max: 500, step: '1', placeholder: 'e.g. 1' }));
    const ids = ['nen-diff', 'nen-ki67', 'nen-mitoses'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.nenWhoGrade({
        differentiation: val('nen-diff'),
        ki67: val('nen-ki67'),
        mitoses: val('nen-mitoses'),
      });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Entity', value: r.entity },
      ];
      if (r.ki67Grade !== null) rows.push({ label: 'By Ki-67 alone', value: `G${r.ki67Grade}` });
      if (r.mitoticGrade !== null) rows.push({ label: 'By mitoses alone', value: `G${r.mitoticGrade}` });
      resultRow(o, rows);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
