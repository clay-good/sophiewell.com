// spec-v1412: renderer for adult-ett-depth (EMS & Field Medicine, Group I).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import { unitField, unitNumOpt, HEIGHT_UNITS } from '../lib/field-units.js';
import * as ETT from '../lib/adult-ett-depth-v1412.js';
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

export const renderers = {
  'adult-ett-depth'(root) {
    note(root, 'Adult oral tube, read at the corner of the mouth. Enter the sex, the height, or both.');
    selectField(root, 'Sex', 'aed-sex', ETT.ETT_SEXES, '-- not entered --');
    root.appendChild(unitField('Height', 'aed-ht', HEIGHT_UNITS, { placeholder: 'e.g. 170' }));

    const ids = ['aed-sex', 'aed-ht', 'aed-ht-unit'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = ETT.adultEttDepth({ sex: val('aed-sex'), heightCm: unitNumOpt('aed-ht') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Starting depth', value: r.bandLabel },
      ]);
      for (const n of r.notes) note(o, n);
      list(o, r.steps);
      note(o, r.note);
    }));
  },
};
