// spec-v456: renderer for the Leddy-Packer FDP avulsion ("jersey finger") classification (types I-III). Group
// G. The clinician picks the type; the tile reports the type and its retraction / fragment description. As a
// type descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Leddy-Packer type; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/leddy-packer-v456.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/leddy-packer-v456.js';
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
  'leddy-packer'(root) {
    note(root, 'The Leddy-Packer classification of flexor digitorum profundus (FDP) avulsion — "jersey finger" — by the level of tendon retraction and any bony fragment. Pick the type. I: retraction into the palm (blood supply lost, most time-critical); II: retraction to the PIP joint, held by the vinculum longus (most common); III: a large bony fragment caught at the A4 pulley. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: eaton-littler.');
    root.appendChild(select('Leddy-Packer type', 'leddy-type', [
      ['I', 'I - retraction into the palm (vincula ruptured)'],
      ['II', 'II - retraction to the PIP joint (most common)'],
      ['III', 'III - large bony fragment at the A4 pulley'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['leddy-type'], () => safe(o, () => {
      const r = M.leddyPacker({ type: val('leddy-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
