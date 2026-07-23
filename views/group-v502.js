// spec-v502: renderer for the Norwood (Hamilton-Norwood) scale of male-pattern hair loss (stages I-VII, with
// a distinct III vertex). Group G. The clinician picks the stage; the tile reports the stage and its
// recession / vertex description. As a pattern-stage descriptor it reports the stage the clinician has
// determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Norwood stage; it never asserts a diagnosis of androgenetic
// alopecia, an exclusion of other causes, or a treatment decision (lib/norwood-hairloss-v502.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/norwood-hairloss-v502.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The workup and management decision stay with the treating clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'norwood-hairloss'(root) {
    note(root, 'The Norwood (Hamilton-Norwood) scale of male-pattern (androgenetic) hair loss, by increasing frontotemporal recession and vertex loss. Pick the stage. I: no or minimal recession; II: triangular frontotemporal recession; III: the minimal balding extent; III vertex: crown-predominant loss; IV: recession and vertex loss separated by a band; V: the band narrows; VI: the band is gone and the areas are confluent; VII: only a horseshoe band remains. Reports the pattern stage the clinician has determined, not a diagnosis of androgenetic alopecia or a treatment decision. Near-neighbor: ludwig-hairloss.');
    root.appendChild(select('Norwood stage', 'norwood-stage', [
      ['I', 'I - no or minimal recession'],
      ['II', 'II - triangular frontotemporal recession'],
      ['III', 'III - minimal balding extent'],
      ['III vertex', 'III vertex - crown-predominant loss'],
      ['IV', 'IV - recession and vertex loss, band between'],
      ['V', 'V - band narrows and thins'],
      ['VI', 'VI - band gone, areas confluent'],
      ['VII', 'VII - only a horseshoe band remains'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['norwood-stage'], () => safe(o, () => {
      const r = M.norwoodHairloss({ stage: val('norwood-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
