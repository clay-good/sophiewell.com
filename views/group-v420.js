// spec-v420: renderer for the Friedman tongue position (grades I/II/III/IV). Group G. The clinician picks
// the grade; the tile reports the grade and its visualization description. As an anatomical-grade descriptor
// it reports the grade the clinician has observed.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Friedman tongue position; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/friedman-tongue-v420.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/friedman-tongue-v420.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the sleep / otolaryngology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'friedman-tongue'(root) {
    note(root, 'Friedman tongue position (FTP), the anatomical grade of what the observer can visualize of the oropharynx with the mouth open (no tongue protrusion), used in obstructive-sleep-apnea staging. Pick the grade. I: entire uvula and tonsils/pillars; II: uvula but not tonsils; III: soft palate but not uvula; IV: only the hard palate. One input to the Friedman OSA stage (with tonsil size and BMI), not the stage itself. Near-neighbors: cotton-myer, brodsky-tonsil.');
    root.appendChild(select('Friedman tongue position', 'ft-grade', [
      ['I', 'I - entire uvula and tonsils / pillars'],
      ['II', 'II - uvula but not tonsils'],
      ['III', 'III - soft palate but not uvula'],
      ['IV', 'IV - only the hard palate'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ft-grade'], () => safe(o, () => {
      const r = M.friedmanTongue({ grade: val('ft-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
