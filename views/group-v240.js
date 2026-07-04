// spec-v240 §2: renderers for the palliative / rehabilitation functional measures
// — ESAS, the Rivermead Mobility Index, the predicted 6-minute walk distance, and
// QuickDASH. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rehab-v240.js';
import { resultRow } from '../lib/result-copy.js';

function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}
const S15 = [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']];
const SEX = [['male', 'Male'], ['female', 'Female']];

export const renderers = {
  'esas-symptom-assessment'(root) {
    note(root, 'ESAS (Bruera 1991): 9 symptoms each 0-10, total 0-90. Higher = greater symptom burden. Near-neighbors: ecog-karnofsky.');
    const items = [['esas-pain', 'pain', 'Pain'], ['esas-tired', 'tiredness', 'Tiredness'], ['esas-drowsy', 'drowsiness', 'Drowsiness'], ['esas-nausea', 'nausea', 'Nausea'], ['esas-appetite', 'appetite', 'Lack of appetite'], ['esas-dyspnea', 'dyspnea', 'Shortness of breath'], ['esas-depression', 'depression', 'Depression'], ['esas-anxiety', 'anxiety', 'Anxiety'], ['esas-wellbeing', 'wellbeing', 'Wellbeing']];
    for (const [id, , label] of items) root.appendChild(numInput(`${label} (0-10)`, id, { min: '0', max: '10' }));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.esas(inp), 'ESAS');
    }));
    postureNote(root);
  },
  'rivermead-mobility-index'(root) {
    note(root, 'Rivermead Mobility Index (Collen 1991): 15 mobility items, each achieved = 1. Total 0-15; higher = more independent. Near-neighbors: barthel.');
    root.appendChild(numInput('Number of items achieved (0-15)', 'rmi-count', { min: '0', max: '15' }));
    const o = out(); root.appendChild(o);
    wire(['rmi-count'], () => safe(o, () => {
      render(o, M.rivermead({ count: val('rmi-count') }), 'RMI');
    }));
    postureNote(root);
  },
  'six-minute-walk-predicted'(root) {
    note(root, 'Predicted 6-minute walk (Enright-Sherrill 1998): sex-specific equation from height, age, weight. Lower limit = predicted - 153 m (men) / - 139 m (women). Near-neighbors: bode-index.');
    root.appendChild(select('Sex', 'smwd-sex', SEX));
    root.appendChild(numInput('Height (cm)', 'smwd-height', { min: '0' }));
    root.appendChild(numInput('Age (years)', 'smwd-age', { min: '0' }));
    root.appendChild(numInput('Weight (kg)', 'smwd-weight', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['smwd-sex', 'smwd-height', 'smwd-age', 'smwd-weight'], () => safe(o, () => {
      render(o, M.sixMinuteWalkPredicted({ sex: val('smwd-sex'), height: val('smwd-height'), age: val('smwd-age'), weight: val('smwd-weight') }), '6MWD');
    }));
    postureNote(root);
  },
  'quickdash'(root) {
    note(root, 'QuickDASH (Institute for Work & Health): 11 items each 1-5; score = [(mean) - 1] x 25. Higher = more upper-limb disability. Near-neighbors: rivermead-mobility-index.');
    const items = [['qd-1', 'i1', '1. Open a tight jar'], ['qd-2', 'i2', '2. Heavy household chores'], ['qd-3', 'i3', '3. Carry a shopping bag'], ['qd-4', 'i4', '4. Wash your back'], ['qd-5', 'i5', '5. Use a knife'], ['qd-6', 'i6', '6. Recreational activities'], ['qd-7', 'i7', '7. Social activities limited'], ['qd-8', 'i8', '8. Work / daily activities limited'], ['qd-9', 'i9', '9. Arm/shoulder/hand pain'], ['qd-10', 'i10', '10. Tingling'], ['qd-11', 'i11', '11. Difficulty sleeping']];
    for (const [id, , label] of items) root.appendChild(select(`${label} (1 none - 5 severe)`, id, S15));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.quickDash(inp), 'QuickDASH');
    }));
    postureNote(root);
  },
};
