// spec-v435: renderer for the Van Herick angle grade (0-4). Group G. The clinician picks the grade; the tile
// reports the grade and its PACD:CT description. As a grade descriptor it reports the grade the clinician has
// estimated.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Van Herick grade; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/van-herick-v435.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/van-herick-v435.js';
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
  'van-herick'(root) {
    note(root, 'The Van Herick grade of the peripheral anterior chamber angle, estimated at the slit lamp by the ratio of the peripheral anterior chamber depth (PACD) to the corneal thickness (CT). Pick the grade. 0: closed; 1: <1/4 CT (closure likely); 2: 1/4 CT (closure possible); 3: 1/4-1/2 CT (closure unlikely); 4: >=1 CT (wide open). Gonioscopy remains the reference standard. Reports the grade the clinician has estimated, not a diagnosis of angle-closure. Near-neighbor: shaffer-angle.');
    root.appendChild(select('Van Herick grade', 'vh-grade', [
      ['0', '0 - PACD = 0, angle closed'],
      ['1', '1 - PACD < 1/4 CT, closure likely'],
      ['2', '2 - PACD = 1/4 CT, closure possible'],
      ['3', '3 - PACD = 1/4-1/2 CT, closure unlikely'],
      ['4', '4 - PACD >= 1 CT, wide open'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['vh-grade'], () => safe(o, () => {
      const r = M.vanHerick({ grade: val('vh-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
