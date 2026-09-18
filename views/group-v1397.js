// spec-v1397: renderers for licensure and practice authority (State & Coverage Reference, Group M):
// nurse-license-training-requirements (New York first), ca-np-103-104-tracker,
// tx-prescriptive-authority-agreement.
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as NLT from '../lib/nurse-license-training-requirements-v1397.js';
import * as NP from '../lib/ca-np-103-104-tracker-v1397.js';
import * as PAA from '../lib/tx-prescriptive-authority-agreement-v1397.js';
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
function dateField(root, label, id, hint) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'date' }));
  if (hint) wrap.appendChild(el('span', { class: 'muted', text: ' ' + hint }));
  root.appendChild(wrap);
}
function numField(root, label, id, hint) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: '0.1', min: '0', inputmode: 'decimal' }));
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
  'nurse-license-training-requirements'(root) {
    note(root, 'New York for now. Enter the dates you completed each course; leave one blank if you have not taken it.');
    selectField(root, 'State', 'nlt-state', NLT.NLT_STATES, '-- choose --');
    selectField(root, 'License', 'nlt-license', NLT.LICENSES, '-- choose --');
    selectField(root, 'Practicing in New York', 'nlt-practicing', NLT.YES_NO, '-- choose --');
    dateField(root, 'Child abuse identification course completed', 'nlt-abuse', 'blank if never');
    selectField(root, 'Child abuse training exemption claimed (no contact with minors)', 'nlt-exempt', NLT.YES_NO, '-- not entered --');
    dateField(root, 'Infection control course completed', 'nlt-infection', 'most recent');

    const ids = ['nlt-state', 'nlt-license', 'nlt-practicing', 'nlt-abuse', 'nlt-exempt', 'nlt-infection'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NLT.nurseLicenseTrainingRequirements({
        state: val('nlt-state'), license: val('nlt-license'), practicingNY: val('nlt-practicing'),
        abuseDate: val('nlt-abuse'), abuseExempt: val('nlt-exempt'), infectionDate: val('nlt-infection'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.items[0].text, cls: r.items[0].status === 'due' ? 'warn' : null },
        { label: 'Child abuse update', value: r.bandLabel },
      ]);
      note(o, r.items[1].text);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },

  'ca-np-103-104-tracker'(root) {
    note(root, 'For a California nurse practitioner. Enter the transition-to-practice start (full-time) or the hours so far.');
    dateField(root, 'Check as of', 'np-asof', 'today or a planned date');
    dateField(root, 'Full-time transition to practice began', 'np-ttp-start', 'or enter hours');
    numField(root, 'Transition-to-practice hours completed', 'np-ttp-hours', 'optional');
    selectField(root, 'Passed the national NP board examination', 'np-exam', NP.YES_NO, '-- not entered --');
    selectField(root, 'Holds national NP certification', 'np-cert', NP.YES_NO, '-- not entered --');
    selectField(root, 'Education meets board standards (clinical hours)', 'np-edu', NP.YES_NO, '-- not entered --');
    selectField(root, 'Active California RN license (for 104)', 'np-rn', NP.YES_NO, '-- not entered --');
    selectField(root, "Master's or doctoral degree in nursing (for 104)", 'np-degree', NP.YES_NO, '-- not entered --');
    numField(root, 'Years of NP practice after the transition to practice', 'np-post', 'optional');

    const ids = ['np-asof', 'np-ttp-start', 'np-ttp-hours', 'np-exam', 'np-cert', 'np-edu', 'np-rn', 'np-degree', 'np-post'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NP.caNp103104Tracker({
        asOf: val('np-asof'), ttpStart: val('np-ttp-start'), ttpHours: val('np-ttp-hours'), boardExam: val('np-exam'),
        nationalCert: val('np-cert'), education: val('np-edu'), rnActive: val('np-rn'), degree: val('np-degree'), postTtpYears: val('np-post'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.items[0], cls: null },
        { label: 'Status', value: r.bandLabel },
      ]);
      note(o, r.items[1]);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },

  'tx-prescriptive-authority-agreement'(root) {
    note(root, 'For a Texas physician with prescriptive authority agreements. Answer each required element; an unanswered one is not a yes.');
    numField(root, 'APRNs and PAs under agreement (full-time equivalents)', 'paa-fte', 'FTE');
    selectField(root, 'Underserved or hospital facility-based practice', 'paa-exempt', PAA.YES_NO, '-- choose --');
    selectField(root, 'Signed and dated in writing', 'paa-signed', PAA.YES_NO, '-- not entered --');
    selectField(root, 'Parties named with addresses and license numbers', 'paa-parties', PAA.YES_NO, '-- not entered --');
    selectField(root, 'Practice, locations, or settings stated', 'paa-practice', PAA.YES_NO, '-- not entered --');
    selectField(root, 'Drugs or devices that may or may not be prescribed', 'paa-drugs', PAA.YES_NO, '-- not entered --');
    selectField(root, 'Plan for consultation and referral', 'paa-referral', PAA.YES_NO, '-- not entered --');
    selectField(root, 'Plan for patient emergencies', 'paa-emergencies', PAA.YES_NO, '-- not entered --');
    selectField(root, 'Process for communication and sharing information', 'paa-communication', PAA.YES_NO, '-- not entered --');
    selectField(root, 'Alternate physicians named, if used', 'paa-alternates', PAA.YES_NO, '-- not entered --');
    selectField(root, 'Quality assurance plan (chart review, meetings)', 'paa-qa', PAA.YES_NO, '-- not entered --');
    dateField(root, 'Last documented quality assurance meeting', 'paa-meeting', 'optional');
    dateField(root, 'Check as of', 'paa-asof', 'optional');

    const ids = ['paa-fte', 'paa-exempt', 'paa-signed', 'paa-parties', 'paa-practice', 'paa-drugs', 'paa-referral', 'paa-emergencies', 'paa-communication', 'paa-alternates', 'paa-qa', 'paa-meeting', 'paa-asof'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = PAA.txPrescriptiveAuthorityAgreement({
        fte: val('paa-fte'), exempt: val('paa-exempt'), signed: val('paa-signed'), parties: val('paa-parties'), practice: val('paa-practice'),
        drugs: val('paa-drugs'), referral: val('paa-referral'), emergencies: val('paa-emergencies'), communication: val('paa-communication'),
        alternates: val('paa-alternates'), qaPlan: val('paa-qa'), lastMeeting: val('paa-meeting'), asOf: val('paa-asof'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Answer', value: r.bandLabel },
      ]);
      list(o, r.unanswered.map((u) => `Not answered: ${u}`));
      note(o, r.meeting);
      note(o, r.meetingRule);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },
};
