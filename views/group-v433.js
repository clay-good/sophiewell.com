// spec-v433: renderer for the Modic classification of vertebral endplate MRI changes (types 1/2/3). Group G.
// The radiologist picks the type; the tile reports the type and its T1/T2 signal description. As an
// imaging-type descriptor it reports the type the radiologist has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Modic type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/modic-changes-v433.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/modic-changes-v433.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the treating team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'modic-changes'(root) {
    note(root, 'The Modic classification of vertebral endplate / subchondral bone-marrow changes on MRI in degenerative disc disease, by the T1 and T2 signal. Pick the type. 1: edema/inflammation (T1 low, T2 high); 2: fatty marrow (T1 high, T2 iso-to-high); 3: bony sclerosis (T1 low, T2 low). Mixed types (1/2, 2/3) are described when features coexist. Reports the type the radiologist has determined, not a diagnosis or a treatment decision. Near-neighbor: meyerding-spondylolisthesis.');
    root.appendChild(select('Modic type', 'modic-type', [
      ['1', '1 - edema/inflammation (T1 low, T2 high)'],
      ['2', '2 - fatty marrow (T1 high, T2 iso-to-high)'],
      ['3', '3 - bony sclerosis (T1 low, T2 low)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['modic-type'], () => safe(o, () => {
      const r = M.modicChanges({ type: val('modic-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
