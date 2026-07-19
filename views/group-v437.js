// spec-v437: renderer for the Goutallier grade of rotator cuff fatty infiltration (0-4). Group G. The
// radiologist picks the grade; the tile reports the grade and its fat-vs-muscle description. As an imaging-
// grade descriptor it reports the grade the radiologist has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Goutallier grade; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/goutallier-v437.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/goutallier-v437.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic / shoulder team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'goutallier'(root) {
    note(root, 'The Goutallier classification of rotator cuff muscle fatty infiltration on CT/MRI, by the amount of fat relative to muscle in the cuff belly. Pick the grade. 0: normal, no fatty streaks; 1: some fatty streaks; 2: less fat than muscle; 3: fat equals muscle; 4: more fat than muscle. Reports the grade the radiologist has determined, not a diagnosis or a reparability decision. Near-neighbor: outerbridge-cartilage.');
    root.appendChild(select('Goutallier grade', 'goutallier-grade', [
      ['0', '0 - normal, no fatty streaks'],
      ['1', '1 - some fatty streaks'],
      ['2', '2 - less fat than muscle'],
      ['3', '3 - fat equals muscle'],
      ['4', '4 - more fat than muscle'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['goutallier-grade'], () => safe(o, () => {
      const r = M.goutallier({ grade: val('goutallier-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
