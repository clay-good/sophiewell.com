// spec-v868 §2: renderer for pertussis-case-def — the CDC/CSTE pertussis case definition
// (Clinical Scoring & Risk, Group G).
//
// The not-a-treatment-threshold sentence prints on every result, and the negative-test sentence
// prints on every result that is not confirmed, because those are the two readings that cost a
// real case.

import { el, clear } from '../lib/dom.js';
import * as P from '../lib/pertussis-case-def-v868.js';
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

const domId = (key) => `pcd-${key.toLowerCase()}`;

export const renderers = {
  'pertussis-case-def'(root) {
    note(root, 'A surveillance classification. Treatment and post-exposure prophylaxis are decided on clinical suspicion and do not wait for it.');

    root.appendChild(el('h2', { text: 'Cough illness' }));
    selectField(root, 'Age group', 'pcd-age', [
      { value: 'older', text: 'One year and older' },
      { value: 'infant', text: 'Infant under one year' },
    ]);
    numField(root, 'Duration of the cough illness, in weeks', 'pcd-coughweeks', { min: '0', max: '104', step: '1' });

    root.appendChild(el('h2', { text: 'Accepted signs' }));
    for (const s of P.SYMPTOMS) {
      checkField(root, s.text, domId(s.key), s.infantOnly ? 'Counts only in an infant under one year.' : null);
    }
    checkField(root, 'A more likely diagnosis has been made', 'pcd-morelikelydiagnosis', 'The clinical criteria begin by excluding one.');

    root.appendChild(el('h2', { text: 'Laboratory and exposure' }));
    // Written out rather than mapped from P.LAB_RESULTS: scripts/lib/option-labels.mjs reads
    // option text out of this file statically, and a mapped list is not readable, which leaves
    // the raw value ("none") printed on the tool page.
    selectField(root, 'Laboratory result', 'pcd-lab', [
      { value: 'none', text: 'No positive test' },
      { value: 'culture', text: 'Culture positive for Bordetella pertussis' },
      { value: 'pcr', text: 'PCR positive for Bordetella pertussis' },
    ]);
    checkField(root, 'Epidemiologic link to a laboratory-confirmed case', 'pcd-epilink');

    const ids = ['pcd-age', 'pcd-coughweeks', 'pcd-lab', 'pcd-epilink', 'pcd-morelikelydiagnosis']
      .concat(P.SYMPTOMS.map((s) => domId(s.key)));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        age: val('pcd-age'),
        coughWeeks: val('pcd-coughweeks'),
        lab: val('pcd-lab'),
        epiLink: checked('pcd-epilink'),
        moreLikelyDiagnosis: checked('pcd-morelikelydiagnosis'),
      };
      for (const s of P.SYMPTOMS) args[s.key] = checked(domId(s.key));
      const r = P.pertussisCaseDefinition(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.readNote);
      note(o, r.countedNote);
      if (r.shortfallNote) note(o, r.shortfallNote);
      if (r.apneaNote) note(o, r.apneaNote);
      if (r.infantNote) note(o, r.infantNote);
      if (r.negativeTestNote) note(o, r.negativeTestNote);
      note(o, r.notATreatmentNote);
      note(o, r.serologyNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published surveillance definition to findings already recorded. It does not diagnose pertussis, and it does not decide whether to treat.' }));
  },
};
