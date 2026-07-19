// spec-v429: renderer for the Sarnat staging of neonatal HIE (stages 1/2/3). Group G. The clinician picks the
// stage; the tile reports the stage and its hallmark clinical features. As a stage descriptor it reports the
// stage the clinician has assigned.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Sarnat stage; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/sarnat-hie-v429.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sarnat-hie-v429.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the neonatology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'sarnat-hie'(root) {
    note(root, 'The Sarnat staging of neonatal hypoxic-ischemic encephalopathy (HIE), the clinical grading of a term newborn after a hypoxic-ischemic insult. Pick the stage. 1 (mild): hyperalert, no seizures, resolves within 24 hours; 2 (moderate): lethargic, hypotonic, seizures common; 3 (severe): stupor or coma, flaccid, suppressed EEG. Reports the stage the clinician has assigned, not a diagnosis or a treatment decision (e.g., therapeutic hypothermia eligibility).');
    root.appendChild(select('Sarnat stage', 'sarnat-stage', [
      ['1', '1 - mild (hyperalert, no seizures, resolves < 24 h)'],
      ['2', '2 - moderate (lethargic, hypotonic, seizures common)'],
      ['3', '3 - severe (stupor/coma, flaccid, suppressed EEG)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['sarnat-stage'], () => safe(o, () => {
      const r = M.sarnatHie({ stage: val('sarnat-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
