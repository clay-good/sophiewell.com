// spec-v648 §2: renderer for weiss-adrenal — the Weiss system for adrenocortical
// carcinoma (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Nine
// histopathologic checkboxes; the lib counts them and applies the >= 3 malignancy
// threshold. The two easy-to-invert definitions (mitoses > 5/50 HPF, clear cells
// <= 25%) are spelled out in the labels.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/weiss-v648.js';
import { resultRow } from '../lib/result-copy.js';

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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Weiss score is a pathologist’s diagnostic aid applied to a resected adrenocortical specimen, computed from the histopathologic criteria you entered; it does not replace full pathologic review, immunohistochemistry, or clinical correlation. The diagnosis stays with the pathologist and team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const FIELDS = [
  { key: 'nuclearGrade', dom: 'weiss-grade', label: 'High nuclear grade (Fuhrman III-IV)' },
  { key: 'mitoticRate', dom: 'weiss-mitoses', label: 'Mitotic rate > 5 per 50 HPF (strictly more than 5)' },
  { key: 'atypicalMitoses', dom: 'weiss-atypical', label: 'Atypical mitotic figures' },
  { key: 'clearCells', dom: 'weiss-clear', label: 'Clear (lipid-rich) cells ≤ 25% of the tumor' },
  { key: 'diffuseArchitecture', dom: 'weiss-diffuse', label: 'Diffuse architecture (> 33% of the tumor)' },
  { key: 'necrosis', dom: 'weiss-necrosis', label: 'Necrosis' },
  { key: 'venousInvasion', dom: 'weiss-venous', label: 'Venous invasion' },
  { key: 'sinusoidalInvasion', dom: 'weiss-sinusoidal', label: 'Sinusoidal invasion' },
  { key: 'capsularInvasion', dom: 'weiss-capsular', label: 'Capsular invasion' },
];

export const renderers = {
  'weiss-adrenal'(root) {
    note(root, 'Weiss system (Weiss 1984; modified 1989): distinguishes adrenocortical carcinoma from a benign adenoma. Nine histopathologic criteria, 1 point each; ≥ 3 indicates carcinoma, 0-2 a benign adenoma. Note the two easy-to-invert definitions below. Near-neighbor: adrenal-ct-washout.');
    for (const f of FIELDS) root.appendChild(checkField(f.label, f.dom));
    const ids = FIELDS.map((f) => f.dom);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const f of FIELDS) input[f.key] = chk(f.dom);
      const r = M.weissAdrenal(input);
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/9` },
        { label: 'Read', value: r.malignant ? 'Carcinoma' : 'Adenoma' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
