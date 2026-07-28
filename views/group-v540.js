// spec-v540: renderer for the ISHLT cardiac acute cellular rejection grade. Group G. One select under an h2
// section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The select offers ONLY the revised R grades. The 1990 grades are deliberately absent: the lib refuses them
// with their mapping rather than accepting them, because the two schemes reuse the same numbers and an
// unqualified "grade 3" is genuinely ambiguous (lib/ishlt-rejection-v540.js).
//
// Same input/render contract as the rest of the codebase: the select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports what a biopsy
// shows; it never diagnoses rejection clinically and never indicates a change in immunosuppression.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ishlt-rejection-v540.js';
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
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The treatment decision stays with the transplant team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ishlt-rejection'(root) {
    note(root, 'The ISHLT grading of acute cellular rejection in a cardiac allograft. The R stands for revised and is not decoration: the 1990 scheme also used the numbers 1 to 4 and they do not mean the same things, so an unqualified “grade 3” is ambiguous. The mapping is many-to-one — 1A, 1B and 2 all become 1R — and the trap is that 3A and 3B are adjacent in the old scheme but land in different revised grades, 2R and 3R. It grades acute cellular rejection only: it is blind to antibody-mediated rejection and to allograft vasculopathy.');

    heading(root, 'Endomyocardial biopsy appearance');
    root.appendChild(select('Which revised grade does the biopsy show? Enter the R form; a 1990-scheme grade will be flagged with its mapping rather than scored.', 'ishlt-grade',
      M.ISHLT_GRADES.map((g) => [g.value, `${g.label} — ${g.text}`])));

    const o = out(); root.appendChild(o);
    wire(['ishlt-grade'], () => safe(o, () => {
      const r = M.ishltRejection({ grade: val('ishlt-grade') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.grade },
        { label: 'Maps from 1990 grade(s)', value: r.legacyGrades.join(', ') },
        { label: 'Conventional reading', value: r.highGrade ? 'high grade' : 'low grade' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
