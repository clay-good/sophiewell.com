// spec-v734 §2: renderer for phq15 — the PHQ-15 somatic symptom severity scale (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Fifteen 0-2
// selects; the sum 0-30 maps to a somatic-symptom-severity band. Neutral symptom labels.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/phq15-v734.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The PHQ-15 is a self-report screen of somatic symptoms; it is not a diagnosis. It supports rather than replaces the clinical evaluation.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const RATE = [{ value: '', text: '— 0-2 —' }, { value: '0', text: '0 (not bothered)' }, { value: '1', text: '1 (bothered a little)' }, { value: '2', text: '2 (bothered a lot)' }];

const ROWS = [
  ['Stomach pain', 'phq15-q1'],
  ['Back pain', 'phq15-q2'],
  ['Pain in arms, legs, or joints', 'phq15-q3'],
  ['Menstrual cramps or other period problems', 'phq15-q4'],
  ['Headaches', 'phq15-q5'],
  ['Chest pain', 'phq15-q6'],
  ['Dizziness', 'phq15-q7'],
  ['Fainting spells', 'phq15-q8'],
  ['Heart pounding or racing', 'phq15-q9'],
  ['Shortness of breath', 'phq15-q10'],
  ['Pain or problems during intercourse', 'phq15-q11'],
  ['Constipation, loose bowels, or diarrhea', 'phq15-q12'],
  ['Nausea, gas, or indigestion', 'phq15-q13'],
  ['Feeling tired or having low energy', 'phq15-q14'],
  ['Trouble sleeping', 'phq15-q15'],
];

export const renderers = {
  'phq15'(root) {
    note(root, 'PHQ-15 (Kroenke 2002): rate how much each of fifteen somatic symptoms bothered you over the past 4 weeks, 0 (not at all) to 2 (a lot). The sum 0-30 gives a somatic symptom severity band (0-4 minimal, 5-9 low, 10-14 medium, 15-30 high).');
    for (const [label, id] of ROWS) root.appendChild(selectField(label, id, RATE));
    const ids = ROWS.map((r) => r[1]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.phq15({ q1: val('phq15-q1'), q2: val('phq15-q2'), q3: val('phq15-q3'), q4: val('phq15-q4'), q5: val('phq15-q5'), q6: val('phq15-q6'), q7: val('phq15-q7'), q8: val('phq15-q8'), q9: val('phq15-q9'), q10: val('phq15-q10'), q11: val('phq15-q11'), q12: val('phq15-q12'), q13: val('phq15-q13'), q14: val('phq15-q14'), q15: val('phq15-q15') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/30` },
        { label: 'Severity', value: r.tier },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
