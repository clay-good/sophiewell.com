// spec-v1449: renderer for collin-rc (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as CO from '../lib/collin-rc-v1449.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, blankText) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  sel.appendChild(el('option', { value: '', text: blankText }));
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
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

const NA = '-- not assessed --';

export const renderers = {
  'collin-rc'(root) {
    note(root, 'For a massive rotator cuff tear: mark each of the five components torn or intact.');
    selectField(root, 'Supraspinatus', 'col-ssp', CO.COLLIN_YES_NO, NA);
    selectField(root, 'Superior subscapularis', 'col-ssc', CO.COLLIN_YES_NO, NA);
    selectField(root, 'Inferior subscapularis', 'col-isc', CO.COLLIN_YES_NO, NA);
    selectField(root, 'Infraspinatus', 'col-isp', CO.COLLIN_YES_NO, NA);
    selectField(root, 'Teres minor', 'col-tm', CO.COLLIN_YES_NO, NA);
    const ids = ['col-ssp', 'col-ssc', 'col-isc', 'col-isp', 'col-tm'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = CO.collinRc({ ssp: val('col-ssp'), ssc: val('col-ssc'), isc: val('col-isc'), isp: val('col-isp'), tm: val('col-tm') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Collin type', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
