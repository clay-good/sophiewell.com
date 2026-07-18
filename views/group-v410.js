// spec-v410: renderer for the Anderson-D'Alonzo classification of odontoid (dens) fractures (types
// I/II/III). Group G. The clinician picks the type; the tile reports the type and its level description. As
// a fracture-type descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Anderson-D'Alonzo type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/anderson-dalonzo-v410.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/anderson-dalonzo-v410.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the spine team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'anderson-dalonzo'(root) {
    note(root, 'Anderson-D\'Alonzo classification of an odontoid (dens) fracture of C2, by the level of the fracture line. Pick the type. I: through the tip, above the transverse ligament (rare, usually stable); II: through the base / neck of the dens (most common, highest non-union risk); III: extending into the C2 body (usually heals with immobilization).');
    root.appendChild(select('Anderson-D\'Alonzo type', 'ad-type', [
      ['I', 'Type I - through the tip (above transverse ligament)'],
      ['II', 'Type II - through the base / neck of the dens'],
      ['III', 'Type III - extends into the C2 body'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ad-type'], () => safe(o, () => {
      const r = M.andersonDalonzo({ type: val('ad-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
