// spec-v1475: renderer for mrecist (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as MR from '../lib/mrecist-v1475.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: '0.1', min: '0', max: '10000', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
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
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  mrecist(root) {
    numField(root, 'Baseline sum of viable (arterially enhancing) target-lesion diameters (mm)', 'mr-baseline', 'e.g. 60');
    numField(root, 'Current sum of viable target-lesion diameters (mm)', 'mr-current', 'e.g. 38');
    numField(root, 'Smallest sum since treatment started, the nadir (mm)', 'mr-nadir', 'e.g. 60');
    checkField(root, 'A new lesion with the typical HCC pattern (arterial enhancement, then washout)', 'mr-new');
    checkField(root, 'Unequivocal progression of non-target lesions', 'mr-nontarget');
    const ids = ['mr-baseline', 'mr-current', 'mr-nadir', 'mr-new', 'mr-nontarget'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = MR.mrecist({
        baseline: val('mr-baseline'), current: val('mr-current'), nadir: val('mr-nadir'),
        newLesion: chk('mr-new'), nonTarget: chk('mr-nontarget'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'mRECIST', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
