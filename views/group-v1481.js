// spec-v1481: renderer for bpe-periodontal (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as BP from '../lib/bpe-periodontal-v1481.js';
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
  'bpe-periodontal'(root) {
    selectField(root, 'Upper right sextant', 'bpe-ur', BP.BPE_CODES);
    selectField(root, 'Upper anterior sextant', 'bpe-ua', BP.BPE_CODES);
    selectField(root, 'Upper left sextant', 'bpe-ul', BP.BPE_CODES);
    selectField(root, 'Lower left sextant', 'bpe-ll', BP.BPE_CODES);
    selectField(root, 'Lower anterior sextant', 'bpe-la', BP.BPE_CODES);
    selectField(root, 'Lower right sextant', 'bpe-lr', BP.BPE_CODES);
    checkField(root, 'Furcation involvement in a sextant (*)', 'bpe-furcation');
    const ids = ['bpe-ur', 'bpe-ua', 'bpe-ul', 'bpe-ll', 'bpe-la', 'bpe-lr', 'bpe-furcation'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = BP.bpePeriodontal({
        ur: val('bpe-ur'), ua: val('bpe-ua'), ul: val('bpe-ul'), ll: val('bpe-ll'), la: val('bpe-la'), lr: val('bpe-lr'),
        furcation: chk('bpe-furcation'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'BPE', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
