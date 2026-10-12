// spec-v1635: oncology pharmacy, investigational drug service and nuclear pharmacy.
// ind-safety-report-clock, emergency-ind-clock, ind-annual-report-due, trial-record-retention.

import { el, clear } from '../lib/dom.js';
import * as IS from '../lib/ind-safety-report-clock-v1635.js';
import * as EI from '../lib/emergency-ind-clock-v1635.js';
import * as IA from '../lib/ind-annual-report-due-v1635.js';
import * as TR from '../lib/trial-record-retention-v1635.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
  return wrap;
}
function dateField(root, label, id, type = 'date') {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type }));
  root.appendChild(wrap);
  return wrap;
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
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}

export const renderers = {
  'ind-safety-report-clock'(root) {
    const pairs = [['isr-role', 'role'], ['isr-fatal', 'fatalOrLifeThreatening'], ['isr-determined', 'determined'], ['isr-received', 'received'], ['isr-request', 'fdaRequest']];
    selectField(root, 'Who is reporting', 'isr-role', IS.ROLES);
    selectField(root, 'Sponsor: an unexpected fatal or life-threatening suspected adverse reaction?', 'isr-fatal', IS.YES_NO);
    dateField(root, 'Sponsor: date it determined the information qualifies for reporting', 'isr-determined');
    dateField(root, 'Sponsor: date it first received the information (for the 7-day deadline)', 'isr-received');
    dateField(root, 'Date of an FDA request for more data (optional)', 'isr-request');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(IS.indSafetyReportClock(args, new Date()), o);
    }));
  },
  'emergency-ind-clock'(root) {
    const pairs = [['eic-authorized', 'authorized'], ['eic-used', 'used']];
    dateField(root, 'Date FDA authorized the emergency use', 'eic-authorized');
    dateField(root, 'Date of the emergency use at the institution', 'eic-used');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(EI.emergencyIndClock(args), o);
    }));
  },
  'ind-annual-report-due'(root) {
    const pairs = [['iar-received', 'received'], ['iar-may-begin', 'mayBegin'], ['iar-investigator', 'investigatorAdded']];
    dateField(root, 'Date FDA received the IND', 'iar-received');
    dateField(root, 'Earlier date FDA said the study may begin (optional)', 'iar-may-begin');
    dateField(root, 'Date a new investigator was added (optional)', 'iar-investigator');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(IA.indAnnualReportDue(args, new Date()), o);
    }));
  },
  'trial-record-retention'(root) {
    const pairs = [['trr-role', 'role'], ['trr-event', 'event'], ['trr-date', 'date'], ['trr-longer', 'longerUntil']];
    selectField(root, 'Role', 'trr-role', TR.ROLES);
    selectField(root, 'What started the clock', 'trr-event', TR.EVENTS);
    dateField(root, 'Date of that event (the later of discontinuation and FDA being notified)', 'trr-date');
    dateField(root, 'A longer retention date from the protocol, contract or state law (optional)', 'trr-longer');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(TR.trialRecordRetention(args), o);
    }));
  },
};
