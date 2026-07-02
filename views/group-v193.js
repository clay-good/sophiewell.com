// spec-v193 §2: renderers for the five acute-coronary / primary-PCI /
// cardiogenic-shock risk tiles — CRUSADE bleeding, SCAI SHOCK stage, Zwolle
// primary-PCI, TIMI Risk Index, and CADILLAC post-PCI mortality. Groups G
// (scores) and E (TIMI Risk Index math).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the revascularization / transfusion /
// mechanical-support / disposition decision to the treating team and patient
// (spec-v11 §5.3) — these stratify risk, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/acs-v193.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}
function num(label, id) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal' });
}
function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score or stage is the cited source’s, computed from the inputs you enter. The revascularization, transfusion, mechanical-support, and disposition decisions stay with the interventional team and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SEX_OPTS = [{ value: 'female', text: 'Female' }, { value: 'male', text: 'Male' }];
const KILLIP_OPTS = [{ value: '1', text: 'I (no failure)' }, { value: '2', text: 'II (rales / S3)' }, { value: '3-4', text: 'III–IV (edema / shock)' }];
const TIMI_FLOW_OPTS = [{ value: '3', text: '3 (normal flow)' }, { value: '2', text: '2 (partial)' }, { value: '0-1', text: '0–1 (no/minimal)' }];

