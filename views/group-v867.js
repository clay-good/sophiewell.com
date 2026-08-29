// spec-v867 §2: renderer for who-severe-malaria — the WHO severe malaria criteria (Clinical
// Scoring & Risk, Group G).
//
// The any-one-feature sentence and the parasite-count sentence print on every result, including
// the one with nothing ticked, because that is the result this definition is most misread in.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/who-severe-malaria-v867.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number' }, attrs || {})));
  root.appendChild(wrap);
}
function checkField(root, label, id, detail) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  if (detail) wrap.appendChild(el('span', { class: 'muted', text: ' ' + detail }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const domId = (key) => `sm-${key.toLowerCase()}`;

export const renderers = {
  'who-severe-malaria'(root) {
    note(root, 'For a patient with confirmed P. falciparum asexual parasitemia and no other identified cause. Any one feature below is severe malaria.');

    root.appendChild(el('h2', { text: 'Patient' }));
    selectField(root, 'Age group', 'sm-age', [
      { value: 'adult', text: 'Adult' },
      { value: 'child', text: 'Child under 12 years' },
    ]);
    numField(root, 'Parasitemia, percent of parasitized red cells', 'sm-parasitemia', { min: '0', max: '100', step: '0.1' });

    root.appendChild(el('h2', { text: 'Features present' }));
    for (const f of M.FEATURES) checkField(root, f.text, domId(f.key), f.detail);

    const ids = ['sm-age', 'sm-parasitemia'].concat(M.FEATURES.map((f) => domId(f.key)));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = { age: val('sm-age'), parasitemia: val('sm-parasitemia') };
      for (const f of M.FEATURES) args[f.key] = checked(domId(f.key));
      const r = M.whoSevereMalaria(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.metNote);
      if (r.negativeNote) note(o, r.negativeNote);
      if (r.conjunctiveNote) note(o, r.conjunctiveNote);
      note(o, r.notAScoreNote);
      note(o, r.parasiteCountNote);
      note(o, r.ageNote);
      note(o, r.confirmationNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to values that have already been measured. It does not diagnose malaria, and it does not prescribe treatment.' }));
  },
};
