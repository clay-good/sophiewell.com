// spec-v680 §2: renderer for kobayashi-kawasaki — the Kobayashi score for IVIG
// resistance in Kawasaki disease (Clinical Scoring & Risk, Group G). Companion to egami.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Seven lab/age
// number inputs; a weighted sum 0-11 maps to a low/high resistance-risk band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/kobayashi-kawasaki-v680.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '1', inputmode: 'decimal' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Kobayashi score estimates the risk of IVIG resistance in Kawasaki disease from pre-treatment values; a score of 4 or more flags high risk. Discrimination is lower in Western and infant cohorts. It supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'kobayashi-kawasaki'(root) {
    note(root, 'Kobayashi score (Kobayashi 2006): predicts resistance to IVIG in Kawasaki disease from pre-treatment values. Sodium ≤ 133 (2), treatment by day 4 (2), AST ≥ 100 (2), neutrophils ≥ 80% (2), CRP ≥ 10 (1), age ≤ 12 months (1), platelets ≤ 300 ×10³/µL (1). Total 0–11; a score ≥ 4 is high risk.');
    root.appendChild(numberField('Serum sodium (mmol/L)', 'kob-na', '1'));
    root.appendChild(numberField('Day of illness at start of treatment', 'kob-day', '1'));
    root.appendChild(numberField('AST (IU/L)', 'kob-ast', '1'));
    root.appendChild(numberField('Neutrophil percentage (%)', 'kob-neut', '1'));
    root.appendChild(numberField('CRP (mg/dL)', 'kob-crp', '0.1'));
    root.appendChild(numberField('Age (months)', 'kob-age', '1'));
    root.appendChild(numberField('Platelet count (×10³/µL, e.g. 250)', 'kob-plt', '1'));
    const ids = ['kob-na', 'kob-day', 'kob-ast', 'kob-neut', 'kob-crp', 'kob-age', 'kob-plt'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.kobayashiKawasaki({
        sodium: val('kob-na'), illnessDay: val('kob-day'), ast: val('kob-ast'), neutrophil: val('kob-neut'),
        crp: val('kob-crp'), ageMonths: val('kob-age'), platelets: val('kob-plt'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/11` },
        { label: 'Risk', value: r.tier === 'high' ? 'high' : 'low' },
      ]);
      note(o, r.factors.length ? `Points: ${r.factors.join(', ')}.` : 'No risk points (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
