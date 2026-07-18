// spec-v416: renderer for the Russe classification of scaphoid fractures (horizontal oblique / transverse /
// vertical oblique). Group G. The clinician picks the orientation; the tile reports the type and its
// orientation/stability description. As a fracture-orientation descriptor it reports the type the clinician
// has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Russe type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/russe-scaphoid-v416.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/russe-scaphoid-v416.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the hand / orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'russe-scaphoid'(root) {
    note(root, 'Russe classification of a scaphoid fracture, by the orientation of the fracture line relative to the long axis of the scaphoid (which sets whether compressive or shear forces predominate). Pick the orientation. Horizontal oblique: compressive forces predominate (most stable); transverse: both compressive and shear (intermediate); vertical oblique: shear predominates (least stable). Near-neighbors: mayfield-perilunate, geissler-carpal.');
    root.appendChild(select('Russe orientation', 'ru-type', [
      ['horizontal oblique', 'Horizontal oblique - compressive, most stable'],
      ['transverse', 'Transverse - compressive + shear, intermediate'],
      ['vertical oblique', 'Vertical oblique - shear, least stable'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ru-type'], () => safe(o, () => {
      const r = M.russeScaphoid({ type: val('ru-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
