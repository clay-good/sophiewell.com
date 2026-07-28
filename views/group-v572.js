// spec-v572: renderer for the HEAVEN criteria. Group G. Criteria under an h2 section heading (never h3 - an
// h3 under the page h1 is a heading-level skip).
//
// The intro states that HEAVEN is a COUNT with no band table, because the natural thing to do with six
// criteria is to look for a percentage per count, and only two were ever published
// (lib/heaven-criteria-v572.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile anticipates difficulty;
// it never decides whether or how to intubate.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/heaven-criteria-v572.js';
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

const YESNO = [['no', 'No'], ['yes', 'Yes']];

export const renderers = {
  'heaven-criteria'(root) {
    note(root, 'HEAVEN anticipates a difficult EMERGENCY airway. It exists because LEMON and the Mallampati score assume a cooperative, largely elective patient — HEAVEN is the rapid-sequence-intubation axis of the same question and includes physiologic as well as anatomic difficulty. It is a COUNT of criteria present (0-6), not a point score: there is no band table, and only two figures were ever published — about 94% first-attempt success with no criteria and about 43% with five or more.');

    heading(root, 'Criteria, assessed at the moment of laryngoscopy');
    note(root, 'Not on arrival: hypoxemia and the fluid criterion both reference the time of initial laryngoscopy, so effective preoxygenation can legitimately un-score hypoxemia.');
    for (const c of M.HEAVEN_CRITERIA) {
      root.appendChild(select(`${c.letter} — ${c.name}`, `heaven-${c.key}`, YESNO));
      note(root, c.text);
    }

    const o = out(); root.appendChild(o);
    wire(M.HEAVEN_CRITERIA.map((c) => `heaven-${c.key}`), () => safe(o, () => {
      const input = {};
      for (const c of M.HEAVEN_CRITERIA) input[c.key] = val(`heaven-${c.key}`);
      const r = M.heavenCriteria(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Criteria present', value: `${r.count} of ${r.max}` },
        { label: 'Which', value: r.criteriaPresent.length ? r.criteriaPresent.join(', ') : 'none' },
        { label: 'Published figure', value: r.hasPublishedFigure ? r.publishedAnchor : 'none published for this count' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
