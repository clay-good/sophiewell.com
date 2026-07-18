// spec-v417: renderer for the Wassel classification of thumb polydactyly (types I-VII). Group G. The
// clinician picks the type; the tile reports the type and its duplication-level description. As a
// duplication-level descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Wassel type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/wassel-thumb-v417.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/wassel-thumb-v417.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the hand / plastic-surgery team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'wassel-thumb'(root) {
    note(root, 'Wassel classification of thumb polydactyly (radial / preaxial thumb duplication), by the most proximal level of skeletal duplication. Pick the type. Odd numerals are a bifid bone (shared base); even numerals are a complete duplication; the numbers ascend proximally. I/II: distal phalanx; III/IV: proximal phalanx (IV most common); V/VI: metacarpal; VII: triphalangeal thumb. Near-neighbors: russe-scaphoid.');
    root.appendChild(select('Wassel type', 'wa-type', [
      ['I', 'Type I - bifid distal phalanx'],
      ['II', 'Type II - duplicated distal phalanx'],
      ['III', 'Type III - bifid proximal phalanx'],
      ['IV', 'Type IV - duplicated proximal phalanx (most common)'],
      ['V', 'Type V - bifid metacarpal'],
      ['VI', 'Type VI - duplicated metacarpal'],
      ['VII', 'Type VII - triphalangeal thumb'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['wa-type'], () => safe(o, () => {
      const r = M.wasselThumb({ type: val('wa-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
