// spec-v1062 §2: renderer for sows-subjective (Clinical Scoring & Risk, Group G).
//
// Selects with a blank first option, for the reason spec-v1061 gives: on a self-report scale an
// unrated symptom is one the patient has not been asked about yet, and a control that cannot be
// empty will be read as an answer (spec-v1047).
//
// The selects are written as `'ssw-<key>', S.SOWS_SUBJECTIVE_SEVERITY` so that
// scripts/lib/option-labels.mjs, which reads views statically, resolves the option text.

import { el, clear } from '../lib/dom.js';
import * as S from '../lib/sows-subjective-v1062.js';
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

const FIELD_ID = (key) => `ssw-${key}`;

export const renderers = {
  'sows-subjective'(root) {
    for (const item of S.SOWS_SUBJECTIVE_ITEMS) {
      selectField(root, item.label, FIELD_ID(item.key), S.SOWS_SUBJECTIVE_SEVERITY);
    }

    const ids = S.SOWS_SUBJECTIVE_ITEMS.map((i) => FIELD_ID(i.key));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const item of S.SOWS_SUBJECTIVE_ITEMS) input[item.key] = val(FIELD_ID(item.key));
      const r = S.sowsSubjective(input);
      if (r.incomplete) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [{ text: r.band }]);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Self-report, and not the same instrument as the ten-item Short Opiate Withdrawal Scale that shares the acronym. It records what the patient reports; the treatment decision stays with the clinician and the local protocol.' }));
  },
};
