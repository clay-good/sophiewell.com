// spec-v1396: renderer for nurse staffing (State & Coverage Reference, Group M):
// nurse-staffing-ratio-check, ca-wpv-report-clock, mandatory-overtime-check.
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as NSR from '../lib/nurse-staffing-ratio-check-v1396.js';
import * as WPV from '../lib/ca-wpv-report-clock-v1396.js';
import * as OT from '../lib/mandatory-overtime-check-v1396.js';
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

const NA = '-- not answered --';

export const renderers = {
  'nurse-staffing-ratio-check'(root) {
    note(root, 'Check one unit at a time: California forbids averaging across units or over a shift.');
    selectField(root, 'State', 'nsr-state', NSR.NSR_STATES, '-- choose --');
    selectField(root, 'Unit (California)', 'nsr-unit', NSR.CA_UNITS, '-- choose --');
    numField(root, 'Patients (or occupied operating rooms)', 'nsr-patients');
    numField(root, 'Licensed nurses on the unit', 'nsr-nurses');
    numField(root, 'Of those, not in the ratio (triage RN, base-radio RN, charge nurse without patients)', 'nsr-excluded');

    const ids = ['nsr-state', 'nsr-unit', 'nsr-patients', 'nsr-nurses', 'nsr-excluded'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NSR.nurseStaffingRatioCheck({ state: val('nsr-state'), unit: val('nsr-unit'), patients: val('nsr-patients'), nurses: val('nsr-nurses'), notCounted: val('nsr-excluded') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.notes);
      note(o, r.averagingNote);
      note(o, r.postureNote);
    }));
  },

  'ca-wpv-report-clock'(root) {
    note(root, 'California general acute care, acute psychiatric, and special hospitals. A blank answer is not assessed.');
    selectField(root, 'Who committed the violence', 'wpv-who', WPV.PERPETRATORS, '-- choose --');
    selectField(root, 'Physical force against an employee', 'wpv-force', WPV.YES_NO, NA);
    selectField(root, 'A firearm or other dangerous weapon', 'wpv-weapon', WPV.YES_NO, NA);
    selectField(root, 'Death, admission over 24 h, lost member, or serious disfigurement', 'wpv-severe', WPV.YES_NO, NA);
    selectField(root, 'Realistic possibility of death or serious physical harm', 'wpv-urgent', WPV.YES_NO, NA);
    inputField(root, 'Hospital knew (or with diligent inquiry would have known)', 'wpv-known', 'datetime-local');

    const ids = ['wpv-who', 'wpv-force', 'wpv-weapon', 'wpv-severe', 'wpv-urgent', 'wpv-known'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = WPV.caWpvReportClock({ perpetrator: val('wpv-who'), force: val('wpv-force'), weapon: val('wpv-weapon'), severe: val('wpv-severe'), urgent: val('wpv-urgent'), knownAt: val('wpv-known') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.typeNote);
      note(o, r.injuryNote);
      note(o, r.postureNote);
    }));
  },

  'mandatory-overtime-check'(root) {
    note(root, 'New York, New Jersey, or Texas. Being short again is never an emergency.');
    selectField(root, 'State', 'ot-state', OT.OT_STATES, '-- choose --');
    selectField(root, 'Situation', 'ot-situation', OT.SITUATIONS, '-- choose --');
    selectField(root, 'The employer first tried to cover it voluntarily', 'ot-voluntary', OT.YES_NO, NA);

    const ids = ['ot-state', 'ot-situation', 'ot-voluntary'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = OT.mandatoryOvertimeCheck({ state: val('ot-state'), situation: val('ot-situation'), voluntaryTried: val('ot-voluntary') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.conditions);
      note(o, r.postureNote);
    }));
  },
};
