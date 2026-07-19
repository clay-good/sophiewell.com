// spec-v455: renderer for the Nunley-Vertullo midfoot (Lisfranc) sprain classification (stages I-III). Group
// G. The clinician picks the stage; the tile reports the stage and its weightbearing-radiograph description.
// As a stage descriptor it reports the stage the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Nunley-Vertullo stage; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/nunley-vertullo-v455.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nunley-vertullo-v455.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'nunley-vertullo'(root) {
    note(root, 'The Nunley-Vertullo classification of athletic midfoot (Lisfranc) sprains, by weightbearing-radiograph diastasis and arch height. Pick the stage. I: no diastasis or arch-height loss; II: 1 to 5 mm diastasis, no arch-height loss; III: more than 5 mm diastasis with arch-height loss. Reports the stage the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: lisfranc-myerson.');
    root.appendChild(select('Nunley-Vertullo stage', 'nunley-stage', [
      ['I', 'I - no diastasis, no arch-height loss'],
      ['II', 'II - 1 to 5 mm diastasis, no arch-height loss'],
      ['III', 'III - > 5 mm diastasis with arch-height loss'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['nunley-stage'], () => safe(o, () => {
      const r = M.nunleyVertullo({ stage: val('nunley-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
