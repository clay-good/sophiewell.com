// spec-v473: renderer for the Todani choledochal cyst classification (types I-V). Group G. The clinician picks
// the type; the tile reports the type and its location/shape description. As a type descriptor it reports the
// type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Todani type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/todani-choledochal-v473.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/todani-choledochal-v473.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the hepatobiliary / surgical team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'todani-choledochal'(root) {
    note(root, 'The Todani classification of choledochal (congenital bile duct) cysts, by the location and shape of the cystic dilatation. Pick the type. I: extrahepatic fusiform/cystic dilatation (most common); II: a true extrahepatic diverticulum; III: choledochocele (intraduodenal segment); IV: multiple cysts (IVa intra- and extrahepatic, IVb extrahepatic only); V: Caroli disease (intrahepatic only). Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: bismuth-corlette.');
    root.appendChild(select('Todani type', 'todani-type', [
      ['I', 'I - extrahepatic fusiform/cystic dilatation (most common)'],
      ['II', 'II - true extrahepatic diverticulum'],
      ['III', 'III - choledochocele (intraduodenal segment)'],
      ['IV', 'IV - multiple cysts (IVa intra+extra, IVb extra only)'],
      ['V', 'V - Caroli disease (intrahepatic only)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['todani-type'], () => safe(o, () => {
      const r = M.todaniCholedochal({ type: val('todani-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
