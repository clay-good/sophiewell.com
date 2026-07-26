// spec-v465: renderer for the Stamey stress-incontinence grading (grades 1-3). Group G. The clinician picks
// the grade; the tile reports the grade and its provoking-stress description. As a grade descriptor it reports
// the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Stamey grade; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/stamey-incontinence-v465.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/stamey-incontinence-v465.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the urology / urogynecology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'stamey-incontinence'(root) {
    note(root, 'The Stamey grading of stress urinary incontinence, by the degree of physical stress that provokes leakage. Pick the grade. 1: sudden increases in abdominal pressure (cough, sneeze, laugh), not at night; 2: lesser stress (walking, standing, sitting up); 3: total, continuous incontinence regardless of activity or position. Reports the grade the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: sandvik-incontinence.');
    root.appendChild(select('Stamey grade', 'stamey-grade', [
      ['1', '1 - sudden pressure (cough, sneeze, laugh), not at night'],
      ['2', '2 - lesser stress (walking, standing, sitting up)'],
      ['3', '3 - total, continuous incontinence'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['stamey-grade'], () => safe(o, () => {
      const r = M.stameyIncontinence({ grade: val('stamey-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
