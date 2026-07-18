// spec-v423: renderer for the Marsh-Oberhuber classification of celiac histology (0/1/2/3a/3b/3c). Group G.
// The pathologist picks the type; the tile reports the type and its histologic description. As a histologic
// type descriptor it reports the type the pathologist has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Marsh-Oberhuber type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/marsh-oberhuber-v423.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/marsh-oberhuber-v423.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the gastroenterology / pathology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'marsh-oberhuber'(root) {
    note(root, 'Modified Marsh (Marsh-Oberhuber) classification of the duodenal histology in celiac disease, by the intraepithelial-lymphocyte infiltrate, crypt architecture, and villous atrophy. Pick the type. 0: preinfiltrative (normal); 1: infiltrative (increased IELs, normal villi); 2: hyperplastic (increased IELs + crypt hyperplasia); 3a: partial villous atrophy; 3b: subtotal; 3c: total. Reports the type, not a celiac diagnosis (which needs serology and the clinical picture).');
    root.appendChild(select('Marsh-Oberhuber type', 'mo-type', [
      ['0', '0 - preinfiltrative (normal)'],
      ['1', '1 - infiltrative (increased IELs, normal villi)'],
      ['2', '2 - hyperplastic (increased IELs + crypt hyperplasia)'],
      ['3a', '3a - partial villous atrophy'],
      ['3b', '3b - subtotal villous atrophy'],
      ['3c', '3c - total villous atrophy'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['mo-type'], () => safe(o, () => {
      const r = M.marshOberhuber({ type: val('mo-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
