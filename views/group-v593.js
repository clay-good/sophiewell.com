// spec-v593: renderer for the revised Bethesda guidelines. Group G. Sections are h2 (an h3 under the page h1
// is a heading-level skip). Each criterion carries its own age rule inline, because three of the five differ
// and two have none, and a flat checklist invites carrying one threshold across the set
// (lib/bethesda-v593.js).
//
// Per spec-v11 section 5.3 these guidelines decide who gets a test, never who has Lynch syndrome, and a
// negative result is never presented as excluding it.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bethesda-v593.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of [['', '--'], ['no', 'No'], ['yes', 'Yes']]) s.appendChild(el('option', { value, text }));
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
const cid = (key) => `beth-${key}`;

export const renderers = {
  bethesda(root) {
    note(root, 'Any ONE criterion means the tumor should be tested for microsatellite instability. This is the opposite of the Amsterdam II criteria on this site, which require all six of their requirements.');

    heading(root, 'The Lynch-associated tumor spectrum used here');
    note(root, M.SPECTRUM_NOTE);

    heading(root, 'The five criteria');
    for (const c of M.CRITERIA) {
      root.appendChild(select(c.text, cid(c.key)));
      note(root, `Age rule: ${c.ageRule}.`);
    }
    note(root, M.AGE_NOTE);
    note(root, M.DEGREE_NOTE);

    const o = out(); root.appendChild(o);
    wire(M.CRITERIA.map((c) => cid(c.key)), () => safe(o, () => {
      const args = {};
      for (const c of M.CRITERIA) args[c.key] = val(cid(c.key));
      const r = M.bethesda(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Criteria met', value: `${r.metCriteria.length} of ${r.criteriaTotal}` },
        { label: 'Required', value: 'any one' },
        { label: 'Met', value: r.metCriteria.length ? r.metCriteria.join(', ') : 'none' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Two things about criterion 3');
    note(root, M.HISTOLOGY_NOTE);
    note(root, M.VOTE_NOTE);

    heading(root, 'What a negative result does not mean');
    note(root, M.NEGATIVE_NOTE);
    postureNote(root);
  },
};
