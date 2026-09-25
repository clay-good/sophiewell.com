// spec-v1479: renderer for robinson-clavicle (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as RB from '../lib/robinson-clavicle-v1479.js';
import { resultRow } from '../lib/result-copy.js';

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
  'robinson-clavicle'(root) {
    selectField(root, 'Where the fracture is', 'rob-region', RB.ROB_REGIONS);
    selectField(root, 'Displacement', 'rob-disp', RB.ROB_DISPLACEMENT);
    selectField(root, 'Medial or lateral fifth: joint extension', 'rob-artic', RB.ROB_ARTICULAR);
    selectField(root, 'Shaft, not displaced: undisplaced or angulated', 'rob-shaft-a', RB.ROB_SHAFT_A);
    selectField(root, 'Shaft, displaced: simple or wedge, or segmental', 'rob-shaft-b', RB.ROB_SHAFT_B);
    const ids = ['rob-region', 'rob-disp', 'rob-artic', 'rob-shaft-a', 'rob-shaft-b'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = RB.robinsonClavicle({
        region: val('rob-region'), displacement: val('rob-disp'), articular: val('rob-artic'),
        shaftAligned: val('rob-shaft-a'), shaftDisplaced: val('rob-shaft-b'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Robinson', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
