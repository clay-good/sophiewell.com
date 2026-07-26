// spec-v471: renderer for the Gass macular hole staging (stages 1-4). Group G. The clinician picks the stage;
// the tile reports the stage and its biomicroscopic description. As a stage descriptor it reports the stage the
// clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Gass stage; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/gass-macular-hole-v471.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gass-macular-hole-v471.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the ophthalmology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'gass-macular-hole'(root) {
    note(root, 'The Gass classification of the stages of development of an idiopathic macular hole, by the biomicroscopic and OCT appearance. Pick the stage. 1: impending (foveal detachment, no full-thickness defect); 2: small full-thickness hole (less than 400 micrometers); 3: larger full-thickness hole (400 micrometers or more) without a complete posterior vitreous detachment; 4: full-thickness hole with a complete posterior vitreous detachment. Reports the stage the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: dme-severity.');
    root.appendChild(select('Gass stage', 'gass-stage', [
      ['1', '1 - impending (no full-thickness defect)'],
      ['2', '2 - small full-thickness hole (< 400 micrometers)'],
      ['3', '3 - larger full-thickness hole, no complete PVD'],
      ['4', '4 - full-thickness hole with complete PVD'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['gass-stage'], () => safe(o, () => {
      const r = M.gassMacularHole({ stage: val('gass-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
