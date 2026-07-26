// spec-v484: renderer for the Barrack cement mantle grading (grades A-D). Group G. The clinician picks the
// grade; the tile reports the grade and its cement-mantle-quality description. As a grade descriptor it reports
// the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Barrack grade; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/barrack-cement-v484.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/barrack-cement-v484.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'barrack-cement'(root) {
    note(root, 'The Barrack classification of the cement mantle around a cemented femoral stem, by the quality of cementing on the immediate postoperative radiograph. Pick the grade. A: complete filling ("white-out"); B: slight radiolucency, nearly complete filling; C: radiolucency over 50-99% of the interface, or a mantle defect; D: radiolucency over 100%, or an unfilled canal. Reports the grade the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: vancouver-periprosthetic.');
    root.appendChild(select('Barrack grade', 'barrack-grade', [
      ['A', 'A - complete filling ("white-out")'],
      ['B', 'B - slight radiolucency, nearly complete filling'],
      ['C', 'C - radiolucency over 50-99%, or a mantle defect'],
      ['D', 'D - radiolucency over 100%, or an unfilled canal'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['barrack-grade'], () => safe(o, () => {
      const r = M.barrackCement({ grade: val('barrack-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
