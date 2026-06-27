// spec-v166 §2: renderers for the two pharmacy tiles of the spec-v162
// Cross-Discipline Completion program — pkSuite (generic first-order PK) and
// chlorpromazineEquivalents (antipsychotic CPZ-equivalent dose). Both Medication
// & Infusion (Group F). (lithium-maintenance deferred per spec-v97 — see
// lib/pk-v166.js header.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Every PK
// division (F, Vd, CL) and the equivalence lookup are guarded in lib/pk-v166.js
// (a blank / non-finite / zero-denominator input renders a surfaced
// complete-the-fields fallback, never NaN / Infinity). Per the spec-v50 §3
// posture note each tile defers the decision to the clinician (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pk-v166.js';
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
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal', ...attrs });
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. PK estimates and equivalence conversions are approximations requiring individualization and therapeutic monitoring; the value is the cited source’s, computed from the values you enter. The dosing decision stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CPZ_AGENT_OPTS = [
  { value: 'chlorpromazine', text: 'Chlorpromazine (100 mg)' },
  { value: 'haloperidol', text: 'Haloperidol (2 mg)' },
  { value: 'risperidone', text: 'Risperidone (2 mg)' },
  { value: 'olanzapine', text: 'Olanzapine (5 mg)' },
  { value: 'quetiapine', text: 'Quetiapine (75 mg)' },
  { value: 'ziprasidone', text: 'Ziprasidone (60 mg)' },
  { value: 'aripiprazole', text: 'Aripiprazole (7.5 mg)' },
];

export const renderers = {
  // ----- 2.1 pk-suite --------------------------------------------------------
  'pk-suite'(root) {
    note(root, 'Pharmacokinetics suite (Rowland & Tozer): loading dose = Vd·Cp/F; maintenance = CL·Css·τ/F; k = CL/Vd; half-life = 0.693·Vd/CL; steady state ≈ 5·t½. Each relation is computed only from the inputs you supply. Near-neighbors: vanc-auc, opioid-mme.');
    root.appendChild(num('Volume of distribution Vd (L)', 'pk-vd'));
    root.appendChild(num('Clearance CL (L/h)', 'pk-cl'));
    root.appendChild(num('Target / desired concentration Cp or Css (mg/L)', 'pk-cp'));
    root.appendChild(num('Bioavailability F (0–1) — default 1 (IV)', 'pk-f', { max: '1' }));
    root.appendChild(num('Dosing interval τ (h) — for the maintenance dose', 'pk-tau'));
    const o = out(); root.appendChild(o);
    wire(['pk-vd', 'pk-cl', 'pk-cp', 'pk-f', 'pk-tau'], () => safe(o, () => {
      const r = M.pkSuite({ vd: val('pk-vd'), cl: val('pk-cl'), cp: val('pk-cp'), f: val('pk-f'), tau: val('pk-tau') });
      if (!r.valid) { showInvalid(o, r); return; }
      const items = [{ text: r.band }];
      if (r.halfLife !== null) items.push({ label: 'Half-life', value: `${r.halfLife} h` });
      if (r.steadyState !== null) items.push({ label: 'Steady state', value: `${r.steadyState} h` });
      if (r.k !== null) items.push({ label: 'k', value: `${r.k} /h` });
      if (r.loading !== null) items.push({ label: 'Loading dose', value: `${r.loading} mg` });
      if (r.maintenance !== null) items.push({ label: 'Maintenance', value: `${r.maintenance} mg` });
      resultRow(o, items);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 chlorpromazine-equivalents --------------------------------------
  'chlorpromazine-equivalents'(root) {
    note(root, 'Antipsychotic chlorpromazine equivalents (Woods 2003): CPZ-equivalent mg = daily dose × (100 / agent factor), where the factor is the daily mg ≈ 100 mg chlorpromazine. Equivalence methods differ (DDD, consensus, Woods) and conversions are approximations. Near-neighbors: opioid-mme, benzo-equiv.');
    root.appendChild(pickField('Antipsychotic agent (Woods factor)', 'cpz-agent', CPZ_AGENT_OPTS));
    root.appendChild(num('Total daily dose (mg)', 'cpz-dose'));
    const o = out(); root.appendChild(o);
    wire(['cpz-agent', 'cpz-dose'], () => safe(o, () => {
      const r = M.chlorpromazineEquivalents({ agent: val('cpz-agent'), dose: val('cpz-dose') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'CPZ equivalent', value: `${r.cpzEq} mg` },
        { label: 'Agent factor', value: `${r.factor} mg ≈ 100 mg CPZ` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
