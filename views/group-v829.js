// spec-v829 §2: renderer for ohs-diagnosis — the 2019 ATS definition of obesity
// hypoventilation syndrome and its bicarbonate screening rule (Clinical Scoring & Risk,
// Group G).
//
// The bicarbonate section is separated from the diagnostic criteria and labelled as
// screening, because it decides whether to measure the PaCO2 and never decides the
// diagnosis. The high-probability question sits with it, since the rule's threshold belongs
// to a stated population and is routinely borrowed out of it.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ohs-diagnosis-v829.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ohs-diagnosis'(root) {
    note(root, 'The carbon dioxide threshold is for an awake, resting sample at sea level. Oximetry does not answer this question, and altitude changes it.');

    root.appendChild(el('h2', { text: 'The four diagnostic criteria' }));
    numField(root, 'Body mass index, kg per square meter', 'ohs-bmi', { min: '5', max: '150', step: '0.1' });
    root.appendChild(checkField('Sleep-disordered breathing', 'ohs-sdb'));
    numField(root, 'Awake resting PaCO2, mmHg', 'ohs-paco2', { min: '5', max: '200', step: '1' });
    root.appendChild(checkField('Other causes of hypoventilation excluded', 'ohs-excluded'));

    root.appendChild(el('h2', { text: 'Screening, when no blood gas has been taken' }));
    numField(root, 'Serum bicarbonate, mmol per L', 'ohs-bicarb', { min: '0', max: '80', step: '0.1' });
    root.appendChild(checkField('The pretest probability is high, for example marked obesity or known severe sleep apnea with daytime somnolence', 'ohs-highprob'));

    const ids = ['ohs-bmi', 'ohs-sdb', 'ohs-paco2', 'ohs-excluded', 'ohs-bicarb', 'ohs-highprob'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ohsDiagnosis({
        bmi: val('ohs-bmi'),
        sleepDisorderedBreathing: checked('ohs-sdb'),
        paco2: val('ohs-paco2'),
        otherCausesExcluded: checked('ohs-excluded'),
        bicarbonate: val('ohs-bicarb'),
        highProbability: checked('ohs-highprob'),
      });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [{ text: r.band, cls: r.abnormal ? 'warn' : null }];
      if (r.screening) rows.push({ label: 'Screening', value: r.screening });
      resultRow(o, rows);
      if (r.screeningNote) note(o, r.screeningNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to results already obtained. It does not start positive airway pressure or arrange a sleep study.' }));
  },
};
