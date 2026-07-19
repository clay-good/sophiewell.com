// spec-v453: renderer for the Schatzker tibial plateau fracture classification (types I-VI). Group G. The
// clinician picks the type; the tile reports the type and its fracture-pattern description. As a type
// descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Schatzker type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/schatzker-v453.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/schatzker-v453.js';
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
  'schatzker'(root) {
    note(root, 'The Schatzker classification of tibial plateau fractures, by fracture pattern and location. Pick the type. I: lateral split; II: lateral split-depression; III: lateral pure depression; IV: medial plateau; V: bicondylar; VI: plateau fracture with metaphyseal-diaphyseal dissociation. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: lauge-hansen.');
    root.appendChild(select('Schatzker type', 'schatzker-type', [
      ['I', 'I - lateral split, no depression'],
      ['II', 'II - lateral split-depression'],
      ['III', 'III - lateral pure depression'],
      ['IV', 'IV - medial plateau'],
      ['V', 'V - bicondylar (both plateaus)'],
      ['VI', 'VI - plateau with diaphyseal dissociation'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['schatzker-type'], () => safe(o, () => {
      const r = M.schatzker({ type: val('schatzker-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
