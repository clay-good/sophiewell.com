// spec-v660 §2: renderer for pass-pheo — the PASS pheochromocytoma histologic score
// (Clinical Scoring & Risk, Group G). Companion to the built GAPP grade.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Twelve
// present/absent feature checkboxes; the weighted sum is 0-20 and >= 4 flags potential
// for aggressive behavior.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pass-pheo-v660.js';
import { resultRow } from '../lib/result-copy.js';

const DOM = {
  largeNests: 'pass-nests', necrosis: 'pass-necrosis', highCellularity: 'pass-cellularity',
  cellularMonotony: 'pass-monotony', spindling: 'pass-spindling', mitosesHigh: 'pass-mitoses',
  atypicalMitoses: 'pass-atypical', adiposeExtension: 'pass-adipose', vascularInvasion: 'pass-vascular',
  capsularInvasion: 'pass-capsular', pleomorphism: 'pass-pleomorphism', hyperchromasia: 'pass-hyperchromasia',
};

function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. PASS has documented poor interobserver reproducibility, so it is a risk-stratification aid — a low score is reassuring — rather than a definitive malignancy call; it is read with the full pathology report by the reporting pathologist.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'pass-pheo'(root) {
    note(root, 'PASS (Pheochromocytoma of the Adrenal gland Scaled Score, Thompson 2002): mark the histologic features present. Eight features are worth 2 points and four are worth 1, summed 0-20. PASS 4 or more indicates potential for biologically aggressive behavior; under 4 behaves benignly.');
    for (const f of M.PASS_FEATURES) root.appendChild(checkField(`${f.label} (+${f.points})`, DOM[f.key]));
    const ids = M.PASS_FEATURES.map((f) => DOM[f.key]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const f of M.PASS_FEATURES) input[f.key] = chk(DOM[f.key]);
      const r = M.passPheo(input);
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.total}/20` },
        { label: 'Cutoff', value: r.aggressive ? '>= 4' : '< 4' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
