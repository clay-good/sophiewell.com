// spec-v381: renderer for the Winquist-Hansen classification of a femoral shaft fracture (types 0-IV).
// Group G. The clinician picks the type; the tile reports the type, its comminution/cortical-contact
// description, and whether it is a lower-cortical-contact (type III-IV) fracture.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Winquist-Hansen type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/winquist-hansen-v381.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/winquist-hansen-v381.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic / trauma team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'winquist-hansen'(root) {
    note(root, 'Winquist-Hansen classification of a femoral shaft fracture, by the extent of comminution and the cortical contact between the two main fragments. Pick the type. 0: none; I: small butterfly (< 25% width); II: larger butterfly (< 50% width, >= 50% contact); III: large fragment (> 50% width, < 50% contact); IV: circumferential, no contact. Near-neighbors: garden-classification, tile-pelvic.');
    root.appendChild(select('Winquist-Hansen type', 'wh-type', [
      ['0', 'Type 0 - no comminution'],
      ['I', 'Type I - small butterfly (< 25% width)'],
      ['II', 'Type II - larger butterfly (< 50% width)'],
      ['III', 'Type III - large fragment (> 50% width)'],
      ['IV', 'Type IV - circumferential, no cortical contact'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['wh-type'], () => safe(o, () => {
      const r = M.winquistHansen({ type: val('wh-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
