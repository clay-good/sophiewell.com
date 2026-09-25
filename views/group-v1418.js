// spec-v1418: renderer for paprosky-acetabular (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as PA from '../lib/paprosky-acetabular-v1418.js';
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

const NA = '-- not entered --';

export const renderers = {
  'paprosky-acetabular'(root) {
    note(root, 'From the AP pelvis radiograph before revision.');
    selectField(root, 'Hip center migration', 'pap-migration', PA.PAP_MIGRATION, NA);
    selectField(root, 'Direction of migration', 'pap-direction', PA.PAP_DIRECTION, NA);
    selectField(root, 'Kohler line (anterior column)', 'pap-kohler', PA.PAP_KOHLER, NA);
    selectField(root, 'Teardrop (medial wall, optional)', 'pap-teardrop', PA.PAP_LYSIS, NA);
    selectField(root, 'Ischium (posterior column, optional)', 'pap-ischium', PA.PAP_LYSIS, NA);
    const ids = ['pap-migration', 'pap-direction', 'pap-kohler', 'pap-teardrop', 'pap-ischium'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = PA.paproskyAcetabular({ migration: val('pap-migration'), direction: val('pap-direction'), kohler: val('pap-kohler'), teardrop: val('pap-teardrop'), ischium: val('pap-ischium') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Paprosky type', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
