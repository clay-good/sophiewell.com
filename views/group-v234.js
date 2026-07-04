// spec-v234 §2: renderers for the dermatology scoring indices — MASI, SALT,
// NAPSI (per target nail), and the Vancouver Scar Scale. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/dermscore-v234.js';
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

const AREA6 = [['0', '0 (none)'], ['1', '1 (<10%)'], ['2', '2 (10-29%)'], ['3', '3 (30-49%)'], ['4', '4 (50-69%)'], ['5', '5 (70-89%)'], ['6', '6 (90-100%)']];
const DH4 = [['0', '0 (absent)'], ['1', '1 (slight)'], ['2', '2 (mild)'], ['3', '3 (marked)'], ['4', '4 (maximum)']];
const Q4 = [['0', '0 quadrants'], ['1', '1 quadrant'], ['2', '2 quadrants'], ['3', '3 quadrants'], ['4', '4 quadrants']];

export const renderers = {
  'masi'(root) {
    note(root, 'MASI (Kimbrough-Green 1994): forehead, right malar, left malar (x 0.3) and chin (x 0.1); each region Area 0-6 and Darkness + Homogeneity 0-4. Range 0-48. Near-neighbors: pasi, easi.');
    const regions = [['f', 'Forehead'], ['rmr', 'Right malar'], ['lmr', 'Left malar'], ['m', 'Chin']];
    const ids = [];
    for (const [k, label] of regions) {
      root.appendChild(select(`${label} — Area (0-6)`, `masi-${k}A`, AREA6));
      root.appendChild(select(`${label} — Darkness (0-4)`, `masi-${k}D`, DH4));
      root.appendChild(select(`${label} — Homogeneity (0-4)`, `masi-${k}H`, DH4));
      ids.push(`masi-${k}A`, `masi-${k}D`, `masi-${k}H`);
    }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const inp = {};
      for (const [k] of regions) { inp[`${k}A`] = val(`masi-${k}A`); inp[`${k}D`] = val(`masi-${k}D`); inp[`${k}H`] = val(`masi-${k}H`); }
      render(o, M.masi(inp), 'MASI');
    }));
    postureNote(root);
  },
  'salt-score'(root) {
    note(root, 'SALT (Olsen 2004): % terminal hair loss per scalp region weighted top 0.40, back 0.24, right 0.18, left 0.18. Range 0-100 with S0-S5 bands. Near-neighbors: pasi.');
    root.appendChild(numInput('Top of scalp — % hair loss (0-100)', 'salt-top', { min: '0', max: '100' }));
    root.appendChild(numInput('Back of scalp — % hair loss (0-100)', 'salt-back', { min: '0', max: '100' }));
    root.appendChild(numInput('Right side — % hair loss (0-100)', 'salt-right', { min: '0', max: '100' }));
    root.appendChild(numInput('Left side — % hair loss (0-100)', 'salt-left', { min: '0', max: '100' }));
    const o = out(); root.appendChild(o);
    wire(['salt-top', 'salt-back', 'salt-right', 'salt-left'], () => safe(o, () => {
      render(o, M.saltScore({ top: val('salt-top'), back: val('salt-back'), right: val('salt-right'), left: val('salt-left') }), 'SALT');
    }));
    postureNote(root);
  },
  'napsi'(root) {
    note(root, 'NAPSI (Rich & Scher 2003), per target nail: matrix (0-4 quadrants with pitting / leukonychia / red lunula / crumbling) + bed (0-4 quadrants with onycholysis / splinter / oil-drop / hyperkeratosis) = 0-8. Near-neighbors: pasi.');
    root.appendChild(select('Nail matrix — quadrants involved (0-4)', 'napsi-matrix', Q4));
    root.appendChild(select('Nail bed — quadrants involved (0-4)', 'napsi-bed', Q4));
    const o = out(); root.appendChild(o);
    wire(['napsi-matrix', 'napsi-bed'], () => safe(o, () => {
      render(o, M.napsi({ matrix: val('napsi-matrix'), bed: val('napsi-bed') }), 'NAPSI');
    }));
    postureNote(root);
  },
  'vancouver-scar-scale'(root) {
    note(root, 'Vancouver Scar Scale (Sullivan 1990): pigmentation 0-2, vascularity 0-3, pliability 0-5, height 0-3. Total 0-13; 0 = normal skin. Near-neighbors: lund-browder.');
    root.appendChild(select('Pigmentation', 'vss-pig', [['0', '0 (normal)'], ['1', '1 (hypopigmentation)'], ['2', '2 (hyperpigmentation)']]));
    root.appendChild(select('Vascularity', 'vss-vas', [['0', '0 (normal)'], ['1', '1 (pink)'], ['2', '2 (red)'], ['3', '3 (purple)']]));
    root.appendChild(select('Pliability', 'vss-pli', [['0', '0 (normal)'], ['1', '1 (supple)'], ['2', '2 (yielding)'], ['3', '3 (firm)'], ['4', '4 (ropes)'], ['5', '5 (contracture)']]));
    root.appendChild(select('Height', 'vss-ht', [['0', '0 (flat)'], ['1', '1 (< 2 mm)'], ['2', '2 (2-5 mm)'], ['3', '3 (> 5 mm)']]));
    const o = out(); root.appendChild(o);
    wire(['vss-pig', 'vss-vas', 'vss-pli', 'vss-ht'], () => safe(o, () => {
      render(o, M.vancouverScarScale({ pigmentation: val('vss-pig'), vascularity: val('vss-vas'), pliability: val('vss-pli'), height: val('vss-ht') }), 'VSS');
    }));
    postureNote(root);
  },
};
