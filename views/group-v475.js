// spec-v475: renderer for the Glogau photoaging classification (types I-IV). Group G. The clinician picks the
// type; the tile reports the type and its photoaging-severity description. As a type descriptor it reports the
// type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Glogau type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/glogau-photoaging-v475.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/glogau-photoaging-v475.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the dermatology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'glogau-photoaging'(root) {
    note(root, 'The Glogau classification of photoaging, by the severity of wrinkles, keratoses, and dyschromia. Pick the type. I: "no wrinkles" (mild pigment changes, minimal wrinkles); II: "wrinkles in motion" (early keratoses, dynamic wrinkles); III: "wrinkles at rest" (dyschromia, telangiectasias, static wrinkles); IV: "only wrinkles" (yellow-gray skin, prior malignancies, wrinkles throughout). Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: fitzpatrick-skin-type.');
    root.appendChild(select('Glogau type', 'glogau-type', [
      ['I', 'I - no wrinkles (early photoaging)'],
      ['II', 'II - wrinkles in motion (dynamic)'],
      ['III', 'III - wrinkles at rest (static)'],
      ['IV', 'IV - only wrinkles (severe photoaging)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['glogau-type'], () => safe(o, () => {
      const r = M.glogauPhotoaging({ type: val('glogau-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
