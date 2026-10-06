// spec-v1553: renderer for who-tb-fdc-dose (WHO first-line TB tablets by weight; Group F); spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as T from '../lib/who-tb-fdc-dose-v1553.js';
import * as M0 from '../lib/who-tpt-dose-v1553.js';
import * as M1 from '../lib/tb-4-month-eligibility-v1553.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, required) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [{ value: '', text: required ? '— choose —' : '— not entered —' }, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, max) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', inputmode: 'decimal', min: '0', max, step: 'any', placeholder }));
  root.appendChild(wrap);
}
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}

export const renderers = {
  'who-tb-fdc-dose'(root) {
    const pairs = [['tb-weight', 'weight'], ['tb-phase', 'phase'], ['tb-regimen', 'regimen'], ['tb-age', 'age']];
    numField(root, 'Weight in kg', 'tb-weight', 'e.g. 10', '250');
    selectField(root, 'Phase', 'tb-phase', T.PHASE_OPTIONS, true);
    selectField(root, 'Regimen (standard if blank)', 'tb-regimen', T.REGIMEN_OPTIONS, false);
    numField(root, 'Age in years (for HPMZ)', 'tb-age', 'e.g. 16', '120');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = T.whoTbFdcDose(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'who-tpt-dose'(root) {
    const pairs = [['tpt-regimen', 'regimen'], ['tpt-weight', 'weight'], ['tpt-age', 'age']];
    selectField(root, 'Regimen', 'tpt-regimen', M0.REGIMEN_OPTIONS, true);
    numField(root, 'Weight in kg', 'tpt-weight', 'e.g. 18', '250');
    numField(root, 'Age in years (for infants, 3 months = 0.25)', 'tpt-age', 'e.g. 5', '120');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.whoTptDose(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2024', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'tb-4-month-eligibility'(root) {
    const pairs = [['t4-age', 'age'], ['t4-weight', 'weight'], ['t4-setting', 'setting'], ['t4-cxr', 'cxr'], ['t4-bact', 'bact'], ['t4-periph', 'periph'], ['t4-signs', 'signs'], ['t4-pneumonia', 'pneumonia'], ['t4-prior', 'prior'], ['t4-dr', 'dr'], ['t4-hiv', 'hiv'], ['t4-highprev', 'highprev']];
    numField(root, 'Age in years (for infants, 3 months = 0.25)', 't4-age', 'e.g. 4', '25');
    numField(root, 'Weight in kg', 't4-weight', 'e.g. 15', '150');
    selectField(root, 'What is available', 't4-setting', M1.SETTING_OPTIONS, true);
    selectField(root, 'Chest X-ray pattern', 't4-cxr', M1.CXR_OPTIONS, false);
    selectField(root, 'Xpert or smear result', 't4-bact', M1.BACT_OPTIONS, false);
    selectField(root, 'Isolated peripheral lymph node TB', 't4-periph', M1.YES_NO, true);
    selectField(root, 'Any danger or high-priority sign, asymmetric persistent wheeze, other extrapulmonary TB, SAM, respiratory distress, fever over 39 °C, severe pallor, restlessness, irritability or lethargy', 't4-signs', M1.YES_NO, true);
    selectField(root, 'Severe acute pneumonia', 't4-pneumonia', M1.YES_NO, true);
    selectField(root, 'TB treated in the past 2 years', 't4-prior', M1.YES_NO, true);
    selectField(root, 'Drug-resistant TB suspected or known', 't4-dr', M1.YES_NO, true);
    selectField(root, 'Living with HIV', 't4-hiv', M1.YES_NO, true);
    selectField(root, 'High HIV or isoniazid-resistance setting', 't4-highprev', M1.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.tb4MonthEligibility(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2022', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
};
