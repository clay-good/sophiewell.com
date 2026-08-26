// spec-v795 §2: renderer for mis-c — the 2023 MIS-C surveillance case definition
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The five
// involvement categories sit under their own heading so the two-of-five rule is visible,
// and the Kawasaki exclusion is separated from the criteria it overrides.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mis-c-v795.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numberField(label, id, opts) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('min', String(opts.min));
  inp.setAttribute('max', String(opts.max));
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is a surveillance definition, written so that states count cases the same way. It is not a clinical diagnosis and not a treatment threshold, and a child who does not meet it can still be seriously unwell and need treatment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'mis-c'(root) {
    note(root, '2023 surveillance case definition: every criterion is required, including new-onset involvement in at least two of the five categories below and laboratory evidence of SARS-CoV-2 within 60 days.');
    root.appendChild(numberField('Age (years)', 'misc-age', { min: 0, max: 120, placeholder: 'e.g. 8' }));
    root.appendChild(checkField('Fever of 38.0 degrees Celsius or above, documented or reported', 'misc-fever'));
    root.appendChild(numberField('C-reactive protein (mg/dL)', 'misc-crp', { min: 0, max: 100, step: '0.1', placeholder: 'e.g. 12' }));
    root.appendChild(el('h2', { text: 'New-onset involvement (at least two required)' }));
    root.appendChild(checkField('Cardiac', 'misc-cardiac'));
    root.appendChild(checkField('Mucocutaneous', 'misc-mucocutaneous'));
    root.appendChild(checkField('Shock', 'misc-shock'));
    root.appendChild(checkField('Gastrointestinal', 'misc-gi'));
    root.appendChild(checkField('Hematologic', 'misc-heme'));
    root.appendChild(el('h2', { text: 'Laboratory evidence' }));
    root.appendChild(checkField('SARS-CoV-2 detected by RNA, antigen or antibody within 60 days before or during admission', 'misc-sars'));
    root.appendChild(el('h2', { text: 'Alternative diagnosis' }));
    root.appendChild(checkField('The treating team has made a final diagnosis of Kawasaki disease', 'misc-kawasaki'));
    const ids = ['misc-age', 'misc-fever', 'misc-crp', 'misc-cardiac', 'misc-mucocutaneous', 'misc-shock', 'misc-gi', 'misc-heme', 'misc-sars', 'misc-kawasaki'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.misC({
        ageYears: val('misc-age'),
        fever: checked('misc-fever'),
        crp: val('misc-crp'),
        cardiac: checked('misc-cardiac'),
        mucocutaneous: checked('misc-mucocutaneous'),
        shock: checked('misc-shock'),
        gastrointestinal: checked('misc-gi'),
        hematologic: checked('misc-heme'),
        sarsCov2Evidence: checked('misc-sars'),
        kawasakiFinalDiagnosis: checked('misc-kawasaki'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Categories involved', value: `${r.categoryCount}/5` },
      ]);
      note(o, r.categories.length ? `Categories: ${r.categories.join(', ')}.` : 'No categories selected.');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
