// spec-v383: renderer for the Risser sign (US grading, 0-5) — skeletal-maturity staging by iliac
// apophysis ossification / fusion. Group G. The clinician picks the grade; the tile reports the grade,
// its ossification description, and the remaining growth potential. As a maturity indicator (like Tanner
// staging) it does not flag any grade as abnormal.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Risser grade; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/risser-sign-v383.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/risser-sign-v383.js';
import { resultRow } from '../lib/result-copy.js';

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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the treating team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'risser-sign'(root) {
    note(root, 'Risser sign (US grading) - skeletal maturity by the ossification and fusion of the iliac crest apophysis, used in scoliosis to gauge remaining growth. Pick the grade. 0: none; 1: ~25%; 2: ~50%; 3: ~75%; 4: 100% ossified but unfused; 5: ossified and fused (mature). The remaining growth potential falls 0 to 5. Near-neighbors: tanner-staging.');
    root.appendChild(select('Risser grade', 'risser-grade', [
      ['0', 'Grade 0 - no ossification'],
      ['1', 'Grade 1 - ~25% ossification'],
      ['2', 'Grade 2 - ~50% ossification'],
      ['3', 'Grade 3 - ~75% ossification'],
      ['4', 'Grade 4 - 100% ossified, not fused'],
      ['5', 'Grade 5 - ossified and fused (mature)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['risser-grade'], () => safe(o, () => {
      const r = M.risserSign({ grade: val('risser-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
        { label: 'Growth potential remaining', value: r.growthPotentialRemaining },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
