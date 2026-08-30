// spec-v910 §2: renderer for kings-college-nonapap — the non-acetaminophen arm of the King's
// College criteria for acute liver failure (Clinical Scoring & Risk, Group G).
//
// The not-sensitive line prints on every result, met or not, because a negative here has never
// been a reason to stand down.
//
// The option literals are written out rather than mapped from the library, because
// scripts/lib/option-labels.mjs reads this file statically and cannot follow a .map().

import { el, clear } from '../lib/dom.js';
import * as K from '../lib/kings-college-nonapap-v910.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, unit) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: unit ? `${label} (${unit})` : label }));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'kings-college-nonapap'(root) {
    numField(root, 'INR', 'kn-inr');
    numField(root, 'Prothrombin time, if the INR is not available', 'kn-pt', 's');
    numField(root, 'Age', 'kn-age', 'years');

    const eWrap = el('p');
    eWrap.appendChild(el('label', { for: 'kn-etiology', text: 'Cause of the liver failure' }));
    const eSel = el('select', { id: 'kn-etiology' });
    eSel.appendChild(el('option', { value: 'other', text: 'Another cause, or not yet known' }));
    eSel.appendChild(el('option', { value: 'seronegative', text: 'Non-A non-B (indeterminate or seronegative) hepatitis' }));
    eSel.appendChild(el('option', { value: 'halothane', text: 'Halothane hepatitis' }));
    eSel.appendChild(el('option', { value: 'idiosyncratic-drug', text: 'Idiosyncratic drug reaction' }));
    eWrap.appendChild(eSel);
    root.appendChild(eWrap);

    numField(root, 'Days from the onset of jaundice to encephalopathy', 'kn-days');
    numField(root, 'Total bilirubin', 'kn-bilirubin');

    const bWrap = el('p');
    bWrap.appendChild(el('label', { for: 'kn-bilirubinunit', text: 'Bilirubin unit' }));
    const bSel = el('select', { id: 'kn-bilirubinunit' });
    bSel.appendChild(el('option', { value: 'mg/dl', text: 'mg/dL' }));
    bSel.appendChild(el('option', { value: 'umol/l', text: 'micromol/L' }));
    bWrap.appendChild(bSel);
    root.appendChild(bWrap);

    const ids = ['kn-inr', 'kn-pt', 'kn-age', 'kn-etiology', 'kn-days', 'kn-bilirubin', 'kn-bilirubinunit'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = K.kingsCollegeNonApap({
        inr: val('kn-inr'), pt: val('kn-pt'), age: val('kn-age'),
        etiology: val('kn-etiology'),
        jaundiceToEncephalopathyDays: val('kn-days'),
        bilirubin: val('kn-bilirubin'), bilirubinUnit: val('kn-bilirubinunit'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      for (const f of r.factors) {
        const state = f.met === null ? 'not entered' : f.met ? 'present' : 'absent';
        note(o, `${f.text}: ${state}. ${f.detail}`);
      }
      note(o, r.sensitivityNote);
      note(o, r.referralNote);
      note(o, r.armNote);
      note(o, r.wordingNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This checks entered values against published thresholds. It does not diagnose, and it does not decide on transplantation.' }));
  },
};
