// spec-v1430: renderer for sdsg-spondylolisthesis (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as SD from '../lib/sdsg-spondylolisthesis-v1430.js';
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
function numField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min: '0', inputmode: 'decimal' }));
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

const NA = '-- not entered --';

export const renderers = {
  'sdsg-spondylolisthesis'(root) {
    note(root, 'From standing lateral radiographs of the spine and pelvis, for an L5-S1 developmental slip.');
    numField(root, 'Slip of L5 on S1 (%)', 'sdsg-slip');
    numField(root, 'Pelvic incidence (degrees, needed for a slip of 50% or less)', 'sdsg-pi');
    selectField(root, 'Sacropelvic balance (needed for a slip over 50%)', 'sdsg-sacro', SD.SDSG_SACROPELVIC, NA);
    selectField(root, 'C7 plumb line (needed for an unbalanced pelvis)', 'sdsg-plumb', SD.SDSG_PLUMB, NA);
    const ids = ['sdsg-slip', 'sdsg-pi', 'sdsg-sacro', 'sdsg-plumb'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = SD.sdsgSpondylolisthesis({ slip: val('sdsg-slip'), pi: val('sdsg-pi'), sacropelvic: val('sdsg-sacro'), plumb: val('sdsg-plumb') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'SDSG type', value: r.bandLabel },
        { label: 'Slip grade', value: r.grade === 'low' ? 'Low grade (50% or less)' : 'High grade (over 50%)' },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
