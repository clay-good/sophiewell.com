// spec-v1443: renderer for de-winter-pattern (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as DW from '../lib/de-winter-pattern-v1443.js';
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

const NA = '-- not answered --';

export const renderers = {
  'de-winter-pattern'(root) {
    note(root, 'From a 12-lead tracing already in hand. Answer every finding.');
    selectField(root, 'Upsloping ST depression of more than 1 mm at the J point, precordial leads', 'dw-std', DW.DEWINTER_YES_NO, NA);
    selectField(root, 'Tall, symmetrical precordial T waves', 'dw-tallt', DW.DEWINTER_YES_NO, NA);
    selectField(root, 'Contiguous precordial ST elevation', 'dw-ste', DW.DEWINTER_YES_NO, NA);
    selectField(root, 'ST elevation in aVR', 'dw-avr', DW.DEWINTER_YES_NO, NA);
    const ids = ['dw-std', 'dw-tallt', 'dw-ste', 'dw-avr'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = DW.deWinterPattern({ stDepression: val('dw-std'), tallT: val('dw-tallt'), stElevation: val('dw-ste'), avr: val('dw-avr') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'de Winter', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
