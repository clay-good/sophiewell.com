// spec-v777 §2: renderer for awol — the AWOL delirium risk-stratification score
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three checkboxes
// and one severity select; a count 0-4 maps to an observed delirium incidence.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/awol-v777.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
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
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. AWOL predicts delirium that has not happened yet, so it is not a delirium screen and does not replace one. It points toward prevention measures rather than ordering any of them.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SEVERITY = [
  { value: 'not-ill', text: 'Not ill (0)' },
  { value: 'mildly-ill', text: 'Mildly ill (0)' },
  { value: 'moderately-ill', text: 'Moderately ill (1)' },
  { value: 'severely-ill', text: 'Severely ill (1)' },
  { value: 'moribund', text: 'Moribund (1)' },
];

export const renderers = {
  awol(root) {
    note(root, 'AWOL (Douglas 2013): four admission findings, one point each, predicting delirium during the stay. Observed delirium: 0 in about 2 percent, 1 in about 4, 2 in about 14, 3 in about 20, 4 in about 64.');
    root.appendChild(checkField('Age 80 years or older', 'awol-age'));
    root.appendChild(checkField('Cannot spell the word world backward correctly', 'awol-spell'));
    root.appendChild(checkField('Not oriented to city, state, county, hospital name and floor', 'awol-orient'));
    root.appendChild(selectField('Nurse-rated illness severity', 'awol-illness', SEVERITY));
    const ids = ['awol-age', 'awol-spell', 'awol-orient', 'awol-illness'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.awol({
        age80: checked('awol-age'),
        spellFail: checked('awol-spell'),
        disoriented: checked('awol-orient'),
        illness: val('awol-illness'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/4` },
        { label: 'Delirium incidence', value: r.incidence },
      ]);
      note(o, r.factors.length ? `Points from: ${r.factors.join(', ')}.` : 'No points (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
