// spec-v436: renderer for the Biffl BCVI grade (I-V). Group G. The clinician picks the grade; the tile
// reports the grade and its angiographic description. As an injury-grade descriptor it reports the grade the
// clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Biffl grade; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/biffl-bcvi-v436.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/biffl-bcvi-v436.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the trauma / neurosurgery / neurointervention team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'biffl-bcvi'(root) {
    note(root, 'The Biffl (Denver) grading scale for blunt cerebrovascular injury (BCVI), by the angiographic appearance of the carotid or vertebral artery injury. Pick the grade. I: irregularity/dissection <25% narrowing; II: dissection/hematoma >=25% narrowing, thrombus, or raised intimal flap; III: pseudoaneurysm; IV: occlusion; V: transection with extravasation. It follows a positive BCVI screen. Reports the grade the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: denver-bcvi.');
    root.appendChild(select('Biffl BCVI grade', 'biffl-grade', [
      ['I', 'I - irregularity/dissection <25% narrowing'],
      ['II', 'II - dissection/hematoma >=25% narrowing, thrombus, or intimal flap'],
      ['III', 'III - pseudoaneurysm'],
      ['IV', 'IV - occlusion'],
      ['V', 'V - transection with extravasation'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['biffl-grade'], () => safe(o, () => {
      const r = M.bifflBcvi({ grade: val('biffl-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
