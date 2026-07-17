// spec-v395: renderer for the Parks classification of an anal fistula (intersphincteric /
// transsphincteric / suprasphincteric / extrasphincteric). Group G. The clinician picks the type; the
// tile reports the type, its sphincter-relationship description, and whether it is a complex (supra- /
// extrasphincteric) fistula.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Parks type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/parks-fistula-v395.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/parks-fistula-v395.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the colorectal / surgical team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'parks-fistula'(root) {
    note(root, 'Parks classification of an anal fistula (fistula-in-ano), by the tract\'s relationship to the anal sphincter complex. Pick the type. Intersphincteric: through the internal sphincter only (most common). Transsphincteric: through both sphincters. Suprasphincteric: above the puborectalis (complex). Extrasphincteric: outside the sphincter complex (complex). Near-neighbors: lauren-gastric.');
    root.appendChild(select('Parks type', 'parks-type', [
      ['intersphincteric', 'Intersphincteric - internal sphincter only'],
      ['transsphincteric', 'Transsphincteric - through both sphincters'],
      ['suprasphincteric', 'Suprasphincteric - above the puborectalis'],
      ['extrasphincteric', 'Extrasphincteric - outside the sphincter complex'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['parks-type'], () => safe(o, () => {
      const r = M.parksFistula({ type: val('parks-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
