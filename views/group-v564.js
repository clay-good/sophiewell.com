// spec-v564: renderer for the PROPKD score. Group G. Inputs under h2 section headings (never h3 - an h3
// under the page h1 is a heading-level skip).
//
// The mutation select has NO "not tested" option, deliberately. A zero-point level invites exactly that
// addition, and it would hand an ungenotyped patient a low-risk result built on an assertion nobody made
// (lib/propkd-v564.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports a group-level
// risk band; it never diagnoses ADPKD and never indicates treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/propkd-v564.js';
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
function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: '1' }));
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
  propkd(root) {
    note(root, 'PROPKD predicts renal survival in ADPKD from genotype and clinical history — a companion to the Mayo imaging classification, which stratifies from kidney volume instead. The two disagree on real patients, which is why both exist. Total 0-9.');

    heading(root, 'Genotype');
    note(root, 'Required, and there is deliberately no “not tested” option: scoring 0 asserts that a PKD2 mutation was FOUND, which is not the same as an unknown genotype. A patient who has not been genotyped — or in whom no PKD1/PKD2 mutation was found — has no PROPKD score at all.');
    root.appendChild(select('Mutation category', 'propkd-mutation',
      M.MUTATION_CATEGORIES.map((m) => [m.value, `${m.text} — ${m.points} point${m.points === 1 ? '' : 's'}`])));

    heading(root, 'Clinical variables');
    note(root, `Both clinical events are gated at age ${M.AGE_GATE}: they count only if they occurred before it. ${M.UROLOGIC_EVENT_DEFINITION}`);
    for (const v of M.CLINICAL_VARIABLES) {
      root.appendChild(select(`${v.text} — ${v.points} point${v.points === 1 ? '' : 's'}`, `propkd-${v.key}`, YESNO));
    }

    heading(root, 'Current age (optional, not scored)');
    note(root, `Used only to flag the documented limitation that the score may not identify rapid progression below age ${M.AGE_GATE}.`);
    root.appendChild(number('Age (years)', 'propkd-age'));

    const ids = ['propkd-mutation', ...M.CLINICAL_VARIABLES.map((v) => `propkd-${v.key}`), 'propkd-age'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = { mutation: val('propkd-mutation'), age: val('propkd-age') };
      for (const v of M.CLINICAL_VARIABLES) input[v.key] = val(`propkd-${v.key}`);
      const r = M.propkd(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'PROPKD', value: `${r.total} of ${r.max}` },
        { label: 'Risk band', value: r.band },
        { label: 'Median age for ESRD in this band', value: `${r.medianEsrdAge} years (population figure)` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
