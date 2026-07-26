// spec-v488: renderer for the Bigliani acromion morphology classification (types I-III). Group G. The clinician
// picks the type; the tile reports the type and its acromial-undersurface description. As a type descriptor it
// reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Bigliani type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/bigliani-acromion-v488.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bigliani-acromion-v488.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'bigliani-acromion'(root) {
    note(root, 'The Bigliani classification of acromion morphology, by the shape of the acromial undersurface on the supraspinatus-outlet view. Pick the type. I: flat; II: curved (paralleling the humeral head); III: hooked (anterior hook), most associated with subacromial impingement and rotator cuff tears. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: goutallier.');
    root.appendChild(select('Bigliani type', 'bigliani-type', [
      ['I', 'I - flat acromion'],
      ['II', 'II - curved acromion'],
      ['III', 'III - hooked acromion'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['bigliani-type'], () => safe(o, () => {
      const r = M.biglianiAcromion({ type: val('bigliani-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
