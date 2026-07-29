// spec-v611: renderer for the Fried frailty phenotype. Group G. Sections are h2 (an h3 under the page h1 is
// a heading-level skip). The cut-point tables are printed alongside the questions, because three of the five
// criteria are measurements whose thresholds depend on sex, BMI or height (lib/fried-frailty-v611.js).
//
// Per spec-v11 section 5.3 this classifies a phenotype; it never diagnoses, never measures disability, and
// never clears anyone for an operation.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fried-frailty-v611.js';
import { resultRow } from '../lib/result-copy.js';

const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];

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

const aid = (k) => `fried-${k}`;

export const renderers = {
  'fried-frailty'(root) {
    note(root, M.EQUIPMENT_NOTE);

    heading(root, 'The five criteria');
    for (const c of M.CRITERIA) root.appendChild(select(c.text, aid(c.key), YN));

    const o = out(); root.appendChild(o);
    wire(M.CRITERIA.map((c) => aid(c.key)), () => safe(o, () => {
      const input = {};
      for (const c of M.CRITERIA) input[c.key] = val(aid(c.key));
      const r = M.friedFrailty(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Criteria met', value: `${r.count} of ${r.max}` },
        { label: 'Category', value: r.band },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Grip-strength cut-points');
    note(root, M.GRIP_NOTE);
    note(root, M.GRIP_BANDS_NOTE);
    heading(root, 'Walk cut-points');
    note(root, M.WALK_NOTE);
    heading(root, 'Weight loss and activity');
    note(root, M.WEIGHT_NOTE);
    note(root, M.ACTIVITY_NOTE);
    postureNote(root);
  },
};
