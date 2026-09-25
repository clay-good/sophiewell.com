// spec-v1491: renderer for pufa-index (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as PU from '../lib/pufa-index-v1491.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, placeholder, max, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max, step, inputmode: 'decimal', placeholder }));
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
  'pufa-index'(root) {
    const pairs = [['pufa-P', 'P'], ['pufa-U', 'U'], ['pufa-F', 'F'], ['pufa-A', 'A'], ['pufa-p', 'p'], ['pufa-u', 'u'], ['pufa-f', 'f'], ['pufa-a', 'a']];
    numField(root, 'Permanent teeth with pulp involvement (P)', 'pufa-P', 'e.g. 1', '32', '1');
    numField(root, 'Permanent teeth with ulceration (U)', 'pufa-U', 'e.g. 0', '32', '1');
    numField(root, 'Permanent teeth with a fistula (F)', 'pufa-F', 'e.g. 0', '32', '1');
    numField(root, 'Permanent teeth with an abscess (A)', 'pufa-A', 'e.g. 0', '32', '1');
    numField(root, 'Primary teeth with pulp involvement (p)', 'pufa-p', 'e.g. 2', '20', '1');
    numField(root, 'Primary teeth with ulceration (u)', 'pufa-u', 'e.g. 0', '20', '1');
    numField(root, 'Primary teeth with a fistula (f)', 'pufa-f', 'e.g. 1', '20', '1');
    numField(root, 'Primary teeth with an abscess (a)', 'pufa-a', 'e.g. 0', '20', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PU.pufaIndex(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'PUFA', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
