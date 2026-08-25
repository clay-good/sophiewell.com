// spec-v672 §2: renderer for mda-psoriatic — Minimal Disease Activity (MDA) in
// psoriatic arthritis (Clinical Scoring & Risk, Group G). Companion to the built
// psoriatic-arthritis tiles (dapsa, caspar, pest).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Seven
// criterion checkboxes (each a documented threshold); >= 5 of 7 = MDA, 7/7 = VLDA.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mda-psoriatic-v672.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ` ${label}` }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. MDA is a treat-to-target state (at least 5 of 7 criteria); VLDA is all 7. The pain and global scores are on 0-100 mm scales, not 0-10. Confirm each criterion against its measured value; the target informs care and is not by itself an order to change therapy.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ITEMS = [
  ['mda-tjc', 'Tender joint count (68-joint) ≤ 1'],
  ['mda-sjc', 'Swollen joint count (66-joint) ≤ 1'],
  ['mda-skin', 'PASI ≤ 1 or body surface area ≤ 3%'],
  ['mda-pain', 'Patient pain ≤ 15 (0–100 mm VAS)'],
  ['mda-global', 'Patient global disease activity ≤ 20 (0–100 mm VAS)'],
  ['mda-haq', 'HAQ ≤ 0.5'],
  ['mda-entheses', 'Tender entheseal points ≤ 1'],
];

export const renderers = {
  'mda-psoriatic'(root) {
    note(root, 'Minimal Disease Activity (MDA) in psoriatic arthritis (Coates 2010): check each criterion that is met. ≥ 5 of 7 = MDA; all 7 = Very Low Disease Activity (VLDA).');
    for (const [id, label] of ITEMS) root.appendChild(checkField(label, id));
    const ids = ITEMS.map(([id]) => id);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.mdaPsoriatic({
        tjc: checked('mda-tjc'), sjc: checked('mda-sjc'), skin: checked('mda-skin'),
        pain: checked('mda-pain'), global: checked('mda-global'), haq: checked('mda-haq'),
        entheses: checked('mda-entheses'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Criteria met', value: `${r.count}/7` },
        { label: 'State', value: r.vlda ? 'VLDA' : (r.mda ? 'MDA' : 'active') },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
