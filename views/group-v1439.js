// spec-v1439: renderer for uterine-activity (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as UA from '../lib/uterine-activity-v1439.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min: '0', inputmode: 'decimal', placeholder }));
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
  'uterine-activity'(root) {
    note(root, 'Count contractions in each of the last three 10-minute windows. Montevideo units are optional and need an intrauterine pressure catheter.');
    numField(root, 'Contractions, first 10 minutes', 'ua-w1', 'e.g. 4');
    numField(root, 'Contractions, second 10 minutes', 'ua-w2', 'e.g. 5');
    numField(root, 'Contractions, third 10 minutes', 'ua-w3', 'e.g. 4');
    root.appendChild(el('h2', { text: 'Montevideo units (intrauterine pressure catheter, optional)' }));
    numField(root, 'Contractions in one 10-minute window', 'ua-mvu-n', 'e.g. 4');
    numField(root, 'Average peak pressure (mmHg)', 'ua-peak', 'e.g. 65');
    numField(root, 'Baseline tone (mmHg)', 'ua-tone', 'e.g. 15');
    const ids = ['ua-w1', 'ua-w2', 'ua-w3', 'ua-mvu-n', 'ua-peak', 'ua-tone'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = UA.uterineActivity({ w1: val('ua-w1'), w2: val('ua-w2'), w3: val('ua-w3'), mvuCount: val('ua-mvu-n'), peak: val('ua-peak'), tone: val('ua-tone') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Frequency', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
