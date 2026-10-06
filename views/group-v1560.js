// spec-v1560: renderer for cholera-rehydration (GTFCC dehydration assessment, rehydration plan, antibiotic
// and zinc in suspected cholera; Medication & Infusion, Group F; spec-v1540).

import { el, clear } from '../lib/dom.js';
import * as C from '../lib/cholera-rehydration-v1560.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— not assessed —' };
function selectField(root, label, id, options, blankText) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [blankText ? { value: '', text: blankText } : NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
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
  'cholera-rehydration'(root) {
    const pairs = [['chol-pop', 'population'], ['chol-age', 'age'], ['chol-weight', 'weight'], ['chol-mental', 'mental'], ['chol-pulse', 'pulse'], ['chol-breathing', 'breathing'], ['chol-eyes', 'eyes'], ['chol-drinking', 'drinking'], ['chol-pinch', 'pinch'], ['chol-sbp', 'sbp'], ['chol-fetal', 'fetal'], ['chol-purging', 'purging'], ['chol-failed', 'failed'], ['chol-hiv', 'hiv']];
    selectField(root, 'Patient group', 'chol-pop', C.POPULATION_OPTIONS, '— choose —');
    numField(root, 'Age in years (decimals for infants, e.g. 0.5)', 'chol-age', 'e.g. 3', '120');
    numField(root, 'Weight in kg (needed for Plans B and C)', 'chol-weight', 'e.g. 14', '250');
    selectField(root, 'Mental state', 'chol-mental', C.SIGNS.mental.options);
    selectField(root, 'Pulse', 'chol-pulse', C.SIGNS.pulse.options);
    selectField(root, 'Breathing', 'chol-breathing', C.SIGNS.breathing.options);
    selectField(root, 'Eyes', 'chol-eyes', C.SIGNS.eyes.options);
    selectField(root, 'Drinking', 'chol-drinking', C.SIGNS.drinking.options);
    selectField(root, 'Skin pinch', 'chol-pinch', C.SIGNS.pinch.options);
    numField(root, 'Systolic blood pressure, mmHg (pregnancy, second or third trimester)', 'chol-sbp', 'e.g. 100', '250');
    selectField(root, 'Fetal heart rate (pregnancy, second or third trimester)', 'chol-fetal', C.SIGNS.fetal.options);
    selectField(root, 'High purging: at least 1 stool an hour over the first 4 hours', 'chol-purging', C.YES_NO);
    selectField(root, 'The first 4 hours of rehydration failed', 'chol-failed', C.YES_NO);
    selectField(root, 'HIV', 'chol-hiv', C.YES_NO);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = C.choleraRehydration(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'GTFCC', value: r.bandLabel }]);
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
