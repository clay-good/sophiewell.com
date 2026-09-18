// spec-v1389: renderers for the involuntary-hold clocks (State & Coverage Reference, Group M).
// Built so far: tx-emergency-detention-clock, tx-protective-custody-hearing-clock, ny-mhl-hold-clock, nj-civil-commitment-clock,
// ca-5150-hold-timeline, ca-ed-psych-detention-1799, ca-5585-minor-hold.
//
// Every time is ENTERED, never read from the device clock, so the answer is the same tomorrow.

import { el, clear } from '../lib/dom.js';
import * as ED from '../lib/tx-emergency-detention-clock-v1389.js';
import * as PC from '../lib/tx-protective-custody-hearing-clock-v1389.js';
import * as NY from '../lib/ny-mhl-hold-clock-v1389.js';
import * as NJ from '../lib/nj-civil-commitment-clock-v1389.js';
import * as C5 from '../lib/ca-5150-hold-timeline-v1389.js';
import * as C17 from '../lib/ca-ed-psych-detention-1799-v1389.js';
import * as CM from '../lib/ca-5585-minor-hold-v1389.js';
import { resultRow } from '../lib/result-copy.js';

function timeField(root, label, id, hint) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'datetime-local' }));
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
  wrap.appendChild(el('input', { id, type: 'number', step: '1', min: '0', inputmode: 'numeric' }));
  if (hint) wrap.appendChild(el('span', { class: 'muted', text: ' ' + hint }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ca-5150-hold-timeline'(root) {
    note(root, 'Enter the times in California local time. A 5250 certification starts a new 14-day clock with its own review hearing.');
    timeField(root, 'First detained (5150)', 'c5-detained', '');
    selectField(root, 'Criterion', 'c5-criterion', C5.CRITERIA, '-- not entered --');
    timeField(root, 'Certified for intensive treatment (5250)', 'c5-certified', 'optional');
    selectField(root, 'Threatened or attempted suicide (for 5260)', 'c5-suicide', C5.YES_NO_UNKNOWN, '-- not entered --');
    selectField(root, 'County has adopted the 30-day certification (5270.15)', 'c5-county30', C5.YES_NO_UNKNOWN, '-- not entered --');

    const ids = ['c5-detained', 'c5-criterion', 'c5-certified', 'c5-suicide', 'c5-county30'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = C5.ca5150HoldTimeline({ detained: val('c5-detained'), criterion: val('c5-criterion'), certified: val('c5-certified'), suicideThreat: val('c5-suicide'), county30: val('c5-county30') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'Stage', value: r.stage },
      ]);
      list(o, r.deadlines.map((d) => `${d.label}: ${d.text}`));
      list(o, r.next);
      list(o, r.caveats);
      note(o, r.sb43Note);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },

  'ca-ed-psych-detention-1799'(root) {
    note(root, 'For an emergency department that is not a county-designated 5150 facility. Enter the times in California local time.');
    timeField(root, 'Detention began', 'c17-detained', '');
    timeField(root, 'Medically stable for transfer', 'c17-stable', 'optional');
    timeField(root, 'First placement contact', 'c17-contact', 'optional');
    timeField(root, '5150 written', 'c17-5150', 'optional');

    const ids = ['c17-detained', 'c17-stable', 'c17-contact', 'c17-5150'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = C17.caEdPsychDetention1799({ detained: val('c17-detained'), stable: val('c17-stable'), firstContact: val('c17-contact'), hold5150: val('c17-5150') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Next limit', value: r.bandLabel },
      ]);
      list(o, r.deadlines.map((d) => `${d.label}: ${d.text}`));
      list(o, r.checks);
      list(o, r.caveats);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },

  'ca-5585-minor-hold'(root) {
    note(root, 'For a minor under 18. Enter the times in California local time.');
    numField(root, 'Age', 'cm-age', 'years');
    selectField(root, 'Criterion', 'cm-criterion', CM.CRITERIA, '-- not entered --');
    timeField(root, 'Minor detained', 'cm-detained', '');
    timeField(root, 'Parent or legal guardian notified', 'cm-parent', 'blank if not yet');

    const ids = ['cm-age', 'cm-criterion', 'cm-detained', 'cm-parent'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = CM.ca5585MinorHold({ age: val('cm-age'), criterion: val('cm-criterion'), detained: val('cm-detained'), parentNotified: val('cm-parent') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'Hold ends', value: r.deadlines[0].at.replace('T', ' ') },
      ]);
      note(o, r.parent);
      list(o, r.caveats);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },

  'nj-civil-commitment-clock'(root) {
    note(root, 'Choose the route and enter the times, in New Jersey local time. The 72 hours start at the screening certificate, not at arrival.');
    selectField(root, 'Route', 'njc-mode', NJ.NJ_MODES, '-- choose --');
    timeField(root, 'Screening certificate completed, or discharge requested', 'njc-start', '');
    dateField(root, 'Initial commitment (temporary order) date', 'njc-committed', 'optional');
    selectField(root, 'At least one certificate by a psychiatrist', 'njc-psych', NJ.MET_OR_NOT, '-- not entered --');
    selectField(root, 'Any certifier a relative by blood or marriage', 'njc-relative', NJ.MET_OR_NOT, '-- not entered --');

    const ids = ['njc-mode', 'njc-start', 'njc-committed', 'njc-psych', 'njc-relative'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NJ.njCivilCommitmentClock({ mode: val('njc-mode'), start: val('njc-start'), committed: val('njc-committed'), psychiatrist: val('njc-psych'), relative: val('njc-relative') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Next deadline', value: r.deadlines[0].text },
      ]);
      list(o, r.deadlines.map((d) => `${d.label}: ${d.text}`));
      list(o, r.checks);
      list(o, r.caveats);
      note(o, r.continuedHoldNote);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },

  'ny-mhl-hold-clock'(root) {
    note(root, 'Choose the legal status and enter the times, in New York local time. Only 9.37 skips Sundays and holidays.');
    selectField(root, 'Legal status', 'nyh-status', NY.NY_STATUSES, '-- choose --');
    timeField(root, 'Start: admission, CPEP registration, or notice received', 'nyh-start', '');
    timeField(root, 'Hearing requested (9.39)', 'nyh-hearing', 'optional');
    dateField(root, 'Application executed (9.27)', 'nyh-executed', '9.27 only');

    const ids = ['nyh-status', 'nyh-start', 'nyh-hearing', 'nyh-executed'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NY.nyMhlHoldClock({ status: val('nyh-status'), start: val('nyh-start'), hearingRequested: val('nyh-hearing'), executed: val('nyh-executed') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Status', value: r.status },
      ]);
      list(o, r.deadlines.map((d) => `${d.label}: ${d.text}`));
      list(o, r.caveats);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },

  'tx-emergency-detention-clock'(root) {
    note(root, 'Enter the times, in Texas local time. The 48 hours run from presentation and include time spent waiting in the emergency department.');
    timeField(root, 'Presented to the facility', 'txed-presented', '');
    timeField(root, 'Apprehended (for the 12-hour exam)', 'txed-apprehended', 'optional');
    numField(root, 'Daily 24-hour weather or disaster extensions ordered', 'txed-extensions', 'usually 0');

    const ids = ['txed-presented', 'txed-apprehended', 'txed-extensions'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = ED.txEmergencyDetentionClock({ presented: val('txed-presented'), apprehended: val('txed-apprehended'), extensions: val('txed-extensions') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.ambiguous ? 'warn' : null },
        { label: 'Detain until', value: r.detainUntil.replace('T', ' ') },
      ]);
      list(o, r.deadlines.map((d) => `${d.label}: ${d.text}`));
      list(o, r.flags);
      list(o, r.caveats);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },

  'tx-protective-custody-hearing-clock'(root) {
    note(root, 'Enter the protective custody detention time, the application filing date, or both, in Texas local time.');
    timeField(root, 'Detained under the protective custody order', 'txpc-detained', '');
    dateField(root, 'Application for court-ordered services filed', 'txpc-filed', 'optional');

    const ids = ['txpc-detained', 'txpc-filed'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = PC.txProtectiveCustodyHearingClock({ detained: val('txpc-detained'), filed: val('txpc-filed') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'Hearing', value: r.bandLabel },
      ]);
      list(o, r.deadlines.map((d) => `${d.label}: ${d.text}`));
      list(o, r.flags);
      list(o, r.caveats);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },
};
