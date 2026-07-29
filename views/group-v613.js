// spec-v613: renderer for the PEDIS classification and score. Group G. Sections are h2 (an h3 under the page
// h1 is a heading-level skip). Each select shows the published GRADE number next to its score contribution,
// because the two are off by one and conflating them is the easiest error here (lib/pedis-v613.js).
//
// Per spec-v11 section 5.3 this describes an ulcer for research comparability; it never diagnoses and never
// decides treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pedis-v613.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, grades) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  s.appendChild(el('option', { value: '', text: '--' }));
  for (const g of grades) {
    s.appendChild(el('option', { value: String(g.grade), text: `Grade ${g.grade} — ${g.text} (scores ${g.grade - 1})` }));
  }
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const aid = (k) => `pedis-${k}`;

export const renderers = {
  pedis(root) {
    note(root, M.OFFSET_NOTE);

    heading(root, 'The five categories');
    for (const c of M.CATEGORIES) root.appendChild(select(`${c.letter} — ${c.name}`, aid(c.key), c.grades));
    note(root, M.EXTENT_NOTE);

    const o = out(); root.appendChild(o);
    wire(M.CATEGORIES.map((c) => aid(c.key)), () => safe(o, () => {
      const input = {};
      for (const c of M.CATEGORIES) input[c.key] = val(aid(c.key));
      const r = M.pedis(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Profile', value: r.profile },
        { label: 'Score', value: `${r.score} of ${r.maxScore}` },
        { label: 'Grade sum (not the score)', value: `${r.gradeSum}` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'The categories are not equally weighted');
    note(root, M.WEIGHT_NOTE);
    note(root, M.SENSATION_NOTE);
    heading(root, 'Classification and score are two different things');
    note(root, M.IDENTITY_NOTE);
    postureNote(root);
  },
};
