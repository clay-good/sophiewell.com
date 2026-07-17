// spec-v398: renderer for the Carpentier functional classification of mitral regurgitation (types
// I/II/IIIa/IIIb). Group G. The clinician picks the type; the tile reports the type and its mechanism
// description. As a mechanism-type descriptor it does not flag any type as abnormal.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Carpentier type; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/carpentier-mr-v398.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/carpentier-mr-v398.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the cardiology / cardiac-surgery team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'carpentier-mr'(root) {
    note(root, 'Carpentier (the "French correction") functional classification of mitral regurgitation, by leaflet motion (the mitral analog of El Khoury for the aortic valve). Pick the type. I: normal motion (annular dilatation or perforation); II: excessive motion (prolapse or flail); IIIa: restricted motion in systole and diastole (structural, e.g. rheumatic); IIIb: restricted motion in systole only (functional / ischemic). Near-neighbors: el-khoury-ar.');
    root.appendChild(select('Carpentier type', 'carp-type', [
      ['I', 'Type I - normal motion, annular dilatation / perforation'],
      ['II', 'Type II - excessive motion (prolapse / flail)'],
      ['IIIa', 'Type IIIa - restricted motion, systole and diastole (structural)'],
      ['IIIb', 'Type IIIb - restricted motion, systole only (functional)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['carp-type'], () => safe(o, () => {
      const r = M.carpentierMr({ type: val('carp-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
