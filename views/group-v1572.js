// spec-v1572: renderer for thomazeau-occupation (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as TO from '../lib/thomazeau-occupation-v1572.js';
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
  'thomazeau-occupation'(root) {
    const pairs = [['to-muscle', 'muscle'], ['to-fossa', 'fossa']];
    numField(root, 'Supraspinatus muscle area (cm^2)', 'to-muscle', 'e.g. 3.1', '100', '0.01');
    numField(root, 'Supraspinatus fossa area (cm^2)', 'to-fossa', 'e.g. 6.2', '100', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = TO.thomazeauOccupation(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Grade', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
