// spec-v501: renderer for the Ludwig scale of female-pattern hair loss (grades I, II, III). Group G. The
// clinician picks the grade; the tile reports the grade and its crown-thinning description. As a pattern-grade
// descriptor it reports the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Ludwig grade; it never asserts a diagnosis of androgenetic
// alopecia, an exclusion of other causes, or a treatment decision (lib/ludwig-hairloss-v501.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ludwig-hairloss-v501.js';
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
  'ludwig-hairloss'(root) {
    note(root, 'The Ludwig scale of female-pattern (androgenetic) hair loss, by the degree of central crown thinning with the frontal hairline preserved throughout. Pick the grade. I: perceptible thinning of the crown behind a retained frontal fringe; II: pronounced thinning within that area; III: full baldness within that area. Reports the pattern grade the clinician has determined, not a diagnosis of androgenetic alopecia or an exclusion of other causes of hair loss. Near-neighbor: salt-score.');
    root.appendChild(select('Ludwig grade', 'ludwig-grade', [
      ['I', 'I - perceptible crown thinning'],
      ['II', 'II - pronounced crown thinning'],
      ['III', 'III - full baldness of the crown'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ludwig-grade'], () => safe(o, () => {
      const r = M.ludwigHairloss({ grade: val('ludwig-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
