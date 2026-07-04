// spec-v241 §2: renderers for the geriatric assessment tools — the Groningen
// Frailty Indicator, the Short Physical Performance Battery, the Osteoporosis
// Self-assessment Tool, and the five-times sit-to-stand test. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/geri-v241.js';
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
const S04 = [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']];

export const renderers = {
  'groningen-frailty-indicator'(root) {
    note(root, 'Groningen Frailty Indicator (Steverink 2001): 15 items across physical, cognitive, social, psychological domains. >= 4 indicates frailty. Near-neighbors: sof-frailty-index.');
    root.appendChild(numInput('Total items positive (0-15)', 'gfi-count', { min: '0', max: '15' }));
    const o = out(); root.appendChild(o);
    wire(['gfi-count'], () => safe(o, () => {
      render(o, M.groningen({ count: val('gfi-count') }), 'GFI');
    }));
    postureNote(root);
  },
  'short-physical-performance-battery'(root) {
    note(root, 'SPPB (Guralnik 1994): balance, gait speed, and chair stands, each 0-4. Total 0-12; < 10 mobility limitation. Near-neighbors: gait-speed.');
    root.appendChild(select('Balance sub-score (0-4)', 'sppb-balance', S04));
    root.appendChild(select('4-meter gait-speed sub-score (0-4)', 'sppb-gait', S04));
    root.appendChild(select('Chair-stand sub-score (0-4)', 'sppb-chair', S04));
    const o = out(); root.appendChild(o);
    wire(['sppb-balance', 'sppb-gait', 'sppb-chair'], () => safe(o, () => {
      render(o, M.sppb({ balance: val('sppb-balance'), gait: val('sppb-gait'), chair: val('sppb-chair') }), 'SPPB');
    }));
    postureNote(root);
  },
  'osteoporosis-self-assessment-tool'(root) {
    note(root, 'OST (Koh 2001) = (weight kg - age years) x 0.2, truncated. > -1 low, -1 to -4 moderate, < -4 high risk of low bone density. Near-neighbors: osteoporosis-prescreen.');
    root.appendChild(numInput('Weight (kg)', 'ost-weight', { min: '0' }));
    root.appendChild(numInput('Age (years)', 'ost-age', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ost-weight', 'ost-age'], () => safe(o, () => {
      render(o, M.ost({ weight: val('ost-weight'), age: val('ost-age') }), 'OST');
    }));
    postureNote(root);
  },
  'five-times-sit-to-stand'(root) {
    note(root, 'Five-times sit-to-stand (Csuka & McCarty 1985): time for five sit-to-stand cycles, arms folded. >= 12 s increased fall risk, >= 15 s recurrent-faller risk. Near-neighbors: chair-stand-30s.');
    root.appendChild(numInput('Time for five sit-to-stand cycles (seconds)', 'ftsts-time', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ftsts-time'], () => safe(o, () => {
      render(o, M.fiveTimesSitToStand({ time: val('ftsts-time') }), '5xSTS');
    }));
    postureNote(root);
  },
};
