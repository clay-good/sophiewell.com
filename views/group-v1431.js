// spec-v1431: renderer for watson-slac (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as WS from '../lib/watson-slac-v1431.js';
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

const NA = '-- not entered --';

export const renderers = {
  'watson-slac'(root) {
    note(root, 'From the wrist radiographs of a scapholunate advanced collapse (SLAC) pattern.');
    selectField(root, 'Radioscaphoid joint', 'wslac-rs', WS.WSLAC_RADIOSCAPHOID, NA);
    selectField(root, 'Capitolunate joint', 'wslac-cl', WS.WSLAC_YESNO, NA);
    selectField(root, 'Radiolunate joint', 'wslac-rl', WS.WSLAC_YESNO, NA);
    const ids = ['wslac-rs', 'wslac-cl', 'wslac-rl'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = WS.watsonSlac({ radioscaphoid: val('wslac-rs'), capitolunate: val('wslac-cl'), radiolunate: val('wslac-rl') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'SLAC stage', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
