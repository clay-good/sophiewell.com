// spec-v1438: renderer for ukeld (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import { unitField, unitNumOpt, BILIRUBIN_UNITS } from '../lib/field-units.js';
import * as UK from '../lib/ukeld-v1438.js';
import { resultRow } from '../lib/result-copy.js';

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
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  ukeld(root) {
    note(root, 'Creatinine and bilirubin in mg/dL or umol/L; the score itself is computed in umol/L.');
    numField(root, 'INR', 'uk-inr', 'e.g. 1.5');
    root.appendChild(unitField('Serum creatinine', 'uk-creat', UK.CREATININE_UNITS, { placeholder: 'e.g. 1.2' }));
    root.appendChild(unitField('Total bilirubin', 'uk-bili', BILIRUBIN_UNITS, { placeholder: 'e.g. 3.5' }));
    numField(root, 'Serum sodium (mmol/L)', 'uk-na', 'e.g. 132');
    const ids = ['uk-inr', 'uk-creat', 'uk-creat-unit', 'uk-bili', 'uk-bili-unit', 'uk-na'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = UK.ukeld({ inr: val('uk-inr'), creatinineMgDl: unitNumOpt('uk-creat'), bilirubinMgDl: unitNumOpt('uk-bili'), sodium: val('uk-na') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'UKELD', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
