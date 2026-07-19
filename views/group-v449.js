// spec-v449: renderer for the Fielding-Hawkins atlantoaxial rotatory subluxation classification (types I-IV).
// Group G. The clinician picks the type; the tile reports the type and its displacement description. As a type
// descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Fielding-Hawkins type; it never asserts a diagnosis, a stability
// determination, a treatment decision, or a prognosis (lib/fielding-hawkins-v449.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fielding-hawkins-v449.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the spine / neurosurgery team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'fielding-hawkins'(root) {
    note(root, 'The Fielding-Hawkins classification of atlantoaxial rotatory subluxation / fixation, by the direction and degree of atlas displacement on the axis. Pick the type. I: no anterior displacement (ADI <= 3 mm); II: anterior 3-5 mm (transverse ligament deficient); III: anterior > 5 mm (transverse and alar ligaments deficient); IV: posterior displacement. Reports the type the clinician has determined, not a diagnosis or a stability determination. Near-neighbors: traynelis, anderson-montesano.');
    root.appendChild(select('Fielding-Hawkins type', 'fh-type', [
      ['I', 'I - no anterior displacement (ADI <= 3 mm)'],
      ['II', 'II - anterior 3-5 mm (transverse ligament deficient)'],
      ['III', 'III - anterior > 5 mm (transverse and alar deficient)'],
      ['IV', 'IV - posterior displacement of the atlas'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['fh-type'], () => safe(o, () => {
      const r = M.fieldingHawkins({ type: val('fh-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
