// spec-v1633: conversions, switches, titrations and tapers, each as its label or paper states it.
// anticoag-switch-clock, doac-periprocedural-timing.

import { el, clear } from '../lib/dom.js';
import * as AS from '../lib/anticoag-switch-clock-v1633.js';
import * as DP from '../lib/doac-periprocedural-timing-v1633.js';
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
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
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
  'anticoag-switch-clock'(root) {
    const pairs = [['asc-from', 'from'], ['asc-to', 'to'], ['asc-pop', 'population'], ['asc-inr', 'inr'], ['asc-crcl', 'crcl'], ['asc-edo-option', 'edoxabanOption'], ['asc-edo-dose', 'edoxabanDose'], ['asc-next', 'nextDose'], ['asc-last', 'lastDose']];
    selectField(root, 'Anticoagulant being stopped', 'asc-from', AS.DRUGS);
    selectField(root, 'Anticoagulant being started', 'asc-to', AS.DRUGS);
    selectField(root, 'Patient', 'asc-pop', AS.POPULATIONS);
    numField(root, 'Current INR (when warfarin is being stopped)', 'asc-inr', '');
    numField(root, 'Creatinine clearance, mL/min (when dabigatran is being stopped; for a child, eGFR)', 'asc-crcl', '');
    selectField(root, 'Edoxaban to warfarin: which option', 'asc-edo-option', AS.EDOXABAN_OPTIONS);
    selectField(root, 'Edoxaban to warfarin, oral option: current dose', 'asc-edo-dose', AS.EDOXABAN_DOSES);
    dateField(root, 'Next scheduled dose of the drug being stopped (optional)', 'asc-next', 'datetime-local');
    dateField(root, 'Last dabigatran dose (optional, for a switch to a parenteral drug)', 'asc-last', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AS.anticoagSwitchClock(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'doac-periprocedural-timing'(root) {
    const pairs = [['dpt-drug', 'drug'], ['dpt-pop', 'population'], ['dpt-risk', 'risk'], ['dpt-source', 'source'], ['dpt-when', 'procedure'], ['dpt-crcl', 'crcl']];
    selectField(root, 'DOAC', 'dpt-drug', DP.DRUGS);
    selectField(root, 'Patient', 'dpt-pop', DP.POPULATIONS);
    selectField(root, 'Bleeding risk of the procedure (your classification)', 'dpt-risk', DP.RISKS);
    selectField(root, 'Source to apply', 'dpt-source', DP.SOURCES);
    dateField(root, 'Procedure date and time', 'dpt-when', 'datetime-local');
    numField(root, 'Creatinine clearance, mL/min (dabigatran, and any drug under PAUSE; for a child on dabigatran, eGFR)', 'dpt-crcl', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DP.doacPeriproceduralTiming(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
};
