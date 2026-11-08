// spec-v1717: kdri-kdpi, the Kidney Donor Risk Index and Profile Index from OPTN's April 2026 guide and its 2025
// mapping table. Height and weight carry the US-default unit toggles; the compute receives cm and kg.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import { unitField, unitNumOpt, WEIGHT_UNITS, HEIGHT_UNITS } from '../lib/field-units.js';
import * as K from '../lib/kdri-kdpi-v1717.js';

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
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
const val = (id) => { const n = document.getElementById(id); return n ? n.value : ''; };

export const renderers = {
  'kdri-kdpi'(root) {
    numField(root, 'Donor age (whole years)', 'kdpi-age', 'e.g. 52');
    root.appendChild(unitField('Height', 'kdpi-height', HEIGHT_UNITS, { placeholder: 'e.g. 183' }));
    root.appendChild(unitField('Weight', 'kdpi-weight', WEIGHT_UNITS, { placeholder: 'e.g. 81' }));
    numField(root, 'Serum creatinine (mg/dL)', 'kdpi-cr', 'e.g. 1.7');
    selectField(root, 'History of hypertension', 'kdpi-htn', K.HISTORY_OPTIONS);
    selectField(root, 'History of diabetes', 'kdpi-dm', K.HISTORY_OPTIONS);
    selectField(root, 'Cause of death: cerebrovascular accident (CVA)', 'kdpi-cva', K.YES_NO);
    selectField(root, 'Donation after circulatory death (DCD)', 'kdpi-dcd', K.YES_NO);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const ids = ['kdpi-age', 'kdpi-height', 'kdpi-height-unit', 'kdpi-weight', 'kdpi-weight-unit', 'kdpi-cr', 'kdpi-htn', 'kdpi-dm', 'kdpi-cva', 'kdpi-dcd'];
    const run = () => {
      clear(o);
      try {
        const r = K.kdriKdpi({
          age: val('kdpi-age'), heightCm: unitNumOpt('kdpi-height') ?? '', weightKg: unitNumOpt('kdpi-weight') ?? '', creatinine: val('kdpi-cr'),
          hypertension: val('kdpi-htn'), diabetes: val('kdpi-dm'), cva: val('kdpi-cva'), dcd: val('kdpi-dcd'),
        });
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band }, { label: 'Result', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) { note(o, err.message); }
    };
    for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
};
