// spec-v1426: renderer for isakos-meniscal (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as IM from '../lib/isakos-meniscal-v1426.js';
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
  'isakos-meniscal'(root) {
    note(root, 'From the arthroscopy. Grade the rim width at the outermost zone the tear reaches.');
    selectField(root, 'Meniscus', 'isk-meniscus', IM.ISK_MENISCUS, NA);
    selectField(root, 'Tear depth', 'isk-depth', IM.ISK_DEPTH, NA);
    selectField(root, 'Rim width', 'isk-rim', IM.ISK_RIM, NA);
    selectField(root, 'Radial location', 'isk-radial', IM.ISK_RADIAL, NA);
    selectField(root, 'Popliteal hiatus (lateral meniscus only)', 'isk-hiatus', IM.ISK_HIATUS, NA);
    selectField(root, 'Tear pattern (predominant)', 'isk-pattern', IM.ISK_PATTERN, NA);
    selectField(root, 'Tissue quality', 'isk-tissue', IM.ISK_TISSUE, NA);
    const ids = ['isk-meniscus', 'isk-depth', 'isk-rim', 'isk-radial', 'isk-hiatus', 'isk-pattern', 'isk-tissue'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = IM.isakosMeniscal({ meniscus: val('isk-meniscus'), depth: val('isk-depth'), rim: val('isk-rim'), radial: val('isk-radial'), hiatus: val('isk-hiatus'), pattern: val('isk-pattern'), tissue: val('isk-tissue') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Summary', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
