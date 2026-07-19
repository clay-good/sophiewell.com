// spec-v434: renderer for the Pfirrmann disc degeneration grade (I-V). Group G. The radiologist picks the
// grade; the tile reports the grade and its MRI description. As an imaging-grade descriptor it reports the
// grade the radiologist has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Pfirrmann grade; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/pfirrmann-disc-v434.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pfirrmann-disc-v434.js';
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
  'pfirrmann-disc'(root) {
    note(root, 'The Pfirrmann classification of lumbar intervertebral disc degeneration on T2 MRI, by disc structure, nucleus-annulus distinction, signal, and height. Pick the grade. I: homogeneous bright, normal; II: inhomogeneous bright, normal; III: gray, unclear distinction; IV: gray-black, lost distinction; V: black, collapsed disc space. Reports the grade the radiologist has determined, not a diagnosis or a treatment decision. Near-neighbors: modic-changes, meyerding-spondylolisthesis.');
    root.appendChild(select('Pfirrmann grade', 'pfirrmann-grade', [
      ['I', 'I - homogeneous bright white, normal height'],
      ['II', 'II - inhomogeneous bright, normal height'],
      ['III', 'III - gray, unclear distinction'],
      ['IV', 'IV - gray to black, lost distinction'],
      ['V', 'V - black, collapsed disc space'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['pfirrmann-grade'], () => safe(o, () => {
      const r = M.pfirrmannDisc({ grade: val('pfirrmann-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
