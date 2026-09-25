// spec-v1468: renderer for msu-disc-herniation (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as MS from '../lib/msu-disc-herniation-v1468.js';
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
function numField(root, label, id, placeholder, min, max) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min, max, inputmode: 'decimal', placeholder }));
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
  'msu-disc-herniation'(root) {
    note(root, 'From one T2 axial cut at the level of maximal herniation. The intra-facet line joins the medial margins of the facet joints.');
    selectField(root, 'Size', 'msu-size', MS.MSU_SIZES, NA);
    numField(root, 'Or measure: distance from the posterior disc (or vertebral endplate) to the intra-facet line (mm)', 'msu-dist', 'e.g. 10', '0', '60');
    numField(root, 'How far the herniation extends from that same point (mm)', 'msu-extent', 'e.g. 7', '0', '60');
    selectField(root, 'Location zone (where the herniation intrudes furthest)', 'msu-zone', MS.MSU_ZONES, NA);
    const ids = ['msu-size', 'msu-dist', 'msu-extent', 'msu-zone'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = MS.msuDiscHerniation({ size: val('msu-size'), dist: val('msu-dist'), extent: val('msu-extent'), zone: val('msu-zone') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'MSU type', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
