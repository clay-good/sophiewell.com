// spec-v442: renderer for the Zabramski classification of cerebral cavernous malformation (types I-IV).
// Group G. The radiologist picks the type; the tile reports the type and its MRI description. As an imaging-
// type descriptor it reports the type the radiologist has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Zabramski type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/zabramski-v442.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/zabramski-v442.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the neurosurgery / neuroradiology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'zabramski'(root) {
    note(root, 'The Zabramski classification of a cerebral cavernous malformation (CCM), by its MRI appearance (hemorrhage age and signal). Pick the type. I: subacute hemorrhage (hyperintense on T1/T2); II: classic popcorn/mulberry with a hemosiderin rim; III: chronic hemorrhage (iso- to hypointense); IV: punctate microhemorrhages seen only on GRE/SWI. Reports the type the radiologist has determined, not a diagnosis or a treatment decision. Near-neighbors: barrow-ccf, spetzler-ponce.');
    root.appendChild(select('Zabramski type', 'zabramski-type', [
      ['I', 'I - subacute hemorrhage (hyperintense T1/T2)'],
      ['II', 'II - popcorn/mulberry with hemosiderin rim'],
      ['III', 'III - chronic hemorrhage (iso- to hypointense)'],
      ['IV', 'IV - punctate microhemorrhages (GRE/SWI only)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['zabramski-type'], () => safe(o, () => {
      const r = M.zabramski({ type: val('zabramski-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
