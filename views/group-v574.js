// spec-v574: renderer for COMPERA 2.0. Group G. Inputs under an h2 section heading (never h3 - an h3 under
// the page h1 is a heading-level skip).
//
// Every field is optional, because the denominator is the number of variables actually available rather
// than a fixed three. The two natriuretic peptides sit together under a note stating the precedence, since
// they are mutually exclusive rather than additive (lib/compera-2-v574.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile stratifies follow-up
// risk; it never diagnoses pulmonary arterial hypertension and never selects therapy.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/compera-2-v574.js';
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
function number(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step }));
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
  'compera-2'(root) {
    note(root, 'COMPERA 2.0 grades up to three variables 1-4 and takes the MEAN, rounded to the nearest integer, giving strata 1 low / 2 intermediate-low / 3 intermediate-high / 4 high. The denominator is the number of variables actually available, not a fixed three — so leave anything unmeasured blank. Note that WHO functional class stops at grade 3: no class scores 4.');

    heading(root, 'Variables (all optional — the denominator is what you supply)');
    root.appendChild(select('WHO functional class', 'compera-fc',
      [['', 'Not available'], ...M.WHO_FC_GRADES.map((g) => [g.value, `${g.text} — grade ${g.grade}`])]));
    root.appendChild(number('6-minute walk distance (m)', 'compera-6mwd', '1'));
    note(root, 'Bands: over 440 = 1; 440-320 = 2; 319-165 = 3; under 165 = 4. A value strictly between 319 and 320 falls in a gap in the published table and is refused rather than rounded.');
    root.appendChild(number('NT-proBNP (ng/L)', 'compera-ntprobnp', '1'));
    root.appendChild(number('BNP (ng/L)', 'compera-bnp', '1'));
    note(root, 'Mutually exclusive: when both are supplied, NT-proBNP is used. They are not two variables that both count.');

    const ids = ['compera-fc', 'compera-6mwd', 'compera-ntprobnp', 'compera-bnp'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.compera2({
        whoFc: val('compera-fc'), sixMwd: val('compera-6mwd'),
        ntProBnp: val('compera-ntprobnp'), bnp: val('compera-bnp'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Stratum', value: `${r.stratum} — ${r.stratumLabel}` },
        { label: 'Mean grade', value: `${r.mean} from ${r.variablesGraded} variable(s)` },
        { label: 'Peptide used', value: r.peptideUsed ? `${r.peptideUsed}${r.bnpIgnored ? ' (BNP ignored: NT-proBNP takes precedence)' : ''}` : 'none supplied' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
