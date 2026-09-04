// spec-v1061 §2: renderer for sows (Clinical Scoring & Risk, Group G).
//
// The ten items are SELECTS with a blank first option, not sliders and not number inputs
// defaulting to 0. A slider parked at its minimum looks like a rating somebody made -- that was
// WAT-1's defect for nineteen specs (spec-v1047) -- and this scale is self-report, so an unrated
// symptom is one the patient has not been asked about yet.
//
// The selects are written as `'sw-<key>', S.SOWS_SEVERITY` so that
// scripts/lib/option-labels.mjs, which reads views statically, resolves the option text.

import { el, clear } from '../lib/dom.js';
import * as S from '../lib/sows-v1061.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  sel.appendChild(el('option', { value: '', text: '-- not rated --' }));
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

const FIELD_ID = (key) => `sw-${key}`;

export const renderers = {
  sows(root) {
    for (const item of S.SOWS_ITEMS) selectField(root, item.label, FIELD_ID(item.key), S.SOWS_SEVERITY);

    const ids = S.SOWS_ITEMS.map((i) => FIELD_ID(i.key));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const item of S.SOWS_ITEMS) input[item.key] = val(FIELD_ID(item.key));
      const r = S.sows(input);
      // spec-v1028's rule for this family: below a complete rating there is no total, only what
      // is outstanding. The scale is monotone, so what has been rated is a lower bound.
      if (r.incomplete) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [{ text: r.band }]);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Self-report, not an observation scale, and not interchangeable with COWS. It records what the patient reports; the treatment decision stays with the clinician and the local protocol.' }));
  },
};
