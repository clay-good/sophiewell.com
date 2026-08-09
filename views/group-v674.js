// spec-v674 §2: renderer for osi-onychomycosis — the Onychomycosis Severity Index
// (Clinical Scoring & Risk, Group G). Companion to the built dermatology severity
// indices (pasi, easi, scorad, napsi).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two selects
// (area 0-5, proximity 1-5) plus one checkbox (dermatophytoma/hyperkeratosis bonus);
// area x proximity + 10 -> total 0-35 -> none/mild/moderate/severe.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/osi-onychomycosis-v674.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ` ${label}` }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. OSI grades a single fungal nail to standardize severity and track response to therapy; because area and proximity are multiplied, an area score of 0 yields a total of 0. It is a grading instrument, not a treatment order.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];

const AREA_OPTS = [['0', '0 — no involvement (0%)'], ['1', '1 — 1–10%'], ['2', '2 — 11–25%'], ['3', '3 — 26–50%'], ['4', '4 — 51–75%'], ['5', '5 — > 75%']];
const PROX_OPTS = [['1', '1 — distal quarter'], ['2', '2 — second quarter'], ['3', '3 — third quarter'], ['4', '4 — proximal quarter'], ['5', '5 — matrix involvement']];

export const renderers = {
  'osi-onychomycosis'(root) {
    note(root, 'Onychomycosis Severity Index (Carney 2011): area of involvement (0–5) × proximity to the nail matrix (1–5), plus 10 points if a dermatophytoma or > 2 mm subungual hyperkeratosis is present. Total 0–35: 0 none, 1–5 mild, 6–15 moderate, 16–35 severe. Companion tiles: napsi, pasi.');
    root.appendChild(selectField('Area of involvement', 'osi-area', CHOICE(AREA_OPTS)));
    root.appendChild(selectField('Proximity of disease to the matrix', 'osi-prox', CHOICE(PROX_OPTS)));
    root.appendChild(checkField('Dermatophytoma (streak/patch) or > 2 mm subungual hyperkeratosis (+10)', 'osi-bonus'));
    const ids = ['osi-area', 'osi-prox', 'osi-bonus'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.osiOnychomycosis({ area: val('osi-area'), proximity: val('osi-prox'), bonus: checked('osi-bonus') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/35` },
        { label: 'Category', value: r.category },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
