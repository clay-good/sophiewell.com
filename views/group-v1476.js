// spec-v1476: renderer for asas-ibp (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as IB from '../lib/asas-ibp-v1476.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'asas-ibp'(root) {
    checkField(root, 'Back pain for 3 months or more (the criteria apply only to chronic back pain)', 'ibp-chronic');
    checkField(root, 'Age at onset under 40', 'ibp-age');
    checkField(root, 'Insidious onset', 'ibp-insidious');
    checkField(root, 'Improves with exercise', 'ibp-exercise');
    checkField(root, 'Does not improve with rest', 'ibp-rest');
    checkField(root, 'Pain at night, improving on getting up', 'ibp-night');
    const ids = ['ibp-chronic', 'ibp-age', 'ibp-insidious', 'ibp-exercise', 'ibp-rest', 'ibp-night'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = IB.asasIbp({
        chronic: chk('ibp-chronic'), ageUnder40: chk('ibp-age'), insidious: chk('ibp-insidious'),
        exercise: chk('ibp-exercise'), noRestRelief: chk('ibp-rest'), nightPain: chk('ibp-night'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ASAS IBP', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
