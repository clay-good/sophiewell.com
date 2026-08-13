// spec-v725 §2: renderer for glickman-furcation — the Glickman furcation involvement grade
// (Clinical Scoring & Risk, Group G). Dentistry vein.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. One select
// (furcation finding); decision logic returns the Glickman grade.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/glickman-furcation-v725.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Glickman grade describes the furcation defect to guide prognosis and the treatment plan; it does not prescribe a procedure. It supports rather than replaces the periodontal examination and clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const FURCATION = [
  ['I', 'Incipient; bone intact (suprabony soft-tissue pocket)'],
  ['II', 'Partial / cul-de-sac; into the furcation but not through-and-through'],
  ['III', 'Through-and-through, but occluded by gingiva (not visible)'],
  ['IV', 'Through-and-through and clinically visible (gingiva receded)'],
];

export const renderers = {
  'glickman-furcation'(root) {
    note(root, 'Glickman furcation grade (Glickman 1953): Grade I incipient (bone intact); II partial / cul-de-sac (not through-and-through); III through-and-through but occluded by gingiva; IV through-and-through and clinically visible.');
    root.appendChild(selectField('Furcation finding', 'glick-furcation', CHOICE(FURCATION)));
    const ids = ['glick-furcation'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.glickmanFurcation({ furcation: val('glick-furcation') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.grade },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
