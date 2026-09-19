// spec-v1394: renderers for prenatal and newborn tiles: prenatal-infection-screening-schedule and
// nys-newborn-screen-planner (Pediatrics & Neonatal, Group N); tx-neonatal-level-match,
// tx-maternal-level-reference, and ca-safe-surrender (State & Coverage Reference, Group M).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as PNS from '../lib/prenatal-infection-screening-schedule-v1394.js';
import * as NBS from '../lib/nys-newborn-screen-planner-v1394.js';
import * as NLC from '../lib/tx-neonatal-level-match-v1394.js';
import * as MLC from '../lib/tx-maternal-level-reference-v1394.js';
import * as SS from '../lib/ca-safe-surrender-v1394.js';
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
function inputField(root, label, id, type) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type }));
  root.appendChild(wrap);
}
function numField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min: '0', inputmode: 'decimal' }));
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
function answer(o, r, warn) {
  resultRow(o, [
    { text: r.band, cls: warn ? 'warn' : null },
    { label: 'Answer', value: r.bandLabel },
  ]);
}

const NA = '-- not entered --';

export const renderers = {
  'prenatal-infection-screening-schedule'(root) {
    note(root, 'Choose the state and setting, then say which results are on record; a blank is not the same as none.');
    selectField(root, 'State', 'pns-state', PNS.PNS_STATES, '-- choose --');
    selectField(root, 'Setting', 'pns-setting', PNS.SETTINGS, '-- choose --');
    numField(root, 'Gestational age (weeks)', 'pns-ga');
    selectField(root, 'First-visit syphilis', 'pns-syph1', PNS.ON_RECORD, NA);
    selectField(root, 'Third-trimester syphilis', 'pns-syph3', PNS.ON_RECORD, NA);
    selectField(root, 'First-visit HIV', 'pns-hiv1', PNS.ON_RECORD, NA);
    selectField(root, 'Third-trimester HIV', 'pns-hiv3', PNS.ON_RECORD, NA);
    selectField(root, 'Hepatitis B', 'pns-hbv', PNS.ON_RECORD, NA);

    const ids = ['pns-state', 'pns-setting', 'pns-ga', 'pns-syph1', 'pns-syph3', 'pns-hiv1', 'pns-hiv3', 'pns-hbv'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = PNS.prenatalInfectionScreeningSchedule({ state: val('pns-state'), setting: val('pns-setting'), ga: val('pns-ga'), syphFirst: val('pns-syph1'), syph3: val('pns-syph3'), hivFirst: val('pns-hiv1'), hiv3: val('pns-hiv3'), hbv: val('pns-hbv') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.next);
      note(o, r.notes);
      note(o, r.postureNote);
    }));
  },

  'nys-newborn-screen-planner'(root) {
    note(root, 'New York. Enter the birth and weight; add transfusion, TPN, and discharge times if they apply.');
    inputField(root, 'Birth', 'nbs-birth', 'datetime-local');
    numField(root, 'Birth weight (g)', 'nbs-weight');
    selectField(root, 'Admitted to the NICU', 'nbs-nicu', NBS.YES_NO, '-- choose --');
    inputField(root, 'First specimen drawn', 'nbs-first', 'datetime-local');
    inputField(root, 'Discharged', 'nbs-discharge', 'datetime-local');
    inputField(root, 'First transfusion', 'nbs-tx1', 'datetime-local');
    inputField(root, 'Most recent or final transfusion', 'nbs-tx2', 'datetime-local');
    inputField(root, 'Last TPN', 'nbs-tpn', 'datetime-local');
    selectField(root, 'Readmitted within the first 28 days', 'nbs-readmit', NBS.YES_NO, NA);
    selectField(root, 'Proof of a screen-negative result', 'nbs-negative', NBS.YES_NO, NA);

    const ids = ['nbs-birth', 'nbs-weight', 'nbs-nicu', 'nbs-first', 'nbs-discharge', 'nbs-tx1', 'nbs-tx2', 'nbs-tpn', 'nbs-readmit', 'nbs-negative'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NBS.nysNewbornScreenPlanner({ birth: val('nbs-birth'), weightG: val('nbs-weight'), nicu: val('nbs-nicu'), first: val('nbs-first'), discharge: val('nbs-discharge'), transfusionFirst: val('nbs-tx1'), transfusionLast: val('nbs-tx2'), tpnLast: val('nbs-tpn'), readmitted: val('nbs-readmit'), priorNegative: val('nbs-negative') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.specimens);
      list(o, r.extra);
      note(o, r.beforeNote);
      note(o, r.postureNote);
    }));
  },

  'tx-neonatal-level-match'(root) {
    note(root, 'Texas. Enter the infant; the answer is the lowest designated level whose rule covers them.');
    numField(root, 'Gestational age (weeks)', 'nlc-ga');
    numField(root, 'Birth weight (g)', 'nlc-weight');
    selectField(root, 'Expected respiratory support', 'nlc-resp', NLC.RESP, '-- choose --');
    selectField(root, 'Illness', 'nlc-illness', NLC.ILLNESS, '-- choose --');
    selectField(root, 'This facility is more than 75 miles from a Level III or IV', 'nlc-far', NLC.YES_NO, NA);

    const ids = ['nlc-ga', 'nlc-weight', 'nlc-resp', 'nlc-illness', 'nlc-far'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NLC.txNeonatalLevelMatch({ ga: val('nlc-ga'), weightG: val('nlc-weight'), resp: val('nlc-resp'), illness: val('nlc-illness'), far: val('nlc-far') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.exception);
      note(o, r.generallyNote);
      note(o, r.postureNote);
    }));
  },

  'tx-maternal-level-reference'(root) {
    note(root, 'Texas. Choose the maternal risk; the answer is the lowest level whose scope covers it.');
    selectField(root, 'Maternal risk', 'mlc-risk', MLC.RISK, '-- choose --');

    const ids = ['mlc-risk'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = MLC.txMaternalLevelReference({ risk: val('mlc-risk') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.needs);
      note(o, r.postureNote);
    }));
  },

  'ca-safe-surrender'(root) {
    note(root, 'California. Enter the infant\'s age and when custody was accepted.');
    numField(root, 'Infant\'s age at surrender (hours)', 'ss-age');
    inputField(root, 'Custody accepted', 'ss-time', 'datetime-local');
    selectField(root, 'Coded ankle bracelet placed', 'ss-bracelet', SS.YES_NO, NA);

    const ids = ['ss-age', 'ss-time', 'ss-bracelet'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = SS.caSafeSurrender({ ageHours: val('ss-age'), surrendered: val('ss-time'), bracelet: val('ss-bracelet') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.steps);
      note(o, r.scopeNote);
      note(o, r.postureNote);
    }));
  },
};
