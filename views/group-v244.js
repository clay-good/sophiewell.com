// spec-v244 §2: renderers for the sports-medicine / MSK measures — the Lysholm
// knee score, the Marx activity rating scale, the Foot Posture Index, and the
// Balance Error Scoring System. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sportsmsk-v244.js';
import { resultRow } from '../lib/result-copy.js';

function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: '1', inputmode: 'numeric', ...attrs }));
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
const MARX = [['0', '< 1 time/month (0)'], ['1', '1 time/month (1)'], ['2', '1 time/week (2)'], ['3', '2-3 times/week (3)'], ['4', '>= 4 times/week (4)']];
const FPI5 = [['-2', '-2'], ['-1', '-1'], ['0', '0'], ['1', '+1'], ['2', '+2']];

export const renderers = {
  'lysholm-knee-score'(root) {
    note(root, 'Lysholm knee score (Lysholm & Gillquist 1982): 8 items, 0-100. >= 95 excellent, 84-94 good, 65-83 fair, < 65 poor. Near-neighbors: marx-activity-rating.');
    root.appendChild(select('Limp', 'lys-limp', [['5', 'None (5)'], ['3', 'Slight / periodic (3)'], ['0', 'Severe / constant (0)']]));
    root.appendChild(select('Support', 'lys-support', [['5', 'None (5)'], ['2', 'Stick or crutch (2)'], ['0', 'Weight-bearing impossible (0)']]));
    root.appendChild(select('Locking', 'lys-lock', [['15', 'None (15)'], ['10', 'Catching, no locking (10)'], ['6', 'Occasional locking (6)'], ['2', 'Frequent locking (2)'], ['0', 'Locked at exam (0)']]));
    root.appendChild(select('Instability (giving way)', 'lys-instab', [['25', 'Never (25)'], ['20', 'Rarely, athletics (20)'], ['15', 'Frequently, athletics (15)'], ['10', 'Occasionally, daily (10)'], ['5', 'Often, daily (5)'], ['0', 'Every step (0)']]));
    root.appendChild(select('Pain', 'lys-pain', [['25', 'None (25)'], ['20', 'Slight, heavy exertion (20)'], ['15', 'Marked, heavy exertion (15)'], ['10', 'Marked after > 2 km (10)'], ['5', 'Marked after < 2 km (5)'], ['0', 'Constant (0)']]));
    root.appendChild(select('Swelling', 'lys-swell', [['10', 'None (10)'], ['6', 'With heavy exertion (6)'], ['2', 'With ordinary exertion (2)'], ['0', 'Constant (0)']]));
    root.appendChild(select('Stair climbing', 'lys-stair', [['10', 'No problem (10)'], ['6', 'Slightly impaired (6)'], ['2', 'One step at a time (2)'], ['0', 'Unable (0)']]));
    root.appendChild(select('Squatting', 'lys-squat', [['5', 'No problem (5)'], ['4', 'Slightly impaired (4)'], ['2', 'Not past 90 deg (2)'], ['0', 'Unable (0)']]));
    const o = out(); root.appendChild(o);
    wire(['lys-limp', 'lys-support', 'lys-lock', 'lys-instab', 'lys-pain', 'lys-swell', 'lys-stair', 'lys-squat'], () => safe(o, () => {
      render(o, M.lysholm({ limp: val('lys-limp'), support: val('lys-support'), locking: val('lys-lock'), instability: val('lys-instab'), pain: val('lys-pain'), swelling: val('lys-swell'), stair: val('lys-stair'), squat: val('lys-squat') }), 'Lysholm');
    }));
    postureNote(root);
  },
  'marx-activity-rating'(root) {
    note(root, 'Marx activity rating (Marx 2001): running, cutting, deceleration, pivoting, each 0-4 by frequency. Total 0-16; higher = more knee demand. Near-neighbors: lysholm-knee-score.');
    root.appendChild(select('Running', 'marx-run', MARX));
    root.appendChild(select('Cutting', 'marx-cut', MARX));
    root.appendChild(select('Deceleration', 'marx-dec', MARX));
    root.appendChild(select('Pivoting', 'marx-piv', MARX));
    const o = out(); root.appendChild(o);
    wire(['marx-run', 'marx-cut', 'marx-dec', 'marx-piv'], () => safe(o, () => {
      render(o, M.marxActivity({ running: val('marx-run'), cutting: val('marx-cut'), deceleration: val('marx-dec'), pivoting: val('marx-piv') }), 'Marx');
    }));
    postureNote(root);
  },
  'foot-posture-index'(root) {
    note(root, 'Foot Posture Index (Redmond 2006): 6 observations each -2..+2, total -12..+12. +6..+9 pronated, -1..-4 supinated. Near-neighbors: bess-balance-error.');
    const items = [['fpi-talar', 'talar', 'Talar-head palpation'], ['fpi-supra', 'supra', 'Supra/infra-lateral malleolar curvature'], ['fpi-calc', 'calcaneal', 'Calcaneal inversion/eversion'], ['fpi-tn', 'talonavicular', 'Talonavicular bulge'], ['fpi-arch', 'arch', 'Medial-arch congruence'], ['fpi-fore', 'forefoot', 'Forefoot abduction/adduction']];
    for (const [id, , label] of items) root.appendChild(select(`${label} (-2 to +2)`, id, FPI5));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.footPostureIndex(inp), 'FPI');
    }));
    postureNote(root);
  },
  'bess-balance-error'(root) {
    note(root, 'Balance Error Scoring System (Riemann & Guskiewicz 1999): errors (max 10) across 6 stances on firm/foam, eyes closed. Total 0-60. Near-neighbors: foot-posture-index.');
    const items = [['bess-df', 'dlFirm', 'Double-leg, firm'], ['bess-sf', 'slFirm', 'Single-leg, firm'], ['bess-tf', 'tandemFirm', 'Tandem, firm'], ['bess-dm', 'dlFoam', 'Double-leg, foam'], ['bess-sm', 'slFoam', 'Single-leg, foam'], ['bess-tm', 'tandemFoam', 'Tandem, foam']];
    for (const [id, , label] of items) root.appendChild(numInput(`${label} — errors (0-10)`, id, { min: '0', max: '10' }));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.bess(inp), 'BESS');
    }));
    postureNote(root);
  },
};
