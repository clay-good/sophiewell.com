// spec-v450: renderer for the Reid classification of bronchiectasis (cylindrical/varicose/cystic). Group G.
// The radiologist picks the type; the tile reports the type and its morphology description. As a morphology
// descriptor it reports the type the radiologist has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Reid type; it never asserts a diagnosis, a severity determination, a
// treatment decision, or a prognosis (lib/reid-bronchiectasis-v450.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/reid-bronchiectasis-v450.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the pulmonology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'reid-bronchiectasis'(root) {
    note(root, 'The Reid classification of bronchiectasis by bronchial morphology on imaging. Pick the type. Cylindrical (tubular): uniformly dilated, regular outline (least severe); varicose: irregular, beaded outline; cystic (saccular): large cyst-like dilatations (most severe). Reports the morphology the radiologist has determined, not a diagnosis or a severity determination.');
    root.appendChild(select('Reid type', 'reid-type', [
      ['cylindrical', 'Cylindrical (tubular) - uniform, regular outline'],
      ['varicose', 'Varicose - irregular, beaded outline'],
      ['cystic', 'Cystic (saccular) - large cyst-like dilatations'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['reid-type'], () => safe(o, () => {
      const r = M.reidBronchiectasis({ type: val('reid-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
