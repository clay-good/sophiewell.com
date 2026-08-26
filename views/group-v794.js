// spec-v794 §2: renderer for furst-ratio — the urine-to-plasma electrolyte ratio
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three lab values
// from a spot urine and a serum sodium; the ratio maps to a published restriction volume.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/furst-ratio-v794.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, opts) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('min', String(opts.min));
  inp.setAttribute('max', String(opts.max));
  inp.setAttribute('step', '0.1');
  inp.setAttribute('inputmode', 'decimal');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This guides how to restrict. It is not a diagnosis of the cause of hyponatremia, not a correction-rate plan, and not a reason to delay treating a symptomatic patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'furst-ratio'(root) {
    note(root, 'Furst formula: urine sodium plus urine potassium, divided by serum sodium, all in mmol/L. Under 0.5 the published starting point is a 1000 mL/day restriction; between 0.5 and 1.0 it is 500 mL/day; above 1.0 no electrolyte-free water is being excreted and restriction alone is unlikely to help.');
    root.appendChild(numberField('Urine sodium (mmol/L)', 'furst-una', { min: 0, max: 400, placeholder: 'e.g. 60' }));
    root.appendChild(numberField('Urine potassium (mmol/L)', 'furst-uk', { min: 0, max: 400, placeholder: 'e.g. 40' }));
    root.appendChild(numberField('Serum sodium (mmol/L)', 'furst-sna', { min: 80, max: 200, placeholder: 'e.g. 125' }));
    const ids = ['furst-una', 'furst-uk', 'furst-sna'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.furstRatio({
        urineSodium: val('furst-una'),
        urinePotassium: val('furst-uk'),
        serumSodium: val('furst-sna'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Ratio', value: r.ratio.toFixed(2) },
        { label: 'Starting point', value: r.advice },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
