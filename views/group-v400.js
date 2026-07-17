// spec-v400: renderer for the Nyhus classification of groin hernias (types
// I/II/IIIa/IIIb/IIIc/IVa/IVb/IVc/IVd). Group G. The clinician picks the type; the tile reports the type and
// its anatomic description. As an anatomic-type descriptor it does not flag any type as abnormal.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Nyhus type; it never asserts a diagnosis, a repair recommendation, or
// a prognosis (lib/nyhus-hernia-v400.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nyhus-hernia-v400.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The repair decision stays with the operating surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'nyhus-hernia'(root) {
    note(root, 'Nyhus classification of a groin (inguinal / femoral) hernia, by the anatomy of the defect. Pick the type. I: indirect, normal ring; II: indirect, dilated ring, posterior wall intact; IIIa: direct; IIIb: large indirect encroaching on the posterior wall; IIIc: femoral; IV: recurrent (a direct, b indirect, c femoral, d combined).');
    root.appendChild(select('Nyhus type', 'nyhus-type', [
      ['I', 'Type I - indirect, normal internal ring'],
      ['II', 'Type II - indirect, dilated ring, posterior wall intact'],
      ['IIIa', 'Type IIIa - direct inguinal hernia'],
      ['IIIb', 'Type IIIb - large indirect (encroaches posterior wall / sliding / pantaloon)'],
      ['IIIc', 'Type IIIc - femoral hernia'],
      ['IVa', 'Type IVa - recurrent direct'],
      ['IVb', 'Type IVb - recurrent indirect'],
      ['IVc', 'Type IVc - recurrent femoral'],
      ['IVd', 'Type IVd - recurrent combined'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['nyhus-type'], () => safe(o, () => {
      const r = M.nyhusHernia({ type: val('nyhus-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
