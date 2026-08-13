// spec-v727 §2: renderer for fois — the Functional Oral Intake Scale (Clinical Scoring &
// Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. One select (level
// 1-7); decision logic returns the FOIS level and its description.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fois-v727.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. FOIS documents the current functional oral intake and tracks change; it does not prescribe a diet. It supports rather than replaces the swallowing evaluation and clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const LEVELS = [
  ['1', 'Level 1 — No oral intake'],
  ['2', 'Level 2 — Tube-dependent, minimal/inconsistent oral intake'],
  ['3', 'Level 3 — Tube supplements with consistent oral intake'],
  ['4', 'Level 4 — Total oral intake of a single consistency'],
  ['5', 'Level 5 — Total oral intake, multiple consistencies, special prep'],
  ['6', 'Level 6 — Total oral intake, avoid specific foods/liquids'],
  ['7', 'Level 7 — Total oral intake, no restrictions'],
];

export const renderers = {
  'fois'(root) {
    note(root, 'Functional Oral Intake Scale (Crary 2005): a 7-level ordinal scale of oral intake in dysphagia. Levels 1–3 involve tube feeding; 4–7 are total oral intake. Higher = less restricted.');
    root.appendChild(selectField('Functional level of oral intake', 'fois-level', CHOICE(LEVELS)));
    const ids = ['fois-level'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.fois({ level: val('fois-level') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Level', value: `${r.level} of 7` },
        { label: 'Route', value: r.tubeDependent ? 'tube + oral' : 'total oral' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
