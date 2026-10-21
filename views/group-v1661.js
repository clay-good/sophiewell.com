// spec-v1661: transplant tools buildable without the OPTN guides.
// ischemia-time-clock, donor-recipient-size-match.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as ITC from '../lib/ischemia-time-clock-v1661.js';
import * as DRS from '../lib/donor-recipient-size-match-v1661.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder }));
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
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}
function tool(root, pairs, compute) {
  const o = out(); root.appendChild(o);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    show(compute(args), o);
  }));
}

export const renderers = {
  'ischemia-time-clock'(root) {
    areaField(root, 'Events in order, one per line: name, then YYYY-MM-DD HH:MM', 'itc-events', 'Cross-clamp, 2026-10-19 22:10');
    numField(root, 'A limit in hours from the first event (optional)', 'itc-limit', '');
    tool(root, [['itc-events', 'events'], ['itc-limit', 'limitHours']], ITC.ischemiaTimeClock);
  },
  'donor-recipient-size-match'(root) {
    selectField(root, 'Weight unit', 'drs-wunit', DRS.WEIGHT_UNITS);
    selectField(root, 'Height unit', 'drs-hunit', DRS.HEIGHT_UNITS);
    numField(root, 'Donor weight', 'drs-dw', 'e.g. 80');
    numField(root, 'Recipient weight', 'drs-rw', 'e.g. 64');
    numField(root, 'Donor height', 'drs-dh', 'e.g. 180');
    numField(root, 'Recipient height', 'drs-rh', 'e.g. 160');
    tool(root, [['drs-wunit', 'weightUnit'], ['drs-hunit', 'heightUnit'], ['drs-dw', 'donorWeight'], ['drs-rw', 'recipientWeight'], ['drs-dh', 'donorHeight'], ['drs-rh', 'recipientHeight']], DRS.donorRecipientSizeMatch);
  },
};
