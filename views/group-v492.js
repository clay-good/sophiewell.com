// spec-v492: renderer for the Hattrup-Johnson hallux rigidus grading (grades I-III). Group G. The clinician
// picks the grade; the tile reports the grade and its osteophyte/joint-space description. As a grade descriptor
// it reports the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Hattrup-Johnson grade; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/hattrup-johnson-v492.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hattrup-johnson-v492.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic / foot-and-ankle team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hattrup-johnson'(root) {
    note(root, 'The Hattrup-Johnson classification of hallux rigidus (first metatarsophalangeal osteoarthritis), by radiographic osteophyte formation and joint-space change. Pick the grade. I: mild (dorsal osteophyte, preserved joint space); II: moderate (dorsal/medial/lateral osteophytes with narrowing and sclerosis); III: severe (marked osteophytes with joint-space loss and subchondral cysts). Reports the grade the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: hawkins-talar.');
    root.appendChild(select('Hattrup-Johnson grade', 'hattrup-grade', [
      ['I', 'I - mild (preserved joint space)'],
      ['II', 'II - moderate (narrowing and sclerosis)'],
      ['III', 'III - severe (joint-space loss, cysts)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['hattrup-grade'], () => safe(o, () => {
      const r = M.hattrupJohnson({ grade: val('hattrup-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
