// spec-v1636: hospital pharmacy operations: label antidote and emergency dosing, stewardship metrics,
// department measurement.
// nac-oral-regimen, fomepizole-schedule, dantrolene-mh-vials,
// flumazenil-ladder, neostigmine-reversal-dose, deferoxamine-acute-iron,
// us-antivenom-dose, thrombolytic-dose.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as NR from '../lib/nac-oral-regimen-v1636.js';
import * as FO from '../lib/fomepizole-schedule-v1636.js';
import * as DM from '../lib/dantrolene-mh-vials-v1636.js';
import * as FL from '../lib/flumazenil-ladder-v1636.js';
import * as NS from '../lib/neostigmine-reversal-dose-v1636.js';
import * as DF from '../lib/deferoxamine-acute-iron-v1636.js';
import * as AV from '../lib/us-antivenom-dose-v1636.js';
import * as TD from '../lib/thrombolytic-dose-v1636.js';

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
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '3', placeholder }));
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
  'nac-oral-regimen'(root) {
    const pairs = [['nor-weight', 'weight'], ['nor-strength', 'strength'], ['nor-load', 'loadTime']];
    numField(root, 'Weight, kg', 'nor-weight', '');
    selectField(root, 'Solution strength', 'nor-strength', NR.STRENGTHS);
    dateField(root, 'Time of the loading dose (optional, for the dose clock)', 'nor-load', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = NR.nacOralRegimen(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'fomepizole-schedule'(root) {
    const pairs = [['fms-weight', 'weight'], ['fms-given', 'dosesGiven'], ['fms-dialysis', 'dialysis'], ['fms-last', 'lastDoseTime'], ['fms-dial', 'dialysisTime']];
    numField(root, 'Weight, kg', 'fms-weight', '');
    numField(root, 'Doses given so far, counting the loading dose (0 if none)', 'fms-given', '');
    selectField(root, 'Hemodialysis', 'fms-dialysis', FO.DIALYSIS);
    dateField(root, 'Time of the last dose (needed once a dose is given)', 'fms-last', 'datetime-local');
    dateField(root, 'Time hemodialysis started or ended', 'fms-dial', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = FO.fomepizoleSchedule(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'dantrolene-mh-vials'(root) {
    const pairs = [['dmv-weight', 'weight'], ['dmv-product', 'product'], ['dmv-use', 'use'], ['dmv-dose', 'dosePerKg'], ['dmv-given', 'cumulativeGiven']];
    numField(root, 'Weight, kg', 'dmv-weight', '');
    selectField(root, 'Product', 'dmv-product', DM.PRODUCTS);
    selectField(root, 'Use', 'dmv-use', DM.USES);
    numField(root, 'Treatment: dose for this bolus, mg/kg', 'dmv-dose', '');
    numField(root, 'Treatment: dantrolene already given in this crisis, mg (0 if none)', 'dmv-given', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DM.dantroleneMhVials(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'flumazenil-ladder'(root) {
    const pairs = [['fzl-indication', 'indication'], ['fzl-patient', 'patient'], ['fzl-given', 'dosesGiven'], ['fzl-weight', 'weight']];
    selectField(root, 'Indication', 'fzl-indication', FL.INDICATIONS);
    selectField(root, 'Patient', 'fzl-patient', FL.PATIENTS);
    numField(root, 'Doses given so far in this series (0 before the first)', 'fzl-given', '');
    numField(root, 'Weight, kg (needed for a pediatric patient)', 'fzl-weight', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = FL.flumazenilLadder(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'neostigmine-reversal-dose'(root) {
    const pairs = [['nrd-weight', 'weight'], ['nrd-twitch', 'twitch'], ['nrd-half-life', 'halfLife'], ['nrd-conc', 'concentration'], ['nrd-prior', 'priorDose']];
    numField(root, 'Weight, kg', 'nrd-weight', '');
    selectField(root, 'Train-of-four response', 'nrd-twitch', NS.TWITCH);
    selectField(root, 'Half-life class of the blocker', 'nrd-half-life', NS.HALF_LIFE);
    selectField(root, 'Concentration', 'nrd-conc', NS.CONCENTRATIONS);
    numField(root, 'Neostigmine already given, mg (optional)', 'nrd-prior', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = NS.neostigmineReversalDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'deferoxamine-acute-iron'(root) {
    const pairs = [['dai-weight', 'weight'], ['dai-route', 'route'], ['dai-given', 'givenLast24h']];
    numField(root, 'Weight, kg', 'dai-weight', '');
    selectField(root, 'Route', 'dai-route', DF.ROUTES);
    numField(root, 'Deferoxamine given in the last 24 hours, mg (0 if none)', 'dai-given', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DF.deferoxamineAcuteIron(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'us-antivenom-dose'(root) {
    const pairs = [['uad-product', 'product'], ['uad-dose', 'dose'], ['uad-vials', 'vials'], ['uad-before', 'vialsBefore'], ['uad-control', 'controlTime']];
    selectField(root, 'Product', 'uad-product', AV.PRODUCTS);
    selectField(root, 'Which dose this is', 'uad-dose', AV.DOSES);
    numField(root, 'Vials in this dose (CroFab initial or further dose, where the label gives a range)', 'uad-vials', '');
    numField(root, 'Vials given before this dose (optional)', 'uad-before', '');
    dateField(root, 'Time initial control was achieved (optional)', 'uad-control', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AV.usAntivenomDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'thrombolytic-dose'(root) {
    const pairs = [['thd-regimen', 'regimen'], ['thd-weight', 'weight'], ['thd-lumen', 'lumenVolume']];
    selectField(root, 'Drug and indication', 'thd-regimen', TD.REGIMENS);
    numField(root, 'Weight, kg (not needed for pulmonary embolism)', 'thd-weight', '');
    numField(root, 'Cathflo under 30 kg: internal lumen volume of the catheter, mL', 'thd-lumen', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = TD.thrombolyticDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
};
