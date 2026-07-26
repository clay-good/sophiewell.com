// spec-v487: renderer for the Rockwood acromioclavicular joint injury classification (types I-VI). Group G. The
// clinician picks the type; the tile reports the type and its ligament-injury / displacement description. As a
// type descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Rockwood type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/rockwood-ac-v487.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rockwood-ac-v487.js';
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
  'rockwood-ac'(root) {
    note(root, 'The Rockwood classification of acromioclavicular (AC) joint injuries, by AC and coracoclavicular (CC) ligament integrity and clavicular displacement. Pick the type. I: AC sprain (ligaments intact); II: AC torn, CC intact, slight widening; III: both torn, CC distance 25-100% increased; IV: posterior clavicle displacement; V: gross superior displacement (CC 100-300%); VI: inferior clavicle displacement. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: samilson-prieto.');
    root.appendChild(select('Rockwood type', 'rockwood-type', [
      ['I', 'I - AC sprain, ligaments intact'],
      ['II', 'II - AC torn, CC intact, slight widening'],
      ['III', 'III - both torn, CC distance 25-100% increased'],
      ['IV', 'IV - posterior clavicle displacement'],
      ['V', 'V - gross superior displacement (CC 100-300%)'],
      ['VI', 'VI - inferior clavicle displacement'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['rockwood-type'], () => safe(o, () => {
      const r = M.rockwoodAc({ type: val('rockwood-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
