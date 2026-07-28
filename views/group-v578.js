// spec-v578: renderer for the Nancy histological index. Group G. The three features sit under an h2 in
// PRIORITY ORDER (never h3 - an h3 under the page h1 is a heading-level skip), with each label saying what
// it decides, because the index is a decision tree rather than a sum (lib/nancy-index-v578.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile grades histologic
// activity; it never diagnoses ulcerative colitis and never selects therapy.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nancy-index-v578.js';
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
  'nancy-index'(root) {
    note(root, 'The Nancy index is the HISTOLOGIC companion to the endoscopic Mayo subscore and UCEIS. It is a DECISION TREE, not a sum: ulceration is checked first, then the neutrophilic infiltrate, then the chronic infiltrate, and the first that fires decides the grade. The denominator is the set of biopsies from the visit — the worst biopsy wins.');

    heading(root, 'Checked first');
    root.appendChild(select(`Ulcers or erosions present? — yes gives grade ${M.ULCERATION_GRADE} outright`, 'nancy-ulceration',
      [['no', 'No'], ['yes', 'Yes']]));

    heading(root, 'Checked second, only if there is no ulceration');
    root.appendChild(select('Neutrophilic infiltrate', 'nancy-neutrophils',
      M.NEUTROPHIL_LEVELS.map((n) => [n.value, n.grade === null ? `${n.text} — go to the chronic infiltrate` : `${n.text} — grade ${n.grade}`])));

    heading(root, 'Checked last, only if there are no neutrophils');
    note(root, `A dead end at grade ${M.RESPONSE_MAX_GRADE}: however florid the chronic infiltrate, it can never push the grade above ${M.RESPONSE_MAX_GRADE}.`);
    root.appendChild(select('Chronic inflammatory infiltrate', 'nancy-chronic',
      M.CHRONIC_LEVELS.map((c) => [c.value, `${c.text} — grade ${c.grade}`])));

    const o = out(); root.appendChild(o);
    wire(['nancy-ulceration', 'nancy-neutrophils', 'nancy-chronic'], () => safe(o, () => {
      const r = M.nancyIndex({
        ulceration: val('nancy-ulceration'), neutrophils: val('nancy-neutrophils'),
        chronicInflammation: val('nancy-chronic'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Nancy index', value: `${r.grade} — ${r.gradeText}` },
        { label: 'Decided by', value: r.decidedBy },
        { label: 'Remission / response', value: r.remission ? 'histological remission' : (r.response ? 'histological response, not remission' : 'neither') },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
