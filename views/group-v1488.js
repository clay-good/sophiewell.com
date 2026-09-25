// spec-v1488: renderer for nordland-tarnow-papilla (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as NT from '../lib/nordland-tarnow-papilla-v1488.js';
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
  'nordland-tarnow-papilla'(root) {
    const pairs = [['nt-space', 'space'], ['nt-intercej', 'interproximalCej'], ['nt-facial', 'facialCej']];
    selectField(root, 'Is there a space between the papilla tip and the contact point?', 'nt-space', NT.YES_NO);
    selectField(root, 'Is the interproximal cementoenamel junction visible?', 'nt-intercej', NT.YES_NO);
    selectField(root, 'Is the papilla tip level with or apical to the facial cementoenamel junction?', 'nt-facial', NT.YES_NO);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = NT.nordlandTarnowPapilla(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Class', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
