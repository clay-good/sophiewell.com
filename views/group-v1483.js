// spec-v1483: renderer for ohi-s (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as OH from '../lib/ohi-s-v1483.js';
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
  'ohi-s'(root) {
    root.appendChild(el('h2', { text: 'Debris scores (0 to 3)' }));
    for (const t of OH.OHI_TEETH) selectField(root, `Debris, tooth ${t.label}`, `ohi-d${t.key.slice(1)}`, OH.OHI_SCORES);
    root.appendChild(el('h2', { text: 'Calculus scores (0 to 3)' }));
    for (const t of OH.OHI_TEETH) selectField(root, `Calculus, tooth ${t.label}`, `ohi-c${t.key.slice(1)}`, OH.OHI_SCORES);
    const ids = OH.OHI_TEETH.flatMap((t) => [`ohi-d${t.key.slice(1)}`, `ohi-c${t.key.slice(1)}`]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const t of OH.OHI_TEETH) {
        const k = t.key.slice(1);
        args[`d${k}`] = val(`ohi-d${k}`);
        args[`c${k}`] = val(`ohi-c${k}`);
      }
      const r = OH.ohiS(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'OHI-S', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
