// spec-v603: renderer for the Bauer and modified Bauer scores. Group G. Sections are h2 (an h3 under the
// page h1 is a heading-level skip). Every control asks for the FAVOURABLE state, and the labels say so,
// because a higher score means a better prognosis and phrasing an item as the bad thing would invert the
// answer (lib/bauer-score-v603.js).
//
// Per spec-v11 section 5.3 this is a group-level survival estimate; it never decides whether to operate, and
// the strategies attached to the bands describe the derivation cohorts rather than a recommendation.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bauer-score-v603.js';
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
const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];
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
const bid = (key) => `bauer-${key}`;

export const renderers = {
  'bauer-score'(root) {
    note(root, 'A HIGHER score means a BETTER prognosis — every item asks about the favorable state. Both versions are computed, and they disagree in two situations — in opposite directions.');

    heading(root, 'The four items shared by both versions');
    for (const i of M.ITEMS.filter((x) => x.inModified)) root.appendChild(select(i.text, bid(i.key), YN));
    note(root, M.HISTOLOGY_NOTE);

    heading(root, 'The item only the original uses');
    for (const i of M.ITEMS.filter((x) => !x.inModified)) root.appendChild(select(i.text, bid(i.key), YN));
    note(root, M.DROPPED_ITEM_NOTE);

    const ids = M.ITEMS.map((i) => bid(i.key));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const i of M.ITEMS) args[i.key] = val(bid(i.key));
      const r = M.bauerScore(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Bauer', value: `${r.original} of ${r.originalMax} (${r.originalSurvival})` },
        { label: 'Modified Bauer', value: `${r.modified} of ${r.modifiedMax} (${r.modifiedSurvival})` },
        { label: 'Versions disagree', value: r.versionsDisagree ? 'YES' : 'no' },
        { label: 'From histology', value: `${r.histologyPoints} of 2` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'The published bands');
    note(root, `Original: ${M.ORIGINAL_BANDS.map((b) => `${b.label} = ${b.survival}, ${b.strategy}`).join('; ')}.`);
    note(root, `Modified: ${M.MODIFIED_BANDS.map((b) => `${b.label} = ${b.survival}, ${b.strategy}`).join('; ')}.`);
    note(root, M.DISAGREEMENT_NOTE);
    note(root, M.DIRECTION_NOTE);
    postureNote(root);
  },
};
