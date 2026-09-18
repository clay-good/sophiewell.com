// spec-v1395: renderers for reporting and consent (State & Coverage Reference, Group M):
// mandated-report-router, ny-hiv-hcv-test-offer.
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as MR from '../lib/mandated-report-router-v1395.js';
import * as OF from '../lib/ny-hiv-hcv-test-offer-v1395.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, blankText) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  sel.appendChild(el('option', { value: '', text: blankText }));
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function timeField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'datetime-local' }));
  root.appendChild(wrap);
}
function numField(root, label, id, hint) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: '1', min: '0', inputmode: 'numeric' }));
  if (hint) wrap.appendChild(el('span', { class: 'muted', text: ' ' + hint }));
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
  'mandated-report-router'(root) {
    note(root, 'Choose the state and who the report is about, and enter when you first had reasonable cause to suspect.');
    selectField(root, 'State', 'mr-state', MR.MR_STATES, '-- choose --');
    selectField(root, 'The report is about', 'mr-victim', MR.VICTIMS, '-- choose --');
    timeField(root, 'First had reasonable cause to suspect', 'mr-time');
    selectField(root, 'Abuser is a resident with diagnosed dementia (California long-term care)', 'mr-dementia', MR.YES_NO, '-- not entered --');
    selectField(root, 'Serious bodily injury (California long-term care)', 'mr-injury', MR.YES_NO, '-- not entered --');

    const ids = ['mr-state', 'mr-victim', 'mr-time', 'mr-dementia', 'mr-injury'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = MR.mandatedReportRouter({ state: val('mr-state'), victim: val('mr-victim'), suspected: val('mr-time'), dementiaResident: val('mr-dementia'), seriousInjury: val('mr-injury') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Answer', value: r.bandLabel },
      ]);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },

  'ny-hiv-hcv-test-offer'(root) {
    note(root, 'New York. Answer each exception; an unanswered one is not a yes.');
    numField(root, 'Age', 'nyo-age', 'years');
    selectField(root, 'Setting', 'nyo-setting', OF.SETTINGS, '-- choose --');
    selectField(root, 'Being treated for a life-threatening emergency', 'nyo-emergency', OF.YES_NO, '-- not entered --');
    selectField(root, 'Has capacity to consent', 'nyo-capacity', OF.YES_NO, '-- not entered --');
    selectField(root, 'HIV test already offered or done', 'nyo-prior-hiv', OF.YES_NO, '-- not entered --');
    selectField(root, 'Hepatitis C screen already offered or done', 'nyo-prior-hcv', OF.YES_NO, '-- not entered --');
    selectField(root, 'Evidence or indication of risk activity (under the age cut)', 'nyo-risk', OF.YES_NO, '-- not entered --');

    const ids = ['nyo-age', 'nyo-setting', 'nyo-emergency', 'nyo-capacity', 'nyo-prior-hiv', 'nyo-prior-hcv', 'nyo-risk'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = OF.nyHivHcvTestOffer({ age: val('nyo-age'), setting: val('nyo-setting'), emergency: val('nyo-emergency'), capacity: val('nyo-capacity'), priorHiv: val('nyo-prior-hiv'), priorHcv: val('nyo-prior-hcv'), risk: val('nyo-risk') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Answer', value: r.bandLabel },
      ]);
      note(o, r.reactiveNote);
      note(o, r.hbvNote);
      note(o, r.postureNote);
    }));
  },
};
