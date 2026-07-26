// spec-v448: renderer for the Traynelis atlanto-occipital dislocation classification (types I-III). Group G.
// The clinician picks the type; the tile reports the type and its displacement description. As a type
// descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Traynelis type; it never asserts a diagnosis, a stability determination,
// a treatment decision, or a prognosis (lib/traynelis-v448.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/traynelis-v448.js';
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
  'traynelis'(root) {
    note(root, 'The Traynelis classification of traumatic atlanto-occipital dislocation (AOD), by the direction of occiput displacement relative to the atlas. Pick the type. I: anterior displacement; II: longitudinal distraction (vertical separation); III: posterior displacement. Atlanto-occipital dislocation is a high-mortality craniocervical injury. Reports the type the clinician has determined, not a diagnosis or a stability determination. Near-neighbor: anderson-montesano.');
    root.appendChild(select('Traynelis type', 'traynelis-type', [
      ['I', 'I - anterior displacement of the occiput'],
      ['II', 'II - longitudinal distraction (vertical separation)'],
      ['III', 'III - posterior displacement of the occiput'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['traynelis-type'], () => safe(o, () => {
      const r = M.traynelis({ type: val('traynelis-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
