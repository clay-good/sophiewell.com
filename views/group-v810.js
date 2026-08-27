// spec-v810 §2: renderer for mallampati — the modified Mallampati oropharyngeal view
// (Clinical Scoring & Risk, Group G).
//
// One select, four literal options. Written out one by one rather than looped, because the
// tool-page builder resolves option TEXT only from literal markup.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mallampati-v810.js';
import { resultRow } from '../lib/result-copy.js';

function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  mallampati(root) {
    note(root, 'Patient sitting, head neutral, mouth open as wide as possible, tongue out, not phonating. Choose the view.');

    const wrap = el('p');
    wrap.appendChild(el('label', { for: 'mallampati-class', text: 'What is visible' }));
    wrap.appendChild(el('br'));
    const sel = el('select', { id: 'mallampati-class' });
    sel.appendChild(el('option', { value: '', text: '- choose -' }));
    sel.appendChild(el('option', { value: '1', text: 'Soft palate, fauces, uvula and pillars' }));
    sel.appendChild(el('option', { value: '2', text: 'Soft palate, fauces and uvula' }));
    sel.appendChild(el('option', { value: '3', text: 'Soft palate and base of uvula only' }));
    sel.appendChild(el('option', { value: '4', text: 'Hard palate only' }));
    wrap.appendChild(sel);
    root.appendChild(wrap);

    const o = out(); root.appendChild(o);
    wire(['mallampati-class'], () => safe(o, () => {
      const r = M.mallampati({ mallampatiClass: val('mallampati-class') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'For difficult intubation', value: `sensitivity ${r.sensitivity.toFixed(2)}, specificity ${r.specificity.toFixed(2)}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This records a bedside observation. It does not plan an airway or choose a technique.' }));
  },
};
