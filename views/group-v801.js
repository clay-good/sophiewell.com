// spec-v801 §2: renderer for hpa-glaucoma — Hodapp-Parrish-Anderson visual field staging
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Four readings off
// one visual field; the result names which of them set the grade, because the most severe
// wins and that is easy to miss.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hpa-glaucoma-v801.js';
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
function numberField(label, id, opts) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('min', String(opts.min));
  inp.setAttribute('max', String(opts.max));
  inp.setAttribute('step', opts.step);
  inp.setAttribute('inputmode', opts.step === '1' ? 'numeric' : 'decimal');
  inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This stages a field a clinician has already reviewed for reliability and artifact. It does not read the printout, it says nothing about intraocular pressure or the optic nerve, and it sets no treatment target.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CENTRAL = [
  { value: 'all-above-15', text: 'All central points above 15 dB' },
  { value: 'one-hemifield', text: 'Depressed within 5 degrees, but not in both hemifields' },
  { value: 'both-or-zero', text: 'Depressed in both hemifields within 5 degrees, or any point at 0 dB' },
];

export const renderers = {
  'hpa-glaucoma'(root) {
    note(root, 'Four readings come off one visual field, each giving its own grade, and the MOST SEVERE of them is the overall grade. That is the rule that matters: a field can look early on mean deviation and be severe on its central points.');
    root.appendChild(numberField('Mean deviation (dB, negative)', 'hpa-md', { min: -40, max: 10, step: '0.1', placeholder: 'e.g. -4' }));
    root.appendChild(numberField('Points below the 5 percent level on pattern deviation (%)', 'hpa-pct5', { min: 0, max: 100, step: '1', placeholder: 'e.g. 10' }));
    root.appendChild(numberField('Points below the 1 percent level on pattern deviation (of 76)', 'hpa-count1', { min: 0, max: 76, step: '1', placeholder: 'e.g. 5' }));
    root.appendChild(selectField('Central 5 degrees', 'hpa-central', CENTRAL));
    const ids = ['hpa-md', 'hpa-pct5', 'hpa-count1', 'hpa-central'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.hpaGlaucoma({
        meanDeviation: val('hpa-md'),
        percentBelow5: val('hpa-pct5'),
        countBelow1: val('hpa-count1'),
        central: val('hpa-central'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: r.stage },
      ]);
      note(o, `By criterion: ${r.criteria.map((c) => `${c.name} ${c.grade}`).join(', ')}.`);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
