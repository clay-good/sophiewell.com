// spec-v385: renderer for the Schwab & England ADL scale (0-100%, 10% steps). Group G. The clinician
// picks the level; the tile reports the level and its functional-independence description. As a
// functional-status descriptor (like Karnofsky / ECOG) it does not flag any level as abnormal.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Schwab & England level; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/schwab-england-v385.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/schwab-england-v385.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the treating team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'schwab-england'(root) {
    note(root, 'Schwab & England ADL scale - a global 0-100% (10% steps) measure of functional independence, widely used in Parkinson disease. Pick the level. 100%: completely independent; 50%: needs help with half of chores; 0%: bedridden, vegetative functions failing. Near-neighbors: hoehn-yahr.');
    root.appendChild(select('Schwab & England level', 'se-percent', [
      ['100', '100% - completely independent, normal'],
      ['90', '90% - independent, some slowness'],
      ['80', '80% - independent in most chores, takes twice as long'],
      ['70', '70% - not completely independent'],
      ['60', '60% - some dependency'],
      ['50', '50% - needs help with half of chores'],
      ['40', '40% - very dependent'],
      ['30', '30% - a few chores alone, much help needed'],
      ['20', '20% - nothing alone, severe invalid'],
      ['10', '10% - totally dependent, helpless'],
      ['0', '0% - bedridden, vegetative functions failing'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['se-percent'], () => safe(o, () => {
      const r = M.schwabEngland({ percent: val('se-percent') });
      resultRow(o, [
        { text: r.band },
        { label: 'Level', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
