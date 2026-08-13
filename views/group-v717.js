// spec-v717 §2: renderer for pederson-difficulty — the Pederson Difficulty Index (Clinical
// Scoring & Risk, Group G). Dentistry / oral-surgery vein.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three selects
// (angulation, depth, ramus); the sum 3-10 maps to a difficulty band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pederson-difficulty-v717.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Pederson index predicts surgical difficulty to guide planning; it does not dictate technique or referral. It supports rather than replaces the surgical assessment and clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const ANGULATION = [['1', 'Mesioangular'], ['2', 'Horizontal / transverse'], ['3', 'Vertical'], ['4', 'Distoangular']];
const DEPTH = [['1', 'Level A (high / shallow)'], ['2', 'Level B (mid)'], ['3', 'Level C (deep)']];
const RAMUS = [['1', 'Class I (sufficient space)'], ['2', 'Class II (reduced space)'], ['3', 'Class III (no space)']];

export const renderers = {
  'pederson-difficulty'(root) {
    note(root, 'Pederson Difficulty Index (Pederson 1988): predicts difficulty of impacted lower third-molar removal. Angulation + depth + ramus, summed 3–10. Bands: 3–4 slight, 5–6 moderate, 7–10 very difficult.');
    root.appendChild(selectField('Angulation (Winter)', 'ped-angulation', CHOICE(ANGULATION)));
    root.appendChild(selectField('Depth (Pell & Gregory)', 'ped-depth', CHOICE(DEPTH)));
    root.appendChild(selectField('Ramus relationship / space (Pell & Gregory)', 'ped-ramus', CHOICE(RAMUS)));
    const ids = ['ped-angulation', 'ped-depth', 'ped-ramus'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.pedersonDifficulty({ angulation: val('ped-angulation'), depth: val('ped-depth'), ramus: val('ped-ramus') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/10` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
