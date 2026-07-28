// spec-v576: renderer for the Ablett tetanus severity classification. Group G. Inputs under h2 section
// headings (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The severity picture is chosen from THREE grades, not four, and autonomic instability is a separate
// control: grade 4 is defined as grade 3 WITH autonomic instability, so offering it as a fourth option
// would hide that structure. There are deliberately NO vital-sign inputs, because the published figures
// illustrate each picture rather than acting as thresholds (lib/ablett-tetanus-v576.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile grades established
// disease; it never diagnoses tetanus and never decides airway management.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ablett-tetanus-v576.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ablett-tetanus'(root) {
    note(root, 'The Ablett classification grades ESTABLISHED tetanus. It is the companion axis to a tetanus prophylaxis decision tree, which concerns prevention in someone who does not have the disease. It is a descriptor, not a score — no points, no sum, no grade 0.');

    heading(root, 'Severity picture');
    note(root, 'Choose the picture that best fits overall. The published vital-sign figures illustrate each grade rather than acting as thresholds, and they are not monotone across the rows — a patient with a respiratory rate of 35 and a pulse of 130 fits neither grade 2 nor grade 3 cleanly. Grading is a gestalt judgment, so no vital signs are entered here.');
    root.appendChild(select('Ablett severity picture', 'ablett-picture',
      M.ABLETT_GRADES.map((g) => [String(g.grade), `${g.label} — ${g.text}`])));

    heading(root, 'Autonomic instability');
    note(root, `Grade 4 is not chosen directly: it is defined as grade ${M.AUTONOMIC_PROMOTES_FROM} WITH severe autonomic instability, so the classification is three severity levels plus this one boolean.`);
    root.appendChild(select('Severe autonomic instability involving the cardiovascular system?', 'ablett-autonomic',
      [['no', 'No'], ['yes', 'Yes']]));

    const o = out(); root.appendChild(o);
    wire(['ablett-picture', 'ablett-autonomic'], () => safe(o, () => {
      const r = M.ablettTetanus({
        severityPicture: val('ablett-picture'), autonomicInstability: val('ablett-autonomic'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Ablett grade', value: r.gradeLabel },
        { label: 'Severity picture', value: `grade ${r.severityPicture}` },
        { label: 'Autonomic instability', value: r.autonomicInstability ? (r.promotedToGrade4 ? 'present — promotes grade 3 to grade 4' : 'present, but does not promote below grade 3') : 'absent' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
