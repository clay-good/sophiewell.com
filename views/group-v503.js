// spec-v503: renderer for the Simpson grade of meningioma resection completeness (grades I-V). Group G. The
// surgeon records the grade; the tile reports the grade and its resection description. As a grade descriptor
// it reports the grade the surgeon has recorded.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Simpson grade; it never asserts a diagnosis, an individual
// recurrence prediction, or an adjuvant-radiotherapy decision (lib/simpson-meningioma-v503.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/simpson-meningioma-v503.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the neurosurgery and neuro-oncology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'simpson-meningioma'(root) {
    note(root, 'The Simpson grade records how complete a meningioma resection was, recorded by the surgeon at operation. Pick the grade. I: complete removal with the dural attachment and abnormal bone; II: complete removal with coagulation of the dural attachment; III: complete removal without treating the dural attachment; IV: partial removal, tumor left in situ; V: decompression only. Lower grades were associated with a lower reported recurrence rate. Reports the grade the surgeon has recorded, not an individual recurrence prediction or an adjuvant-radiotherapy decision. Near-neighbor: spetzler-martin.');
    root.appendChild(select('Simpson grade', 'simpson-grade', [
      ['I', 'I - complete, dural attachment and bone excised'],
      ['II', 'II - complete, dural attachment coagulated'],
      ['III', 'III - complete, dural attachment untreated'],
      ['IV', 'IV - partial removal, tumor left in situ'],
      ['V', 'V - decompression only'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['simpson-grade'], () => safe(o, () => {
      const r = M.simpsonMeningioma({ grade: val('simpson-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
