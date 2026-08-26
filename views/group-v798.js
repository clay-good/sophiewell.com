// spec-v798 §2: renderer for rta-type — renal tubular acidosis typing (Clinical Scoring &
// Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The two
// discriminators come first, then the supporting tests under their own heading - the urine
// anion gap is deliberately in the supporting group, not the typing group.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rta-type-v798.js';
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
  inp.setAttribute('step', '0.1');
  inp.setAttribute('inputmode', 'decimal');
  inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies the published typing sequence to results you already have. It does not replace confirmatory testing or the search for the underlying cause.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const POTASSIUM = [
  { value: 'low', text: 'Low' },
  { value: 'normal', text: 'Normal' },
  { value: 'high', text: 'High' },
];

export const renderers = {
  'rta-type'(root) {
    note(root, 'Typing runs in order: a high serum potassium gives type 4; otherwise a urine pH above 5.5 during acidosis gives type 1 and 5.5 or less gives type 2. Type 3 is not offered, being a rare combined form rather than a step in this sequence.');
    root.appendChild(selectField('Serum potassium', 'rta-k', POTASSIUM));
    root.appendChild(numberField('Urine pH during metabolic acidosis', 'rta-ph', { min: 4, max: 9, placeholder: 'e.g. 6.2' }));
    root.appendChild(el('h2', { text: 'Supporting tests (not used to assign the type)' }));
    root.appendChild(numberField('Fractional excretion of bicarbonate during bicarbonate loading (%)', 'rta-fehco3', { min: 0, max: 100, placeholder: 'e.g. 20' }));
    root.appendChild(numberField('Urine anion gap (mEq/L)', 'rta-uag', { min: -100, max: 100, placeholder: 'e.g. 12' }));
    const ids = ['rta-k', 'rta-ph', 'rta-fehco3', 'rta-uag'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.rtaType({
        potassium: val('rta-k'),
        urinePh: val('rta-ph'),
        feHco3: val('rta-fehco3'),
        urineAnionGap: val('rta-uag'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type === null ? 'not yet determined' : `type ${r.type}` },
      ]);
      note(o, r.supporting.length ? `Supporting: ${r.supporting.join('; ')}.` : 'No supporting tests entered.');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
