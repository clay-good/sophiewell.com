// spec-v1444: renderer for kanavel-signs (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as KA from '../lib/kanavel-signs-v1444.js';
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

const NA = '-- not examined --';

export const renderers = {
  'kanavel-signs'(root) {
    note(root, 'Examine the affected finger for each sign.');
    selectField(root, 'Resting flexed posture of the finger', 'kan-flexed', KA.KANAVEL_YES_NO, NA);
    selectField(root, 'Fusiform swelling of the whole finger', 'kan-swelling', KA.KANAVEL_YES_NO, NA);
    selectField(root, 'Tenderness along the flexor tendon sheath', 'kan-tender', KA.KANAVEL_YES_NO, NA);
    selectField(root, 'Pain on passive extension', 'kan-passive', KA.KANAVEL_YES_NO, NA);
    const ids = ['kan-flexed', 'kan-swelling', 'kan-tender', 'kan-passive'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = KA.kanavelSigns({ flexed: val('kan-flexed'), swelling: val('kan-swelling'), tenderness: val('kan-tender'), passive: val('kan-passive') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Kanavel signs', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
