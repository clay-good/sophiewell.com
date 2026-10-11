// spec-v1634: medication review, medication safety and pharmacovigilance.
// or-rr-to-nnt, disproportionality-2x2, icer-dominance, liverpool-adr-causality, ncc-merp-index,
// fda-adverse-event-report-clock, riosord, relative-infant-dose, badri-adr-risk.

import { el, clear } from '../lib/dom.js';
import * as ON from '../lib/or-rr-to-nnt-v1634.js';
import * as DP from '../lib/disproportionality-2x2-v1634.js';
import * as IC from '../lib/icer-dominance-v1634.js';
import * as LV from '../lib/liverpool-adr-causality-v1634.js';
import * as NM from '../lib/ncc-merp-index-v1634.js';
import * as FC from '../lib/fda-adverse-event-report-clock-v1634.js';
import * as RO from '../lib/riosord-v1634.js';
import * as RD from '../lib/relative-infant-dose-v1634.js';
import * as BA from '../lib/badri-adr-risk-v1634.js';
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
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '3', placeholder }));
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
  'or-rr-to-nnt'(root) {
    const pairs = [['orn-measure', 'measure'], ['orn-ratio', 'ratio'], ['orn-risk', 'baselineRisk'], ['orn-lower', 'lower'], ['orn-upper', 'upper']];
    selectField(root, 'Effect measure', 'orn-measure', ON.MEASURES);
    numField(root, 'Odds ratio or relative risk', 'orn-ratio', '');
    numField(root, 'Baseline risk without treatment, %', 'orn-risk', '');
    numField(root, 'Lower 95% confidence limit (optional)', 'orn-lower', '');
    numField(root, 'Upper 95% confidence limit (optional)', 'orn-upper', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(ON.orRrToNnt(args), o);
    }));
  },
  'disproportionality-2x2'(root) {
    const pairs = [['dpr-a', 'a'], ['dpr-b', 'b'], ['dpr-c', 'c'], ['dpr-d', 'd'], ['dpr-monitoring', 'monitoring'], ['dpr-ime', 'ime']];
    numField(root, 'a: reports with the drug and the event', 'dpr-a', '');
    numField(root, 'b: reports with the drug and other events', 'dpr-b', '');
    numField(root, 'c: reports with other drugs and the event', 'dpr-c', '');
    numField(root, 'd: reports with other drugs and other events', 'dpr-d', '');
    selectField(root, 'EU additional monitoring list (optional)', 'dpr-monitoring', DP.MONITORING);
    selectField(root, 'Event on the Important Medical Event list (optional)', 'dpr-ime', DP.IME);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DP.disproportionality2x2(args), o);
    }));
  },
  'icer-dominance'(root) {
    const pairs = [['icd-options', 'options']];
    areaField(root, 'Options, one per line: name, cost, effect (for example QALYs)', 'icd-options', 'Standard care, 5000, 1');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(IC.icerDominance(args), o);
    }));
  },
  'liverpool-adr-causality'(root) {
    const pairs = LV.QUESTIONS.map((q) => [`lac-${q.dom}`, q.arg]);
    root.appendChild(el('p', { text: 'Answer in order. A question the path does not reach can be left blank.' }));
    for (const q of LV.QUESTIONS) selectField(root, q.text, `lac-${q.dom}`, q.options);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(LV.liverpoolAdrCausality(args), o);
    }));
  },
  'ncc-merp-index'(root) {
    const pairs = NM.QUESTIONS.map((q) => [`nmi-${q.dom}`, q.arg]);
    root.appendChild(el('p', { text: 'Answer in order. A question the path does not reach can be left blank.' }));
    for (const q of NM.QUESTIONS) selectField(root, q.text, `nmi-${q.dom}`, NM.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(NM.nccMerpIndex(args), o);
    }));
  },
  'fda-adverse-event-report-clock'(root) {
    const pairs = [['fac-setting', 'setting'], ['fac-outcome', 'outcome'], ['fac-unexpected', 'unexpected'], ['fac-received', 'received'], ['fac-source', 'source'], ['fac-approval', 'approval']];
    selectField(root, 'Setting', 'fac-setting', FC.SETTINGS);
    selectField(root, 'Most serious outcome', 'fac-outcome', FC.OUTCOMES);
    selectField(root, 'Unexpected: not listed in the current labeling (needed when serious)', 'fac-unexpected', FC.YES_NO);
    dateField(root, 'Date the information was first received', 'fac-received');
    selectField(root, 'From a postmarketing study? (optional)', 'fac-source', FC.SOURCES);
    dateField(root, 'For periodic reports: date of approval of the application, or of issuance of the biologics license', 'fac-approval');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(FC.fdaAdverseEventReportClock(args, new Date()), o);
    }));
  },
  'riosord'(root) {
    const pairs = [['rio-version', 'version'], ...RO.ITEMS.map((it) => [`rio-${it.dom}`, it.arg]), ['rio-mme', 'mme']];
    selectField(root, 'Version', 'rio-version', RO.VERSIONS);
    root.appendChild(el('p', { text: 'Answer every item of the version chosen. Items marked for the other version can be left blank.' }));
    for (const it of RO.ITEMS) selectField(root, it.text, `rio-${it.dom}`, RO.YES_NO);
    numField(root, 'Maximum prescribed opioid dose, MME a day (all opioids taken regularly)', 'rio-mme', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(RO.riosord(args), o);
    }));
  },
  'relative-infant-dose'(root) {
    const pairs = [['rid-milk', 'milkConcentration'], ['rid-mp', 'mpRatio'], ['rid-plasma', 'plasmaConcentration'], ['rid-unit', 'unit'], ['rid-dose', 'maternalDose'], ['rid-weight', 'maternalWeight'], ['rid-approved', 'approvedInfantDose']];
    numField(root, 'Average milk concentration (or use the next two fields instead)', 'rid-milk', '');
    numField(root, 'Milk-plasma ratio', 'rid-mp', '');
    numField(root, 'Average maternal plasma concentration', 'rid-plasma', '');
    selectField(root, 'Concentration unit', 'rid-unit', RD.UNITS);
    numField(root, 'Maternal dose, mg a day', 'rid-dose', '');
    numField(root, 'Maternal weight, kg', 'rid-weight', '');
    numField(root, 'Approved infant dose, mg/kg a day (optional)', 'rid-approved', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(RD.relativeInfantDose(args), o);
    }));
  },
  'badri-adr-risk'(root) {
    const pairs = BA.ITEMS.map((it) => [`bad-${it.dom}`, it.arg]);
    for (const it of BA.ITEMS) selectField(root, it.text, `bad-${it.dom}`, BA.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(BA.badriAdrRisk(args), o);
    }));
  },
};
