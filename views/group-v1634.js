// spec-v1634: medication review, medication safety and pharmacovigilance.
// or-rr-to-nnt, disproportionality-2x2, icer-dominance, liverpool-adr-causality, ncc-merp-index,
// fda-adverse-event-report-clock, riosord, relative-infant-dose, badri-adr-risk, stoppfall-check,
// peds-heparin-nomogram, warfarin-inr-out-of-range, ninja-nephrotoxin-exposure, at-harm10,
// ade-cost-avoidance, anticholinergic-list-score, stopp-start-v3, two-by-two-effect.

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
import * as SF from '../lib/stoppfall-check-v1634.js';
import * as PH from '../lib/peds-heparin-nomogram-v1634.js';
import * as WI from '../lib/warfarin-inr-out-of-range-v1634.js';
import * as NJ from '../lib/ninja-nephrotoxin-exposure-v1634.js';
import * as AH from '../lib/at-harm10-v1634.js';
import * as CA from '../lib/ade-cost-avoidance-v1634.js';
import * as AL from '../lib/anticholinergic-list-score-v1634.js';
import * as SS from '../lib/stopp-start-v3-v1634.js';
import * as TT from '../lib/two-by-two-effect-v1634.js';
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

// STOPP/START: one fieldset of tick boxes per body system, drugs first, then conditions.
function tickGroups(root, kind, items, prefix) {
  const ids = [];
  const systems = [...new Set(items.map((t) => t.system))];
  for (const sys of systems) {
    const fs = el('fieldset', {}, [el('legend', { text: `${kind}: ${sys}` })]);
    for (const t of items.filter((x) => x.system === sys)) {
      const id = `${prefix}${t.value}`;
      const wrap = el('p');
      wrap.appendChild(el('input', { id, type: 'checkbox' }));
      wrap.appendChild(document.createTextNode(' '));
      wrap.appendChild(el('label', { for: id, text: t.text }));
      fs.appendChild(wrap);
      ids.push(id);
    }
    root.appendChild(fs);
  }
  return ids;
}

