// spec-v581: renderer for the Shanghai Brugada score. Group G. Each category under its own h2 (never h3 -
// an h3 under the page h1 is a heading-level skip), because within a category only the single
// highest-scoring item counts and the layout should not read as a checklist to tick several boxes in
// (lib/shanghai-brugada-v581.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile applies diagnostic
// criteria; it never risk-stratifies for sudden death and never decides on a defibrillator.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/shanghai-brugada-v581.js';
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

const opts = (items) => items.map((i) => [i.value, i.points ? `${i.text} — ${i.points}` : i.text]);

export const renderers = {
  'shanghai-brugada'(root) {
    note(root, 'The Shanghai score diagnoses Brugada syndrome. Within each of the first three categories only the SINGLE HIGHEST-scoring item counts — several findings in one category do not add. And at least one ECG finding is REQUIRED: without it the result is non-diagnostic however high the other categories total. (Not to be confused with the Brugada algorithm for wide-complex tachycardia, which is a different instrument in this catalog.)');

    heading(root, 'I. ECG — required, and a gate rather than a score');
    root.appendChild(select('Highest-scoring ECG finding', 'shanghai-ecg', opts(M.ECG_ITEMS)));

    heading(root, 'II. Clinical history');
    root.appendChild(select('Highest-scoring clinical item', 'shanghai-clinical', opts(M.CLINICAL_ITEMS)));
    root.appendChild(number(`Age (years) — needed only for the atrial fibrillation item, which scores only under ${M.AF_AGE_LIMIT}`, 'shanghai-age'));

    heading(root, 'III. Family history');
    root.appendChild(select('Highest-scoring family item', 'shanghai-family', opts(M.FAMILY_ITEMS)));
    note(root, 'Note that the definite-Brugada item counts SECOND-degree relatives, and the sudden-death item requires a NEGATIVE AUTOPSY — an un-autopsied death does not qualify.');

    heading(root, 'IV. Genetics');
    note(root, `Deliberately de-weighted: ${M.GENETIC_POINTS} point, the same as the weakest clinical item, and it cannot open the ECG gate.`);
    root.appendChild(select('Probable pathogenic mutation in a Brugada susceptibility gene?', 'shanghai-genetic',
      [['no', 'No'], ['yes', 'Yes']]));

    const ids = ['shanghai-ecg', 'shanghai-clinical', 'shanghai-age', 'shanghai-family', 'shanghai-genetic'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.shanghaiBrugada({
        ecg: val('shanghai-ecg'), clinical: val('shanghai-clinical'),
        family: val('shanghai-family'), geneticMutation: val('shanghai-genetic'),
        age: val('shanghai-age'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Score', value: `${r.total} of ${r.max}` },
        { label: 'Result', value: r.band },
        { label: 'ECG gate', value: r.ecgFindingPresent ? 'met' : (r.gateBlocked ? 'NOT met — non-diagnostic despite the total' : 'not met') },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
