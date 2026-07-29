// spec-v590: renderer for the original 1996 Five-Factor Score. Group G. Sections are h2 (an h3 under the
// page h1 is a heading-level skip). Each factor carries the note of what became of it in the 2011 revision,
// because the two scores share a name and a range while sharing only one factor
// (lib/ffs-1996-v590.js).
//
// Per spec-v11 section 5.3 this is a group-level prognostic score; it never diagnoses or classifies a
// vasculitis, never measures activity, and never selects immunosuppression.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ffs-1996-v590.js';
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
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any' }));
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
const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];
const fid = (key) => `ffs96-${key}`;

export const renderers = {
  'ffs-1996'(root) {
    note(root, 'The original Five-Factor Score. The 2011 revision in this catalog shares its name, its 0 to 5 range and its band structure — and only one of its five factors, so the two numbers do not mean the same thing.');

    heading(root, 'The five factors');
    for (const f of M.FACTORS) {
      root.appendChild(select(f.text, fid(f.key), YN));
      note(root, `In the 2011 revision: ${f.fate}`);
    }

    heading(root, 'Optional — the 10 micromol/L window where the two scores disagree');
    root.appendChild(number('Serum creatinine (micromol/L)', fid('creatinineUmol')));
    note(root, `Above ${M.CREATININE_THRESHOLD_UMOL} scores here; the revision needs ${M.REVISION_CREATININE_UMOL} or more. A value between them scores on this score only.`);

    heading(root, 'Optional — the disease');
    root.appendChild(select('Vasculitis', fid('disease'), [
      ['', '--'],
      ['polyarteritis-nodosa', 'Polyarteritis nodosa'],
      ['egpa', 'Churg-Strauss syndrome / EGPA'],
      ['microscopic-polyangiitis', 'Microscopic polyangiitis'],
      ['granulomatosis-with-polyangiitis', 'Granulomatosis with polyangiitis (Wegener)'],
    ]));
    note(root, `${M.OUT_OF_DERIVATION} was not in this score’s derivation cohort; it was added only in the 2011 revision.`);

    const ids = [...M.FACTORS.map((f) => fid(f.key)), fid('creatinineUmol'), fid('disease')];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = { creatinineUmol: val(fid('creatinineUmol')), disease: val(fid('disease')) };
      for (const f of M.FACTORS) args[f.key] = val(fid(f.key));
      const r = M.ffs1996(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Score', value: `${r.total} of ${r.max}` },
        { label: 'Band', value: r.band },
        { label: '5-year mortality', value: 'not reported — see below' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Why no mortality percentage is shown');
    note(root, M.WITHHELD_MORTALITY_NOTE);
    postureNote(root);
  },
};
