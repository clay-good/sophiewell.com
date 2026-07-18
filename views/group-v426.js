// spec-v426: renderer for the Gell and Coombs hypersensitivity classification (types I-IV). Group G. The
// clinician picks the type; the tile reports the type and its mechanism / examples. As a mechanism-type
// descriptor it reports the type the clinician has selected.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Gell and Coombs type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/gell-coombs-v426.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gell-coombs-v426.js';
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
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the treating team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'gell-coombs'(root) {
    note(root, 'The Gell and Coombs classification of hypersensitivity reactions, the classic grouping by immune mechanism. Pick the type. I: immediate, IgE-mediated (anaphylaxis, atopy); II: antibody-mediated cytotoxic, IgG/IgM (autoimmune hemolytic anemia, Goodpasture); III: immune-complex-mediated (serum sickness, SLE); IV: delayed, cell-mediated / T-cell (contact dermatitis, tuberculin reaction). Many real reactions involve more than one mechanism.');
    root.appendChild(select('Gell and Coombs hypersensitivity type', 'gc-type', [
      ['I', 'I - immediate, IgE-mediated (anaphylaxis, atopy)'],
      ['II', 'II - antibody-mediated cytotoxic, IgG/IgM'],
      ['III', 'III - immune-complex-mediated (serum sickness, SLE)'],
      ['IV', 'IV - delayed, cell-mediated / T-cell'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['gc-type'], () => safe(o, () => {
      const r = M.gellCoombs({ type: val('gc-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
