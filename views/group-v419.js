// spec-v419: renderer for the Myer-Cotton grading of subglottic stenosis (grades I/II/III/IV). Group G. The
// clinician picks the grade; the tile reports the grade and its percent-obstruction description. As a
// grading descriptor it reports the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Cotton-Myer grade; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/cotton-myer-v419.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cotton-myer-v419.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the otolaryngology / airway team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'cotton-myer'(root) {
    note(root, 'Myer-Cotton grading of subglottic stenosis, by the percent obstruction of the subglottic airway lumen (classically from the largest endotracheal tube that passes with an appropriate leak versus the age-expected size). Pick the grade. I: 0-50%; II: 51-70%; III: 71-99%; IV: no detectable lumen. Near-neighbors: brodsky-tonsil.');
    root.appendChild(select('Cotton-Myer grade', 'cm-grade', [
      ['I', 'Grade I - 0% to 50% obstruction'],
      ['II', 'Grade II - 51% to 70% obstruction'],
      ['III', 'Grade III - 71% to 99% obstruction'],
      ['IV', 'Grade IV - no detectable lumen'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['cm-grade'], () => safe(o, () => {
      const r = M.cottonMyer({ grade: val('cm-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
