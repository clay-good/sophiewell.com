// spec-v399: renderer for the Bismuth-Corlette classification of perihilar cholangiocarcinoma (types
// I/II/IIIa/IIIb/IV). Group G. The clinician picks the type; the tile reports the type and its
// ductal-extent description. As an anatomic-type descriptor it does not flag any type as abnormal.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Bismuth-Corlette type; it never asserts a diagnosis, a resectability
// determination, a treatment decision, or a prognosis (lib/bismuth-corlette-v399.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bismuth-corlette-v399.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the hepatobiliary surgery / MDT team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'bismuth-corlette'(root) {
    note(root, 'Bismuth-Corlette classification of a perihilar cholangiocarcinoma (Klatskin tumor), by how far the tumor extends along the hepatic-duct confluence. Pick the type. I: below the confluence; II: reaching the confluence; IIIa: extending to the right secondary ducts; IIIb: extending to the left secondary ducts; IV: bilateral secondary ducts or multifocal. Near-neighbors: strasberg-bdi.');
    root.appendChild(select('Bismuth-Corlette type', 'bc-type', [
      ['I', 'Type I - below (sparing) the confluence'],
      ['II', 'Type II - reaching the confluence'],
      ['IIIa', 'Type IIIa - extending to the right secondary ducts'],
      ['IIIb', 'Type IIIb - extending to the left secondary ducts'],
      ['IV', 'Type IV - bilateral secondary ducts or multifocal'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['bc-type'], () => safe(o, () => {
      const r = M.bismuthCorlette({ type: val('bc-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
