// spec-v1390: renderers for hold criteria and court-ordered outpatient treatment (State & Coverage
// Reference, Group M): ny-aot-kendras-law, ca-grave-disability-sb43, ca-care-court-eligibility,
// tx-emergency-detention-criteria.
//
// Every criterion is a three-state select: blank is "not assessed", never a pass.
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as AOT from '../lib/ny-aot-kendras-law-v1390.js';
import * as GD from '../lib/ca-grave-disability-sb43-v1390.js';
import * as CARE from '../lib/ca-care-court-eligibility-v1390.js';
import * as TXC from '../lib/tx-emergency-detention-criteria-v1390.js';
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
function inputField(root, label, id, type, hint) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const attrs = { id, type };
  if (type === 'number') Object.assign(attrs, { step: '1', min: '0', inputmode: 'numeric' });
  wrap.appendChild(el('input', attrs));
  if (hint) wrap.appendChild(el('span', { class: 'muted', text: ' ' + hint }));
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
function verdictRow(o, r) {
  resultRow(o, [
    { text: r.band, cls: r.verdict === null ? null : (r.abnormal ? 'warn' : null) },
    { label: 'Answer', value: r.bandLabel },
  ]);
}

const NA = '-- not assessed --';

export const renderers = {
  'ny-aot-kendras-law'(root) {
    note(root, 'New York. Each criterion left blank is not assessed, and an unassessed one leaves the answer undecided.');
    inputField(root, 'Petition date', 'aot-asof', 'date');
    inputField(root, 'Age', 'aot-age', 'number', 'years');
    selectField(root, '(2) Suffering from a mental illness', 'aot-mi', AOT.CRITERION, NA);
    selectField(root, '(3) Unlikely to survive safely without supervision', 'aot-survive', AOT.CRITERION, NA);
    selectField(root, '(5) Unlikely to take part in treatment voluntarily', 'aot-voluntary', AOT.CRITERION, NA);
    selectField(root, '(6) Needs AOT to prevent relapse likely to cause serious harm', 'aot-prevent', AOT.CRITERION, NA);
    selectField(root, '(7) Likely to benefit from AOT', 'aot-benefit', AOT.CRITERION, NA);
    note(root, '(4) Treatment history. Enter the dates that apply; each window is computed from them.');
    inputField(root, 'Hospitalizations where non-compliance was a significant factor (dates, comma-separated)', 'aot-episodes', 'text');
    inputField(root, 'Most recent serious violent act, threat, or attempt', 'aot-violence', 'date');
    inputField(root, 'Earlier AOT order expired', 'aot-expired', 'date');
    selectField(root, 'Since it expired: symptoms rose, or emergency care, admission, or jail followed', 'aot-since', AOT.CRITERION, NA);
    inputField(root, 'Current or recent confinement began', 'aot-cstart', 'date');
    inputField(root, 'Confinement ended (blank if still confined)', 'aot-cend', 'date');
    selectField(root, 'Records reviewed for all three history prongs', 'aot-reviewed', AOT.YES_NO, NA);

    const ids = ['aot-asof', 'aot-age', 'aot-mi', 'aot-survive', 'aot-voluntary', 'aot-prevent', 'aot-benefit', 'aot-episodes', 'aot-violence', 'aot-expired', 'aot-since', 'aot-cstart', 'aot-cend', 'aot-reviewed'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = AOT.nyAotKendrasLaw({
        asOf: val('aot-asof'), age: val('aot-age'), mentalIllness: val('aot-mi'), unlikelySurvive: val('aot-survive'),
        unlikelyVoluntary: val('aot-voluntary'), needToPrevent: val('aot-prevent'), likelyBenefit: val('aot-benefit'),
        episodes: val('aot-episodes'), violence: val('aot-violence'), aotExpired: val('aot-expired'), aotSince: val('aot-since'),
        confineStart: val('aot-cstart'), confineEnd: val('aot-cend'), historyReviewed: val('aot-reviewed'),
      });
      if (!r.valid) { note(o, r.message); return; }
      verdictRow(o, r);
      list(o, r.criteria);
      note(o, 'History prongs:');
      list(o, r.prongs);
      note(o, r.windowNote);
      note(o, r.countNote);
      note(o, r.postureNote);
    }));
  },

  'ca-grave-disability-sb43'(root) {
    note(root, 'California. Choose the cause, then mark each basic need; one that is blank is not assessed.');
    selectField(root, 'Cause', 'gd-cause', GD.CAUSES, '-- choose --');
    selectField(root, 'Hold or proceeding (needed for chronic alcoholism)', 'gd-hold', GD.HOLDS, '-- not entered --');
    selectField(root, 'Food', 'gd-food', GD.NEED_STATE, NA);
    selectField(root, 'Clothing', 'gd-clothing', GD.NEED_STATE, NA);
    selectField(root, 'Shelter', 'gd-shelter', GD.NEED_STATE, NA);
    selectField(root, 'Personal safety', 'gd-safety', GD.NEED_STATE, NA);
    selectField(root, 'Necessary medical care', 'gd-medical', GD.NEED_STATE, NA);
    selectField(root, 'The inability results from the condition', 'gd-result', GD.CRITERION, NA);

    const ids = ['gd-cause', 'gd-hold', 'gd-food', 'gd-clothing', 'gd-shelter', 'gd-safety', 'gd-medical', 'gd-result'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = GD.caGraveDisabilitySb43({
        cause: val('gd-cause'), hold: val('gd-hold'), food: val('gd-food'), clothing: val('gd-clothing'), shelter: val('gd-shelter'),
        personalSafety: val('gd-safety'), medicalCare: val('gd-medical'), result: val('gd-result'),
      });
      if (!r.valid) { note(o, r.message); return; }
      verdictRow(o, r);
      list(o, r.needs);
      note(o, r.severeNote);
      note(o, r.historyNote);
      note(o, r.postureNote);
    }));
  },

  'ca-care-court-eligibility'(root) {
    note(root, 'California. Every criterion must be met; one left blank is not assessed.');
    inputField(root, 'Age', 'care-age', 'number', 'years');
    selectField(root, 'Diagnosis', 'care-dx', CARE.DIAGNOSES, '-- choose --');
    selectField(root, '(b) Currently experiencing a serious mental disorder (5600.3)', 'care-serious', CARE.CRITERION, NA);
    selectField(root, '(c) Not clinically stabilized in ongoing voluntary treatment', 'care-stabilized', CARE.CRITERION, NA);
    selectField(root, '(d)(1) Unlikely to survive safely unsupervised, and deteriorating', 'care-d1', CARE.CRITERION, NA);
    selectField(root, '(d)(2) Needs support to prevent relapse toward grave disability or harm', 'care-d2', CARE.CRITERION, NA);
    selectField(root, '(e) CARE is the least restrictive alternative necessary', 'care-least', CARE.CRITERION, NA);
    selectField(root, '(f) Likely to benefit from a CARE plan or agreement', 'care-benefit', CARE.CRITERION, NA);

    const ids = ['care-age', 'care-dx', 'care-serious', 'care-stabilized', 'care-d1', 'care-d2', 'care-least', 'care-benefit'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = CARE.caCareCourtEligibility({
        age: val('care-age'), diagnosis: val('care-dx'), serious: val('care-serious'), notStabilized: val('care-stabilized'),
        d1: val('care-d1'), d2: val('care-d2'), leastRestrictive: val('care-least'), likelyBenefit: val('care-benefit'),
      });
      if (!r.valid) { note(o, r.message); return; }
      verdictRow(o, r);
      list(o, r.criteria);
      note(o, r.sb27Note);
      note(o, r.postureNote);
    }));
  },

  'tx-emergency-detention-criteria'(root) {
    note(root, 'Texas. Choose the path; only its elements are read. A blank element is not assessed.');
    selectField(root, 'Path', 'txc-path', TXC.PATHS, '-- choose --');
    selectField(root, 'Has mental illness', 'txc-mi', TXC.CRITERION, NA);
    selectField(root, 'Because of it: substantial risk of serious harm to self or others', 'txc-harm', TXC.CRITERION, NA);
    selectField(root, 'Because of it: severe emotional distress and deterioration', 'txc-distress', TXC.CRITERION, NA);
    selectField(root, 'Because of it: cannot recognize symptoms or weigh treatment', 'txc-insight', TXC.CRITERION, NA);
    selectField(root, 'Officer, magistrate: likely without detention to suffer or inflict serious harm', 'txc-likely', TXC.CRITERION, NA);
    selectField(root, 'Officer: not enough time to obtain a warrant', 'txc-notime', TXC.CRITERION, NA);
    selectField(root, 'Magistrate, physician: harm imminent unless immediately restrained', 'txc-imminent', TXC.CRITERION, NA);
    selectField(root, 'Magistrate: restraint needs emergency detention', 'txc-restraint', TXC.CRITERION, NA);
    selectField(root, 'Physician: statement acceptable to the facility', 'txc-acceptable', TXC.CRITERION, NA);
    selectField(root, 'Physician: detention is the least restrictive means', 'txc-least', TXC.CRITERION, NA);
    selectField(root, 'Physician: describes the nature of the mental illness', 'txc-desc-ill', TXC.CRITERION, NA);
    selectField(root, 'Physician: specifically describes the risk of harm', 'txc-desc-risk', TXC.CRITERION, NA);
    selectField(root, 'Physician: gives the detailed information behind the opinion', 'txc-detail', TXC.CRITERION, NA);

    const ids = ['txc-path', 'txc-mi', 'txc-harm', 'txc-distress', 'txc-insight', 'txc-likely', 'txc-notime', 'txc-imminent', 'txc-restraint', 'txc-acceptable', 'txc-least', 'txc-desc-ill', 'txc-desc-risk', 'txc-detail'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = TXC.txEmergencyDetentionCriteria({
        path: val('txc-path'), mentalIllness: val('txc-mi'), harmRisk: val('txc-harm'), distress: val('txc-distress'), insight: val('txc-insight'),
        likelyHarm: val('txc-likely'), noTime: val('txc-notime'), imminent: val('txc-imminent'), restraintNeeded: val('txc-restraint'),
        acceptable: val('txc-acceptable'), leastRestrictive: val('txc-least'), describesIllness: val('txc-desc-ill'),
        describesRisk: val('txc-desc-risk'), detailedInfo: val('txc-detail'),
      });
      if (!r.valid) { note(o, r.message); return; }
      verdictRow(o, r);
      list(o, r.elements);
      list(o, r.subItems);
      note(o, r.basisNote);
      note(o, r.sb1164Note);
      note(o, r.postureNote);
    }));
  },
};
