// spec-v338: renderer for the ICRS cartilage lesion classification (grades 0-4). Group G. The
// surgeon picks the depth-based grade seen at arthroscopy; the tile reports the grade, its
// description, and whether it is a full-thickness / osteochondral (grade 4) lesion.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the cartilage grade; it never asserts a diagnosis, a surgical
// recommendation, or an outcome prediction (lib/icrs-v338.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/icrs-v338.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The cartilage-repair and management decisions stay with the surgeon and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'icrs-cartilage'(root) {
    note(root, 'ICRS classification (International Cartilage Repair Society; Brittberg 2003) of a chondral defect at arthroscopy, graded by depth. Pick the grade. 0 normal; 1 nearly normal (surface intact); 2 <50% depth; 3 >50% depth / to but not through subchondral bone; 4 through the subchondral bone (osteochondral). The depth-based modern companion to the Outerbridge classification. Near-neighbors: outerbridge-cartilage, kellgren-lawrence.');
    root.appendChild(select('ICRS grade', 'icrs-grade', [
      ['0', '0 — normal cartilage'],
      ['1', '1 — nearly normal (surface intact, softening/superficial fissures)'],
      ['2', '2 — abnormal (<50% of cartilage depth, no exposed bone)'],
      ['3', '3 — severely abnormal (>50% depth, to but not through subchondral bone)'],
      ['4', '4 — severely abnormal (through subchondral bone, osteochondral)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['icrs-grade'], () => safe(o, () => {
      const r = M.icrs({ grade: val('icrs-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.grade },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
