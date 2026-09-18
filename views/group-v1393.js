// spec-v1393: renderers for the controlled-substance rules (State & Coverage Reference, Group M):
// pmp-check-required, acute-opioid-rx-limit, tx-aprn-pa-controlled-delegation.
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as PMP from '../lib/pmp-check-required-v1393.js';
import * as LIM from '../lib/acute-opioid-rx-limit-v1393.js';
import * as DEL from '../lib/tx-aprn-pa-controlled-delegation-v1393.js';
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
function numField(root, label, id, hint) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: '1', min: '1', inputmode: 'numeric' }));
  if (hint) wrap.appendChild(el('span', { class: 'muted', text: ' ' + hint }));
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'pmp-check-required'(root) {
    note(root, 'Choose the state, the drug, and the setting. Texas decides by drug class; the others by schedule.');
    selectField(root, 'State', 'pmp-state', PMP.PMP_STATES, '-- choose --');
    selectField(root, 'Drug class', 'pmp-class', PMP.DRUG_CLASSES, '-- choose --');
    selectField(root, 'Schedule', 'pmp-schedule', PMP.SCHEDULES, '-- choose --');
    selectField(root, 'Setting', 'pmp-setting', PMP.SETTINGS, '-- choose --');
    selectField(root, 'First prescription or continuing', 'pmp-first', PMP.FIRST_OR_CONTINUING, '-- choose --');
    numField(root, 'Days supplied', 'pmp-days', 'days');
    selectField(root, 'Refills ordered', 'pmp-refills', PMP.YES_NO, '-- not entered --');
    selectField(root, 'For acute or chronic pain (New Jersey)', 'pmp-pain', PMP.YES_NO, '-- not entered --');
    selectField(root, 'Within 24 hours of surgery or trauma (New Jersey)', 'pmp-24h', PMP.YES_NO, '-- not entered --');
    selectField(root, 'Buprenorphine (California emergency department)', 'pmp-bup', PMP.YES_NO, '-- not entered --');
    dateField(root, 'Date of the last check', 'pmp-last', 'continuing only');

    const ids = ['pmp-state', 'pmp-class', 'pmp-schedule', 'pmp-setting', 'pmp-first', 'pmp-days', 'pmp-refills', 'pmp-pain', 'pmp-24h', 'pmp-bup', 'pmp-last'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = PMP.pmpCheckRequired({
        state: val('pmp-state'), drugClass: val('pmp-class'), schedule: val('pmp-schedule'), setting: val('pmp-setting'),
        first: val('pmp-first'), days: val('pmp-days'), refills: val('pmp-refills'), forPain: val('pmp-pain'),
        within24: val('pmp-24h'), buprenorphine: val('pmp-bup'), lastCheck: val('pmp-last'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Answer', value: r.bandLabel },
      ]);
      note(o, r.record);
      note(o, r.nextCheckNote);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },

  'acute-opioid-rx-limit'(root) {
    note(root, 'For an opioid prescription. California has no general adult day limit in statute, so it is not listed.');
    selectField(root, 'State', 'lim-state', LIM.RX_LIMIT_STATES, '-- choose --');
    selectField(root, 'What the opioid is for', 'lim-category', LIM.CATEGORIES, '-- choose --');
    numField(root, 'Days supplied', 'lim-days', 'days');
    selectField(root, 'Initial prescription for this pain', 'lim-initial', LIM.YES_NO, '-- choose --');
    selectField(root, 'Refills ordered (Texas)', 'lim-refills', LIM.YES_NO, '-- not entered --');
    selectField(root, 'Extended-release or long-acting (New Jersey)', 'lim-er', LIM.YES_NO, '-- not entered --');
    dateField(root, 'Initial prescription date (New Jersey subsequent)', 'lim-previous', 'optional');
    dateField(root, 'Today (New Jersey subsequent)', 'lim-today', 'optional');

    const ids = ['lim-state', 'lim-category', 'lim-days', 'lim-initial', 'lim-refills', 'lim-er', 'lim-previous', 'lim-today'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = LIM.acuteOpioidRxLimit({
        state: val('lim-state'), category: val('lim-category'), days: val('lim-days'), initial: val('lim-initial'),
        refills: val('lim-refills'), extendedRelease: val('lim-er'), previous: val('lim-previous'), today: val('lim-today'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Answer', value: r.bandLabel },
      ]);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },

  'tx-aprn-pa-controlled-delegation'(root) {
    note(root, 'For a Texas physician delegating to an APRN or PA. Schedule II depends on the setting; Schedules III to V on days and consultation.');
    selectField(root, 'Schedule', 'del-schedule', DEL.SCHEDULES, '-- choose --');
    selectField(root, 'Setting', 'del-setting', DEL.SETTINGS, '-- choose --');
    numField(root, 'Days covered, including refills', 'del-days', 'days');
    selectField(root, 'Is this a refill', 'del-refill', DEL.YES_NO, '-- choose --');
    selectField(root, 'Delegating physician consulted on the refill', 'del-refill-c', DEL.YES_NO_UNKNOWN, '-- not entered --');
    selectField(root, 'Patient younger than 2', 'del-under2', DEL.YES_NO, '-- choose --');
    selectField(root, 'Delegating physician consulted (child under 2)', 'del-under2-c', DEL.YES_NO_UNKNOWN, '-- not entered --');
    selectField(root, 'Medical-staff policy for Schedule II delegation (hospital)', 'del-policy', DEL.YES_NO_UNKNOWN, '-- not entered --');

    const ids = ['del-schedule', 'del-setting', 'del-days', 'del-refill', 'del-refill-c', 'del-under2', 'del-under2-c', 'del-policy'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = DEL.txAprnPaControlledDelegation({
        schedule: val('del-schedule'), setting: val('del-setting'), days: val('del-days'), refill: val('del-refill'),
        refillConsulted: val('del-refill-c'), under2: val('del-under2'), under2Consulted: val('del-under2-c'), hospitalPolicy: val('del-policy'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Answer', value: r.bandLabel },
      ]);
      note(o, r.registrationNote);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },
};
