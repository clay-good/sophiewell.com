// spec-v1396: renderer for nurse staffing (State & Coverage Reference, Group M):
// nurse-staffing-ratio-check, ca-wpv-report-clock, mandatory-overtime-check.
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as NSR from '../lib/nurse-staffing-ratio-check-v1396.js';
import * as WPV from '../lib/ca-wpv-report-clock-v1396.js';
import * as OT from '../lib/mandatory-overtime-check-v1396.js';
import * as SC from '../lib/staffing-committee-check-v1396.js';
import * as TXWV from '../lib/tx-workplace-violence-plan-audit-v1396.js';
import * as SH from '../lib/tx-safe-harbor-decision-aid-v1396.js';
import * as NH from '../lib/nursing-home-staffing-check-v1396.js';
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

  'staffing-committee-check'(root) {
    note(root, 'New York or Texas hospital nurse staffing committee. A blank answer is not assessed.');
    selectField(root, 'State', 'sc-state', SC.SC_STATES, '-- choose --');
    numField(root, 'Committee members', 'sc-members');
    numField(root, 'Frontline members (NY) or direct-care RNs selected by peers (TX)', 'sc-frontline');
    selectField(root, 'Frontline members chosen by peers or under the bargaining agreement', 'sc-peer', SC.YES_NO, NA);
    selectField(root, 'NY: annual clinical staffing plan produced by July 1', 'sc-july', SC.YES_NO, NA);
    selectField(root, 'TX: chief nursing officer is a voting member', 'sc-cno', SC.YES_NO, NA);
    selectField(root, 'TX: met at least once in each of the last four quarters', 'sc-quarterly', SC.YES_NO, NA);
    selectField(root, 'TX: plan evaluated and reported to the board every six months', 'sc-semiannual', SC.YES_NO, NA);

    const ids = ['sc-state', 'sc-members', 'sc-frontline', 'sc-peer', 'sc-july', 'sc-cno', 'sc-quarterly', 'sc-semiannual'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = SC.staffingCommitteeCheck({ state: val('sc-state'), members: val('sc-members'), frontline: val('sc-frontline'), peerSelected: val('sc-peer'), planByJuly: val('sc-july'), cnoVoting: val('sc-cno'), quarterly: val('sc-quarterly'), semiannual: val('sc-semiannual') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.compositionNote);
      note(o, r.cadenceNote);
      note(o, r.postureNote);
    }));
  },

  'tx-workplace-violence-plan-audit'(root) {
    note(root, 'Texas. Mark each committee and plan requirement; a blank one is not checked, never present.');
    selectField(root, '331.002(b)(1) A direct-care registered nurse on the committee', 'txwv-rn', TXWV.STATUS, NA);
    selectField(root, '331.002(b)(2) A direct-care physician on the committee (unless the facility has none on staff)', 'txwv-physician', TXWV.STATUS, NA);
    selectField(root, '331.002(b)(3) A security employee on the committee, if any and if practicable', 'txwv-security', TXWV.STATUS, NA);
    selectField(root, '331.004(b)(1) The plan is based on the practice setting', 'txwv-setting', TXWV.STATUS, NA);
    selectField(root, '331.004(b)(2) A definition covering threats and acts of physical force and any firearm or dangerous weapon', 'txwv-definition', TXWV.STATUS, NA);
    selectField(root, '331.004(b)(3) At least annual prevention training for direct-care staff', 'txwv-training', TXWV.STATUS, NA);
    selectField(root, '331.004(b)(4) A system for responding to and investigating incidents', 'txwv-response', TXWV.STATUS, NA);
    selectField(root, '331.004(b)(5) Physical security and safety addressed', 'txwv-security-plan', TXWV.STATUS, NA);
    selectField(root, '331.004(b)(6) Staff input solicited in developing the plan', 'txwv-input', TXWV.STATUS, NA);
    selectField(root, '331.004(b)(7) Reporting through the existing occurrence reporting system', 'txwv-reporting', TXWV.STATUS, NA);
    selectField(root, '331.004(b)(8) Reassignment away from a patient who abused or threatened the provider', 'txwv-reassign', TXWV.STATUS, NA);
    selectField(root, '331.004(d) Annual committee review with a report to the governing body', 'txwv-review', TXWV.STATUS, NA);
    selectField(root, '331.004(e) A copy available to staff on request', 'txwv-copy', TXWV.STATUS, NA);

    const ids = ['txwv-rn', 'txwv-physician', 'txwv-security', 'txwv-setting', 'txwv-definition', 'txwv-training', 'txwv-response', 'txwv-security-plan', 'txwv-input', 'txwv-reporting', 'txwv-reassign', 'txwv-review', 'txwv-copy'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = TXWV.txWorkplaceViolencePlanAudit({ rn: val('txwv-rn'), physician: val('txwv-physician'), security: val('txwv-security'), setting: val('txwv-setting'), definition: val('txwv-definition'), training: val('txwv-training'), response: val('txwv-response'), 'security-plan': val('txwv-security-plan'), input: val('txwv-input'), reporting: val('txwv-reporting'), reassign: val('txwv-reassign'), review: val('txwv-review'), copy: val('txwv-copy') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.lines);
      note(o, r.postureNote);
    }));
  },

  'tx-safe-harbor-decision-aid'(root) {
    note(root, 'Texas nurses asked to do something they believe violates their duty to a patient.');
    selectField(root, 'You can complete the written request form now', 'sh-write', SH.YES_NO, NA);
    selectField(root, 'While the review is pending, you will', 'sh-plan', SH.PLAN, '-- choose --');
    selectField(root, 'The question is whether a physician order is medically reasonable', 'sh-order', SH.YES_NO, NA);

    const ids = ['sh-write', 'sh-plan', 'sh-order'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = SH.txSafeHarborDecisionAid({ canWrite: val('sh-write'), plan: val('sh-plan'), physicianOrder: val('sh-order') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.oralItems);
      note(o, r.comprehensiveNote);
      note(o, r.timelineNote);
      note(o, 'Protections:');
      list(o, r.protections);
      note(o, r.orderNote);
      note(o, r.limitsNote);
      note(o, r.postureNote);
    }));
  },

  'nursing-home-staffing-check'(root) {
    note(root, 'New York and California check a day\'s hours per resident; New Jersey checks a shift\'s head count.');
    selectField(root, 'State', 'nh-state', NH.NH_STATES, '-- choose --');
    numField(root, 'Resident census', 'nh-census');
    selectField(root, 'CA: distinct-part SNF of a general acute hospital', 'nh-dp', NH.YES_NO, NA);
    numField(root, 'NY, CA: direct care hours worked in the day', 'nh-total');
    numField(root, 'NY, CA: certified nurse aide hours in the day', 'nh-aide');
    numField(root, 'NY: licensed nurse hours in the day', 'nh-licensed');
    selectField(root, 'NJ: shift', 'nh-shift', NH.SHIFTS, NA);
    numField(root, 'NJ: CNAs working this shift', 'nh-cnas');
    numField(root, 'NJ: RNs and LPNs giving direct care this shift', 'nh-lic');

    const ids = ['nh-state', 'nh-census', 'nh-dp', 'nh-total', 'nh-aide', 'nh-licensed', 'nh-shift', 'nh-cnas', 'nh-lic'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NH.nursingHomeStaffingCheck({ state: val('nh-state'), census: val('nh-census'), distinctPart: val('nh-dp'), totalHours: val('nh-total'), aideHours: val('nh-aide'), licensedHours: val('nh-licensed'), shift: val('nh-shift'), cnas: val('nh-cnas'), licensed: val('nh-lic') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.lines);
      note(o, r.countNote);
      note(o, r.postureNote);
    }));
  },
};
