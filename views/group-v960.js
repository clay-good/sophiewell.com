// spec-v960 §2: renderer for tici (Clinical Scoring & Risk, Group G).
//
// The disagreement line prints on every result, not only when the two scales part, because a
// reader needs to know the scales agreed here as much as they need to know when they did not.
//
// The select is written as `'tici-reperf', T.REPERFUSION_OPTIONS` so that
// scripts/lib/option-labels.mjs, which reads views statically, resolves the option text.

import { el, clear } from '../lib/dom.js';
import * as T from '../lib/tici-v960.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
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
  tici(root) {
    selectField(root, 'Reperfusion of the previously occluded territory on the final angiogram', 'tici-reperf', T.REPERFUSION_OPTIONS);

    const o = out(); root.appendChild(o);
    wire(['tici-reperf'], () => safe(o, () => {
      const r = T.ticiGrade({ reperfusion: val('tici-reperf') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.disagreementNote);
      note(o, r.successNote);
      note(o, r.outcomeNote);
      note(o, r.completeNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This grades a final angiogram someone has already read. It says what was achieved, not what to do next.' }));
  },
};
