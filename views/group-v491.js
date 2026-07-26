// spec-v491: renderer for the Severin DDH outcome classification (groups I-VI). Group G. The clinician picks
// the group; the tile reports the group and its hip-congruency description. As a group descriptor it reports
// the group the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Severin group; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/severin-ddh-v491.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/severin-ddh-v491.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the pediatric-orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'severin-ddh'(root) {
    note(root, 'The Severin classification of the radiographic outcome of the hip after treatment for developmental dysplasia (DDH), by joint congruency and the center-edge (CE) angle at maturity. Pick the group. I: normal; II: concentric with moderate deformity; III: dysplastic without subluxation; IV: subluxated; V: false (secondary) acetabulum; VI: redislocation. Reports the group the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: crowe-ddh.');
    root.appendChild(select('Severin group', 'severin-group', [
      ['I', 'I - normal or nearly normal'],
      ['II', 'II - concentric, moderate deformity'],
      ['III', 'III - dysplastic without subluxation'],
      ['IV', 'IV - subluxated'],
      ['V', 'V - false (secondary) acetabulum'],
      ['VI', 'VI - redislocation'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['severin-group'], () => safe(o, () => {
      const r = M.severinDdh({ group: val('severin-group') });
      resultRow(o, [
        { text: r.band },
        { label: 'Group', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
