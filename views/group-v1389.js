// spec-v1389: renderers for the involuntary-hold clocks (State & Coverage Reference, Group M).
// Built so far: tx-emergency-detention-clock, tx-protective-custody-hearing-clock.
//
// Every time is ENTERED, never read from the device clock, so the answer is the same tomorrow.

import { el, clear } from '../lib/dom.js';
import * as ED from '../lib/tx-emergency-detention-clock-v1389.js';
import * as PC from '../lib/tx-protective-custody-hearing-clock-v1389.js';
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