export const renderers = {
  // ----- 2.1 crusade ---------------------------------------------------------
  crusade(root) {
    note(root, 'CRUSADE major-bleeding risk in NSTEMI (Subherwal 2009): eight weighted variables, incl. a U-shaped systolic-BP term (both low and high add points). Near-neighbors: hasbled, heart, timi.');
    root.appendChild(num('Baseline hematocrit (%)', 'crusade-hct'));
    root.appendChild(num('Creatinine clearance (mL/min)', 'crusade-crcl'));
    root.appendChild(num('Heart rate (bpm)', 'crusade-hr'));
    root.appendChild(pickField('Sex', 'crusade-sex', SEX_OPTS));
    root.appendChild(num('Systolic blood pressure (mmHg)', 'crusade-sbp'));
    root.appendChild(checkField('Signs of heart failure at presentation', 'crusade-chf'));
    root.appendChild(checkField('Prior vascular disease (PAD or stroke)', 'crusade-vasc'));
    root.appendChild(checkField('Diabetes mellitus', 'crusade-dm'));
    const o = out(); root.appendChild(o);
    wire(['crusade-hct', 'crusade-crcl', 'crusade-hr', 'crusade-sex', 'crusade-sbp', 'crusade-chf', 'crusade-vasc', 'crusade-dm'], () => safe(o, () => {
      const r = M.crusade({ hct: val('crusade-hct'), crcl: val('crusade-crcl'), hr: val('crusade-hr'), sex: val('crusade-sex'), sbp: val('crusade-sbp'), chf: chk('crusade-chf'), vasc: chk('crusade-vasc'), dm: chk('crusade-dm') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Score', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 scai-shock ------------------------------------------------------
  'scai-shock'(root) {
    note(root, 'SCAI SHOCK cardiogenic-shock stage (Naidu 2022; Kadosh/Kapur operationalization 2022): stage A→E from hypotension, lactate, and support level, with a cardiac-arrest modifier. A shared severity vocabulary. Near-neighbors: cardshock-score, lactate-clearance.');
    root.appendChild(num('Systolic blood pressure (mmHg)', 'scai-sbp'));
    root.appendChild(num('Serum lactate (mmol/L)', 'scai-lactate'));
    root.appendChild(pickField('Vasoactive / mechanical support', 'scai-support', [
      { value: 'none', text: 'None' },
      { value: 'one', text: 'One intervention (1 vasopressor/inotrope or 1 device)' },
      { value: 'multiple', text: 'Escalating (≥ 2 drugs/devices)' },
      { value: 'maximal', text: 'Maximal / refractory (> 3)' },
    ]));
    root.appendChild(checkField('Cardiac arrest / circulatory collapse', 'scai-arrest'));
    root.appendChild(checkField('Hypotension/hypoperfusion persisting despite initial support', 'scai-persist'));
    const o = out(); root.appendChild(o);
    wire(['scai-sbp', 'scai-lactate', 'scai-support', 'scai-arrest', 'scai-persist'], () => safe(o, () => {
      const r = M.scaiShock({ sbp: val('scai-sbp'), lactate: val('scai-lactate'), support: val('scai-support'), arrest: chk('scai-arrest'), persist: chk('scai-persist') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Stage', value: r.stage }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 zwolle-pci ------------------------------------------------------
  'zwolle-pci'(root) {
    note(root, 'Zwolle primary-PCI risk score (De Luca 2004): Killip, post-PCI TIMI flow, age ≥ 60, three-vessel disease, anterior MI, ischemic time > 4 h → 0–16; ≤ 3 low identifies an early-discharge candidate. Near-neighbors: killip, timi-stemi, grace.');
    root.appendChild(pickField('Killip class', 'zwolle-killip', KILLIP_OPTS));
    root.appendChild(pickField('Post-PCI TIMI flow', 'zwolle-timi', TIMI_FLOW_OPTS));
    root.appendChild(num('Age (years)', 'zwolle-age'));
    root.appendChild(checkField('Three-vessel disease', 'zwolle-3vd'));
    root.appendChild(checkField('Anterior infarction', 'zwolle-ant'));
    root.appendChild(checkField('Ischemic time > 4 hours', 'zwolle-time'));
    const o = out(); root.appendChild(o);
    wire(['zwolle-killip', 'zwolle-timi', 'zwolle-age', 'zwolle-3vd', 'zwolle-ant', 'zwolle-time'], () => safe(o, () => {
      const r = M.zwollePci({ killip: val('zwolle-killip'), timi: val('zwolle-timi'), age: val('zwolle-age'), threeVessel: chk('zwolle-3vd'), anterior: chk('zwolle-ant'), longIschemia: chk('zwolle-time') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Score', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 timi-risk-index -------------------------------------------------
  'timi-risk-index'(root) {
    note(root, 'TIMI Risk Index (Wiviott 2006; Morrow 2001): TRI = heart rate × (age / 10)² / systolic BP. A higher index marks higher mortality. Near-neighbors: timi, shock-index.');
    root.appendChild(num('Heart rate (bpm)', 'tri-hr'));
    root.appendChild(num('Age (years)', 'tri-age'));
    root.appendChild(num('Systolic blood pressure (mmHg)', 'tri-sbp'));
    const o = out(); root.appendChild(o);
    wire(['tri-hr', 'tri-age', 'tri-sbp'], () => safe(o, () => {
      const r = M.timiRiskIndex({ hr: val('tri-hr'), age: val('tri-age'), sbp: val('tri-sbp') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'TRI', value: `${r.value}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 cadillac-risk ---------------------------------------------------
  'cadillac-risk'(root) {
    note(root, 'CADILLAC post-PCI mortality risk (Halkin 2005): LVEF < 40%, CrCl < 60, Killip 2–3, post-PCI TIMI 0–2, age > 65, anemia, three-vessel disease → 0–18; low 0–2, intermediate 3–5, high ≥ 6. Near-neighbors: zwolle-pci, killip, grace.');
    root.appendChild(num('LVEF (%)', 'cad-lvef'));
    root.appendChild(num('Creatinine clearance (mL/min)', 'cad-crcl'));
    root.appendChild(num('Age (years)', 'cad-age'));
    root.appendChild(pickField('Killip class', 'cad-killip', [{ value: '1', text: 'I (no failure)' }, { value: '2-3', text: 'II–III' }]));
    root.appendChild(pickField('Post-PCI TIMI flow', 'cad-timi', [{ value: '3', text: '3 (normal flow)' }, { value: '0-2', text: '0–2 (impaired)' }]));
    root.appendChild(checkField('Anemia (Hct < 39% men / < 36% women)', 'cad-anemia'));
    root.appendChild(checkField('Three-vessel disease', 'cad-3vd'));
    const o = out(); root.appendChild(o);
    wire(['cad-lvef', 'cad-crcl', 'cad-age', 'cad-killip', 'cad-timi', 'cad-anemia', 'cad-3vd'], () => safe(o, () => {
      const r = M.cadillacRisk({ lvef: val('cad-lvef'), crcl: val('cad-crcl'), age: val('cad-age'), killip: val('cad-killip'), timi: val('cad-timi'), anemia: chk('cad-anemia'), threeVessel: chk('cad-3vd') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Score', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
