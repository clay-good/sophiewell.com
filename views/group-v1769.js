// spec-v1769: sample-size-proportion and sample-size-two-groups, the WHO manual's proportion formulas
// (Lwanga and Lemeshow 1991). Each tool has two modes; the fields the chosen mode does not use are hidden, and a
// hidden field's leftover value is not read.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as S from '../lib/sample-size-v1769.js';

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
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
const val = (id) => { const n = document.getElementById(id); return n ? n.value : ''; };
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function show(o, r) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}

export const renderers = {
  'sample-size-proportion'(root) {
    selectField(root, 'Precision wanted', 'ssp-mode', S.PRECISION_MODES);
    numField(root, 'Anticipated proportion (%)', 'ssp-p', 'e.g. 20');
    selectField(root, 'Confidence level', 'ssp-conf', S.CONFIDENCE_OPTIONS);
    const abs = numField(root, 'Absolute precision (percentage points either side)', 'ssp-d', 'e.g. 5');
    const rel = numField(root, 'Relative precision (% of the proportion)', 'ssp-eps', 'e.g. 10');
    numField(root, 'Design effect (optional; blank is simple random sampling)', 'ssp-deff', 'e.g. 2');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    wire(['ssp-mode', 'ssp-p', 'ssp-conf', 'ssp-d', 'ssp-eps', 'ssp-deff'], () => {
      clear(o);
      const mode = val('ssp-mode');
      abs.hidden = mode === 'relative';
      rel.hidden = mode === 'absolute';
      try {
        show(o, S.sampleSizeProportion({
          mode, proportion: val('ssp-p'), confidence: val('ssp-conf'),
          precision: mode === 'absolute' ? val('ssp-d') : '',
          relativePrecision: mode === 'relative' ? val('ssp-eps') : '',
          designEffect: val('ssp-deff'),
        }));
      } catch (err) { note(o, err.message); }
    });
  },

  'sample-size-two-groups'(root) {
    selectField(root, 'What the study will do', 'ss2-mode', S.TWO_GROUP_MODES);
    numField(root, 'First group: anticipated proportion (%)', 'ss2-p1', 'e.g. 5');
    numField(root, 'Second group: anticipated proportion (%)', 'ss2-p2', 'e.g. 15');
    const test = [
      numField(root, 'Significance level (%)', 'ss2-alpha', 'e.g. 5'),
      numField(root, 'Power (%)', 'ss2-power', 'e.g. 90'),
      selectField(root, 'Alternative hypothesis', 'ss2-sides', S.SIDES),
    ];
    const diff = [
      selectField(root, 'Confidence level', 'ss2-conf', S.CONFIDENCE_OPTIONS),
      numField(root, 'Absolute precision of the difference (percentage points either side)', 'ss2-d', 'e.g. 5'),
    ];
    numField(root, 'Design effect (optional; blank is simple random sampling)', 'ss2-deff', 'e.g. 2');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    wire(['ss2-mode', 'ss2-p1', 'ss2-p2', 'ss2-alpha', 'ss2-power', 'ss2-sides', 'ss2-conf', 'ss2-d', 'ss2-deff'], () => {
      clear(o);
      const mode = val('ss2-mode');
      for (const w of test) w.hidden = mode === 'difference';
      for (const w of diff) w.hidden = mode === 'test';
      const t = mode === 'test';
      const d = mode === 'difference';
      try {
        show(o, S.sampleSizeTwoGroups({
          mode, p1: val('ss2-p1'), p2: val('ss2-p2'),
          alpha: t ? val('ss2-alpha') : '', power: t ? val('ss2-power') : '', sides: t ? val('ss2-sides') : '',
          confidence: d ? val('ss2-conf') : '', precision: d ? val('ss2-d') : '',
          designEffect: val('ss2-deff'),
        }));
      } catch (err) { note(o, err.message); }
    });
  },
};
