// spec-v652 §2: renderer for van-nuys-vnpi — the USC/Van Nuys Prognostic Index for
// DCIS (Clinical Scoring & Risk, Group G). Companion to the built breast-cancer
// grading tiles (nottingham-grade, nottingham-prognostic-index).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three raw
// number inputs (size, margin, age) plus one 1-3 classification select; each factor
// is scored 1-3 and the four scores sum to 4-12 -> low/intermediate/high.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/van-nuys-vnpi-v652.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
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
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The USC/VNPI summarizes local-recurrence risk from the four factors you entered to support the treatment discussion; it is not a treatment order and is read with the full pathology report and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const CLASS_OPTS = [['1', '1 — non-high grade, no necrosis'], ['2', '2 — non-high grade, with necrosis'], ['3', '3 — high grade (nuclear grade 3)']];

export const renderers = {
  'van-nuys-vnpi'(root) {
    note(root, 'USC/Van Nuys Prognostic Index for DCIS (Silverstein 2003, 4-factor update): size + margin width + pathologic classification + age, each scored 1-3, total 4-12. Low (4-6), intermediate (7-9), high (10-12).');
    root.appendChild(numberField('Tumor size (mm)', 'vnpi-size'));
    root.appendChild(numberField('Margin width (mm)', 'vnpi-margin'));
    root.appendChild(selectField('Pathologic classification', 'vnpi-class', CHOICE(CLASS_OPTS)));
    root.appendChild(numberField('Age (years)', 'vnpi-age'));
    const ids = ['vnpi-size', 'vnpi-margin', 'vnpi-class', 'vnpi-age'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.vanNuysVnpi({ size: val('vnpi-size'), margin: val('vnpi-margin'), classification: val('vnpi-class'), age: val('vnpi-age') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/12` },
        { label: 'Risk', value: r.groupLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
