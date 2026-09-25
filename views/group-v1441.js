// spec-v1441: renderer for wellens-criteria (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as WE from '../lib/wellens-criteria-v1441.js';
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
  'wellens-criteria'(root) {
    note(root, 'From a 12-lead tracing already in hand. Answer every finding.');
    selectField(root, 'T waves in V2-V3', 'wel-t', WE.WELLENS_T, NA);
    selectField(root, 'ST segment in V2-V3', 'wel-st', WE.WELLENS_ST, NA);
    selectField(root, 'Precordial Q waves', 'wel-q', WE.WELLENS_YES_NO, NA);
    selectField(root, 'Precordial R-wave progression', 'wel-r', WE.WELLENS_R, NA);
    selectField(root, 'Recent anginal chest pain', 'wel-angina', WE.WELLENS_YES_NO, NA);
    selectField(root, 'Tracing taken while pain-free', 'wel-painfree', WE.WELLENS_YES_NO, NA);
    selectField(root, 'Cardiac markers', 'wel-markers', WE.WELLENS_MARKERS, NA);
    const ids = ['wel-t', 'wel-st', 'wel-q', 'wel-r', 'wel-angina', 'wel-painfree', 'wel-markers'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = WE.wellensCriteria({ tWave: val('wel-t'), st: val('wel-st'), qWaves: val('wel-q'), rProgression: val('wel-r'), angina: val('wel-angina'), painFree: val('wel-painfree'), markers: val('wel-markers') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Wellens', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
