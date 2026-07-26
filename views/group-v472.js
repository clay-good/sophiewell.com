// spec-v472: renderer for the Yerdel portal vein thrombosis grading (grades 1-4). Group G. The clinician picks
// the grade; the tile reports the grade and its thrombus-extent description. As a grade descriptor it reports
// the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Yerdel grade; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/yerdel-pvt-v472.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/yerdel-pvt-v472.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the hepatology / transplant team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'yerdel-pvt'(root) {
    note(root, 'The Yerdel classification of portal vein thrombosis, by the extent of thrombus in the portal vein and superior mesenteric vein (SMV). Pick the grade. 1: partial PVT, 50% or less of the lumen; 2: more than 50% occlusion, including total, of the portal vein; 3: complete portal vein and proximal SMV thrombosis, distal SMV patent; 4: complete portal vein and entire SMV thrombosis. Reports the grade the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: baveno-vii.');
    root.appendChild(select('Yerdel grade', 'yerdel-grade', [
      ['1', '1 - partial PVT, 50% or less of the lumen'],
      ['2', '2 - more than 50% occlusion (including total)'],
      ['3', '3 - complete PV + proximal SMV, distal SMV patent'],
      ['4', '4 - complete PV + entire SMV'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['yerdel-grade'], () => safe(o, () => {
      const r = M.yerdelPvt({ grade: val('yerdel-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
