// spec-v497: renderer for the Schobinger staging of a peripheral arteriovenous malformation (stages I-IV).
// Group G. The clinician picks the stage; the tile reports the stage and its clinical description. As a stage
// descriptor it reports the stage the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Schobinger stage; it never asserts a diagnosis, an indication for
// embolization or resection, or a prognosis (lib/schobinger-avm-v497.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/schobinger-avm-v497.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the vascular-anomalies team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'schobinger-avm'(root) {
    note(root, 'The Schobinger staging of a peripheral (extracranial) arteriovenous malformation. The staging is cumulative: each stage carries the findings of the one below it. Pick the stage. I: quiescence, a warm stain with shunting on Doppler; II: expansion, with pulsation, thrill, and bruit; III: destruction, with skin breakdown, bleeding, pain, or necrosis; IV: decompensation, with high-output cardiac failure. Reports the stage the clinician has determined, not an indication for embolization or resection. For an intracranial AVM see spetzler-martin.');
    root.appendChild(select('Schobinger stage', 'schobinger-stage', [
      ['I', 'I - quiescence (warm stain, shunting)'],
      ['II', 'II - expansion (pulsation, thrill, bruit)'],
      ['III', 'III - destruction (ulceration, bleeding, pain)'],
      ['IV', 'IV - decompensation (high-output cardiac failure)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['schobinger-stage'], () => safe(o, () => {
      const r = M.schobingerAvm({ stage: val('schobinger-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
