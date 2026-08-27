// spec-v816 §2: renderer for moh-ichd3 — the ICHD-3 criteria for 8.2 Medication-overuse
// headache (Clinical Scoring & Risk, Group G).
//
// Each drug class gets its own days-per-month field because the overuse threshold DIFFERS
// by class (10 for ergotamine, triptans, opioids and combination analgesics; 15 for simple
// analgesics). One combined "days of acute medication" field could not express that.
//
// The separate total field is not redundant: 8.2.6 counts DAYS, so a day on which two drugs
// were taken must count once. Summing the per-drug fields would count it twice.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/moh-ichd3-v816.js';
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
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'numeric' }, attrs || {})));
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
  'moh-ichd3'(root) {
    note(root, 'The overuse threshold depends on the drug class: 10 days a month for triptans, ergotamine, opioids and combination analgesics, but 15 for simple analgesics.');

    root.appendChild(el('h2', { text: 'Headache and duration' }));
    numField(root, 'Headache days per month', 'moh-headache-days', { min: '0', max: '31', step: '1' });
    numField(root, 'Months of regular overuse so far', 'moh-months', { min: '0', step: '1' });

    root.appendChild(el('h2', { text: 'Days per month by drug class' }));
    numField(root, 'Triptans (overuse at 10 or more)', 'moh-triptan', { min: '0', max: '31', step: '1' });
    numField(root, 'Ergotamine (overuse at 10 or more)', 'moh-ergotamine', { min: '0', max: '31', step: '1' });
    numField(root, 'Opioids (overuse at 10 or more)', 'moh-opioid', { min: '0', max: '31', step: '1' });
    numField(root, 'Combination analgesics (overuse at 10 or more)', 'moh-combination', { min: '0', max: '31', step: '1' });
    numField(root, 'Acetaminophen (overuse at 15 or more)', 'moh-acetaminophen', { min: '0', max: '31', step: '1' });
    numField(root, 'Aspirin or other anti-inflammatories (overuse at 15 or more)', 'moh-nsaid', { min: '0', max: '31', step: '1' });

    root.appendChild(el('h2', { text: 'Total days, for the multiple-class subtype' }));
    numField(root, 'Days per month on which any acute headache drug was taken (count each day once)', 'moh-total-days', { min: '0', max: '31', step: '1' });

    root.appendChild(el('h2', { text: 'Exclusion' }));
    root.appendChild(checkField('Not better accounted for by another ICHD-3 diagnosis', 'moh-noother'));

    const ids = ['moh-headache-days', 'moh-months', 'moh-triptan', 'moh-ergotamine', 'moh-opioid',
      'moh-combination', 'moh-acetaminophen', 'moh-nsaid', 'moh-total-days', 'moh-noother'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.mohIchd3({
        headacheDays: val('moh-headache-days'),
        overuseMonths: val('moh-months'),
        triptanDays: val('moh-triptan'),
        ergotamineDays: val('moh-ergotamine'),
        opioidDays: val('moh-opioid'),
        combinationDays: val('moh-combination'),
        paracetamolDays: val('moh-acetaminophen'),
        nsaidDays: val('moh-nsaid'),
        totalMedicationDays: val('moh-total-days'),
        noBetterExplanation: checked('moh-noother'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total medication days', value: `${r.totalMedicationDays} per month` },
      ]);
      if (r.thresholdNote) note(o, r.thresholdNote);
      if (r.totalNote) note(o, r.totalNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to a medication history already taken. It does not plan a withdrawal or start a preventive.' }));
  },
};
