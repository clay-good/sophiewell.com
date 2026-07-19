// spec-v441: renderer for the Borden classification of dural AV fistula (types I-III). Group G. The clinician
// picks the type; the tile reports the type and its venous-drainage description. As a type descriptor it
// reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Borden type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/borden-davf-v441.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/borden-davf-v441.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the neurosurgery / neurointervention team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'borden-davf'(root) {
    note(root, 'The Borden classification of a dural arteriovenous fistula (DAVF), by the pattern of venous drainage. Pick the type. I: dural sinus / meningeal vein with antegrade flow, no cortical venous drainage (benign); II: dural sinus with retrograde cortical venous reflux; III: cortical venous drainage only (aggressive). The key discriminator is cortical venous drainage (II/III). Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbors: barrow-ccf, spetzler-ponce.');
    root.appendChild(select('Borden type', 'borden-type', [
      ['I', 'I - dural sinus, antegrade flow, no cortical drainage (benign)'],
      ['II', 'II - dural sinus with cortical venous reflux'],
      ['III', 'III - cortical venous drainage only (aggressive)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['borden-type'], () => safe(o, () => {
      const r = M.bordenDavf({ type: val('borden-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