export const renderers = {
  // spec-v1634 tool 12: STOPP/START version 3. Matches are quoted whole; nothing in their wording is tested.
  'stopp-start-v3'(root) {
    numField(root, 'Age, years (65 or older)', 'ss3-age', '');
    numField(root, 'eGFR, mL/min/1.73 m² (optional, for the kidney criteria)', 'ss3-egfr', '');
    const dIds = tickGroups(root, 'Drugs', SS.DRUGS, 'ss3-d-');
    const cIds = tickGroups(root, 'Conditions', SS.CONDITIONS, 'ss3-c-');
    const o = out(); root.appendChild(o);
    const ticked = (items, prefix) => items.filter((t) => { const n = document.getElementById(`${prefix}${t.value}`); return Boolean(n && n.checked); }).map((t) => t.value);
    wire(['ss3-age', 'ss3-egfr', ...dIds, ...cIds], () => safe(o, () => {
      const r = SS.stoppStartV3({ ageYears: val('ss3-age'), egfr: val('ss3-egfr'), drugs: ticked(SS.DRUGS, 'ss3-d-'), conditions: ticked(SS.CONDITIONS, 'ss3-c-') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
      for (const [title, rows] of [['Potentially inappropriate (STOPP)', r.stopp], ['Potential omissions (START)', r.start]]) {
        if (!rows.length) continue;
        o.appendChild(el('h2', { text: title }));
        list(o, rows.map((x) => `${x.id} (${x.sectionTitle}): ${x.text}`));
      }
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  // spec-v1634 tool 19 (sources re-read October 16, 2026).
  'two-by-two-effect'(root) {
    const pairs = [['tte-a', 'events1'], ['tte-n1', 'total1'], ['tte-c', 'events2'], ['tte-n2', 'total2']];
    numField(root, 'Group 1 (treated or exposed): events', 'tte-a', '');
    numField(root, 'Group 1: total', 'tte-n1', '');
    numField(root, 'Group 2 (comparison): events', 'tte-c', '');
    numField(root, 'Group 2: total', 'tte-n2', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(TT.twoByTwoEffect(args), o);
    }));
  },
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
  'stoppfall-check'(root) {
    const pairs = SF.CLASSES.map((c) => [`spf-${c.dom}`, c.arg]);
    root.appendChild(el('p', { text: 'Is a drug of each class on the medication list? Answer all 14.' }));
    for (const c of SF.CLASSES) selectField(root, c.text, `spf-${c.dom}`, SF.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(SF.stoppfallCheck(args), o);
    }));
  },
  'peds-heparin-nomogram'(root) {
    const pairs = [['phn-weight', 'weight'], ['phn-age', 'age'], ['phn-aptt', 'aptt'], ['phn-rate', 'currentRate']];
    numField(root, 'Weight, kg', 'phn-weight', '');
    selectField(root, 'Age group (for the starting rate)', 'phn-age', PH.AGES);
    numField(root, 'aPTT, seconds (to adjust a running infusion)', 'phn-aptt', '');
    numField(root, 'Current infusion rate, units/h (with an aPTT)', 'phn-rate', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(PH.pedsHeparinNomogram(args), o);
    }));
  },
  'warfarin-inr-out-of-range'(root) {
    const pairs = [['wio-inr', 'inr'], ['wio-low', 'targetLow'], ['wio-high', 'targetHigh'], ['wio-bleeding', 'bleeding'], ['wio-stable', 'stable']];
    numField(root, 'INR', 'wio-inr', '');
    numField(root, 'Target range, lower end', 'wio-low', '');
    numField(root, 'Target range, upper end', 'wio-high', '');
    selectField(root, 'Bleeding', 'wio-bleeding', WI.BLEEDING);
    selectField(root, 'INRs previously stable in range', 'wio-stable', WI.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(WI.warfarinInrOutOfRange(args), o);
    }));
  },
  'ninja-nephrotoxin-exposure'(root) {
    const pairs = [['nnx-count', 'nephrotoxinCount'], ['nnx-ag', 'aminoglycosideDays'], ['nnx-van', 'vancomycinDays']];
    numField(root, 'Nephrotoxic medications given on the same day', 'nnx-count', '');
    numField(root, 'Consecutive days of an IV aminoglycoside (0 if none)', 'nnx-ag', '');
    numField(root, 'Consecutive days of IV vancomycin (0 if none)', 'nnx-van', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(NJ.ninjaNephrotoxinExposure(args), o);
    }));
  },
  'at-harm10'(root) {
    const pairs = AH.QUESTIONS.map((q) => [`ath-${q.arg}`, q.arg]);
    root.appendChild(el('p', { text: 'Answer in order. The first yes ends the assessment, so later questions can be left blank.' }));
    for (const q of AH.QUESTIONS) selectField(root, `${q.code}. ${q.text}`, `ath-${q.arg}`, AH.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(AH.atHarm10(args), o);
    }));
  },
  'ade-cost-avoidance'(root) {
    const pairs = [['aca-lines', 'interventions'], ['aca-time', 'timeCost']];
    areaField(root, 'Interventions, one per line: class (none, very low, low, medium, high), cost of the adverse event averted, count (optional)', 'aca-lines', 'low, 5000, 10');
    numField(root, 'Pharmacist time cost, total (optional)', 'aca-time', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(CA.adeCostAvoidance(args), o);
    }));
  },
  'anticholinergic-list-score'(root) {
    const pairs = [['als-scale', 'scale'], ['als-drugs', 'drugs']];
    selectField(root, 'Scale', 'als-scale', AL.SCALES);
    areaField(root, 'Drugs by generic name, one per line or separated by commas', 'als-drugs', 'amitriptyline');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(AL.anticholinergicListScore(args), o);
    }));
  },
};
