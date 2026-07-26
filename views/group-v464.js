// spec-v464: renderer for the Crawford thoracoabdominal aortic aneurysm classification (extents I-IV). Group
// G. The clinician picks the extent; the tile reports the extent and its aortic-segment description. As an
// extent descriptor it reports the extent the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Crawford extent; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/crawford-taaa-v464.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/crawford-taaa-v464.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the vascular / cardiac-surgery team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'crawford-taaa'(root) {
    note(root, 'The Crawford classification of thoracoabdominal aortic aneurysms, by the extent of aortic involvement. Pick the extent. I: left subclavian to above the renals; II: left subclavian to the aortoiliac bifurcation (most extensive); III: distal descending thoracic (sixth intercostal space) to below the renals; IV: the entire abdominal aorta (diaphragm to bifurcation). The Safi modification adds an extent V. Reports the extent the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: debakey.');
    root.appendChild(select('Crawford extent', 'crawford-extent', [
      ['I', 'I - left subclavian to above the renals'],
      ['II', 'II - left subclavian to the aortoiliac bifurcation'],
      ['III', 'III - distal descending thoracic to below the renals'],
      ['IV', 'IV - the entire abdominal aorta'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['crawford-extent'], () => safe(o, () => {
      const r = M.crawfordTaaa({ extent: val('crawford-extent') });
      resultRow(o, [
        { text: r.band },
        { label: 'Extent', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
