// spec-v254 §2: renderers for the ENT / urology / psychiatry screening tools — the
// Reflux Symptom Index, the Lund-Mackay CT sinus score, the bladder-outlet-
// obstruction indices, and the Fagerstrom nicotine-dependence test. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/enturopsych-v254.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
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
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
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
const S05 = [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']];
const S02 = [['0', '0 (none)'], ['1', '1 (partial)'], ['2', '2 (total)']];

export const renderers = {
  'reflux-symptom-index'(root) {
    note(root, 'Reflux Symptom Index (Belafsky 2002): 9 symptom items each 0-5, 0-45. > 13 suggests LPR. Near-neighbors: rfs-reflux-finding.');
    const items = [['rsi-1', 'hoarseness', 'Hoarseness / voice problem'], ['rsi-2', 'clearing', 'Throat clearing'], ['rsi-3', 'mucus', 'Excess mucus / postnasal drip'], ['rsi-4', 'swallowing', 'Difficulty swallowing'], ['rsi-5', 'cough1', 'Cough after eating or lying down'], ['rsi-6', 'breathing', 'Breathing difficulty / choking'], ['rsi-7', 'cough2', 'Troublesome / annoying cough'], ['rsi-8', 'globus', 'Globus / lump in throat'], ['rsi-9', 'heartburn', 'Heartburn / chest pain / reflux']];
    for (const [id, , label] of items) root.appendChild(select(`${label} (0-5)`, id, S05));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.refluxSymptomIndex(inp), 'RSI');
    }));
    postureNote(root);
  },
  'lund-mackay'(root) {
    note(root, 'Lund-Mackay CT score (1993): 5 sinuses x 0-2 per side + OMC 0/2 per side, 0-24. Near-neighbors: nose-scale.');
    const sinuses = [['lm-maxr', 'maxR', 'Maxillary (R)'], ['lm-aethr', 'aethR', 'Anterior ethmoid (R)'], ['lm-pethr', 'pethR', 'Posterior ethmoid (R)'], ['lm-sphr', 'sphR', 'Sphenoid (R)'], ['lm-frontr', 'frontR', 'Frontal (R)'], ['lm-maxl', 'maxL', 'Maxillary (L)'], ['lm-aethl', 'aethL', 'Anterior ethmoid (L)'], ['lm-pethl', 'pethL', 'Posterior ethmoid (L)'], ['lm-sphl', 'sphL', 'Sphenoid (L)'], ['lm-frontl', 'frontL', 'Frontal (L)']];
    for (const [id, , label] of sinuses) root.appendChild(select(label, id, S02));
    root.appendChild(check('Ostiomeatal complex occluded, right (2)', 'lm-omcr'));
    root.appendChild(check('Ostiomeatal complex occluded, left (2)', 'lm-omcl'));
    const o = out(); root.appendChild(o);
    wire([...sinuses.map((i) => i[0]), 'lm-omcr', 'lm-omcl'], () => safe(o, () => {
      const inp = {}; for (const [id, key] of sinuses) inp[key] = val(id);
      inp.omcR = chk('lm-omcr'); inp.omcL = chk('lm-omcl');
      render(o, M.lundMackay(inp), 'Lund-Mackay');
    }));
    postureNote(root);
  },
  'bladder-outlet-obstruction-index'(root) {
    note(root, 'BOOI = PdetQmax - 2 x Qmax (> 40 obstructed); BCI = PdetQmax + 5 x Qmax (100-150 normal). Near-neighbors: ipss.');
    root.appendChild(numInput('Detrusor pressure at max flow (PdetQmax, cmH2O)', 'boo-pdet', { min: '0' }));
    root.appendChild(numInput('Maximum flow rate (Qmax, mL/s)', 'boo-qmax', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['boo-pdet', 'boo-qmax'], () => safe(o, () => {
      render(o, M.bladderOutletObstructionIndex({ pdet: val('boo-pdet'), qmax: val('boo-qmax') }), 'BOOI');
    }));
    postureNote(root);
  },
  'fagerstrom-ftnd'(root) {
    note(root, 'Fagerstrom Test for Nicotine Dependence (1991): 6 items, 0-10. 6-7 high, 8-10 very high dependence. Near-neighbors: auditc.');
    root.appendChild(select('Time to first cigarette', 'ftnd-time', [['3', '<= 5 min (3)'], ['2', '6-30 min (2)'], ['1', '31-60 min (1)'], ['0', '> 60 min (0)']]));
    root.appendChild(check('Hard to refrain in forbidden places (1)', 'ftnd-refrain'));
    root.appendChild(check('First-of-morning cigarette is hardest to give up (1)', 'ftnd-morning'));
    root.appendChild(select('Cigarettes per day', 'ftnd-perday', [['0', '<= 10 (0)'], ['1', '11-20 (1)'], ['2', '21-30 (2)'], ['3', '>= 31 (3)']]));
    root.appendChild(check('Smoke more in the first hours after waking (1)', 'ftnd-more'));
    root.appendChild(check('Smoke when ill in bed (1)', 'ftnd-ill'));
    const o = out(); root.appendChild(o);
    wire(['ftnd-time', 'ftnd-refrain', 'ftnd-morning', 'ftnd-perday', 'ftnd-more', 'ftnd-ill'], () => safe(o, () => {
      render(o, M.fagerstromFtnd({ timeToFirst: val('ftnd-time'), refrain: chk('ftnd-refrain'), firstMorning: chk('ftnd-morning'), perDay: val('ftnd-perday'), moreMorning: chk('ftnd-more'), whenIll: chk('ftnd-ill') }), 'FTND');
    }));
    postureNote(root);
  },
};
