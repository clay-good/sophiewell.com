// spec-v506: renderer for the Jerger tympanogram classification (types A, As, Ad, B, C). Group G. The
// clinician or audiologist reads the type off the tracing; the tile reports the type and its shape
// description. As a type descriptor it reports the type that was read.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the tympanogram type; it never asserts a diagnosis, a hearing-loss
// severity, or a decision about tubes (lib/jerger-tympanogram-v506.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/jerger-tympanogram-v506.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the audiology and ENT team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'jerger-tympanogram'(root) {
    note(root, 'The Jerger classification of tympanogram shapes, by the peak pressure and peak compliance of the tracing. Pick the type. A: normal peak, normal pressure and compliance; As: shallow peak, reduced compliance (a stiff system); Ad: deep peak, abnormally high compliance; B: flat with no peak; C: peak at significantly negative pressure. The cause associations are the classic ones and are descriptive only, and type B is read together with the ear-canal volume. Reports the type read from the tracing, not a diagnosis, a hearing-loss severity, or a decision about tubes. Near-neighbor: sade-retraction.');
    root.appendChild(select('Tympanogram type', 'jerger-type', [
      ['A', 'A - normal peak, normal pressure and compliance'],
      ['As', 'As - shallow peak, reduced compliance'],
      ['Ad', 'Ad - deep peak, high compliance'],
      ['B', 'B - flat, no identifiable peak'],
      ['C', 'C - peak at significantly negative pressure'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['jerger-type'], () => safe(o, () => {
      const r = M.jergerTympanogram({ type: val('jerger-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
