// spec-v303: renderer for the Ring & Messmer anaphylaxis severity grade. Group G
// (clinical scoring & reference). The clinician selects the grade (I-IV); the tile
// reports the clinical features and whether the grade is life-threatening.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the classification descriptor; it never asserts a
// diagnosis or a treatment order (lib/anaphylaxis-v303.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/anaphylaxis-v303.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const [value, text] of options) sel.appendChild(el('option', { value, text }));
  wrap.appendChild(sel);
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

export const renderers = {
  'anaphylaxis-grade'(root) {
    note(root, 'Anaphylaxis severity grade (Ring & Messmer 1977). Select the grade to see its clinical features and whether it is life-threatening. Grades I–II are generally not life-threatening; grades III–IV are managed as anaphylaxis. Near-neighbors: pen-fast.');
    root.appendChild(select('Ring & Messmer grade', 'anp-grade', [
      ['I', 'Grade I — cutaneous-mucous signs only'],
      ['II', 'Grade II — moderate multi-organ, not immediately life-threatening'],
      ['III', 'Grade III — life-threatening collapse / bronchospasm'],
      ['IV', 'Grade IV — cardiac and/or respiratory arrest'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['anp-grade'], () => safe(o, () => {
      const r = M.anaphylaxisGrade({ grade: val('anp-grade') });
      if (!r.valid) { note(o, r.message || 'Select a grade.'); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Life-threatening', value: r.lifeThreatening ? 'yes (grade III-IV)' : 'no' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
