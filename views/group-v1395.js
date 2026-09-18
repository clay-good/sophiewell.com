// spec-v1395: renderers for reporting and consent (State & Coverage Reference, Group M):
// mandated-report-router, ny-hiv-hcv-test-offer, ca-adverse-event-1279, tx-sa-forensic-exam-window,
// minor-self-consent.
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as MR from '../lib/mandated-report-router-v1395.js';
import * as OF from '../lib/ny-hiv-hcv-test-offer-v1395.js';
import * as AE from '../lib/ca-adverse-event-1279-v1395.js';
import * as SA from '../lib/tx-sa-forensic-exam-window-v1395.js';
import * as MC from '../lib/minor-self-consent-v1395.js';
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
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
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

  'ca-adverse-event-1279'(root) {
    note(root, 'For a California licensed hospital. Choose the event and enter when it was detected.');
    selectField(root, 'Event', 'ae-event', AE.AE_EVENTS, '-- choose --');
    selectField(root, 'An ongoing urgent or emergent threat', 'ae-urgent', AE.YES_NO, '-- not entered --');
    timeField(root, 'Detected', 'ae-detected');

    const ids = ['ae-event', 'ae-urgent', 'ae-detected'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = AE.caAdverseEvent1279({ event: val('ae-event'), urgent: val('ae-urgent'), detected: val('ae-detected') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Answer', value: r.bandLabel },
      ]);
      note(o, r.informNote);
      note(o, r.fallNote);
      note(o, r.disabilityNote);
      note(o, r.postureNote);
    }));
  },

  'tx-sa-forensic-exam-window'(root) {
    note(root, 'Texas. Enter the age and, for an adult, the hours since the assault.');
    numField(root, 'Age', 'sa-age', 'years');
    numField(root, 'Hours since the assault (adults)', 'sa-hours', 'hours');
    selectField(root, 'Referral for the examination', 'sa-referral', SA.REFERRALS, '-- not entered --');
    selectField(root, 'This facility is SAFE-ready', 'sa-safe', SA.YES_NO, '-- choose --');

    const ids = ['sa-age', 'sa-hours', 'sa-referral', 'sa-safe'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = SA.txSaForensicExamWindow({ age: val('sa-age'), hours: val('sa-hours'), referral: val('sa-referral'), safeReady: val('sa-safe') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.eligible ? null : 'warn' },
        { label: 'Answer', value: r.bandLabel },
      ]);
      note(o, r.duties);
      note(o, r.consentNote);
      note(o, 'Every facility provides:');
      list(o, r.services);
      note(o, r.postureNote);
    }));
  },

  'minor-self-consent'(root) {
    note(root, 'California or Texas. Choose the service; each state lets a minor consent alone only for some.');
    selectField(root, 'State', 'msc-state', MC.MSC_STATES, '-- choose --');
    numField(root, 'Age', 'msc-age', 'years');
    selectField(root, 'Service', 'msc-service', MC.SERVICES, '-- choose --');
    selectField(root, 'Living apart from parents', 'msc-apart', MC.YES_NO, '-- not entered --');
    selectField(root, 'Managing own finances', 'msc-finances', MC.YES_NO, '-- not entered --');
    selectField(root, 'Mature enough, in the professional\'s opinion (California mental health)', 'msc-mature', MC.YES_NO, '-- not entered --');
    selectField(root, 'On active military duty (Texas)', 'msc-duty', MC.YES_NO, '-- not entered --');

    const ids = ['msc-state', 'msc-age', 'msc-service', 'msc-apart', 'msc-finances', 'msc-mature', 'msc-duty'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = MC.minorSelfConsent({ state: val('msc-state'), age: val('msc-age'), service: val('msc-service'), livingApart: val('msc-apart'), ownFinances: val('msc-finances'), mature: val('msc-mature'), activeDuty: val('msc-duty') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Answer', value: r.bandLabel },
      ]);
      note(o, r.parentNote);
      note(o, r.postureNote);
    }));
  },
};
