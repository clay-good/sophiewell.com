// spec-v467: renderer for the Bromage neuraxial motor-block scale (grades I-IV). Group G. The clinician picks
// the grade; the tile reports the grade and its residual-movement description. As a grade descriptor it reports
// the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Bromage grade; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/bromage-scale-v467.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bromage-scale-v467.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the anesthesia team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'bromage-scale'(root) {
    note(root, 'The Bromage scale of motor block after neuraxial (epidural / spinal) anesthesia, by residual lower-limb movement. Pick the grade. I: nil (free knees and feet); II: partial (just able to flex the knees); III: almost complete (unable to flex the knees, some foot movement); IV: complete (unable to move the legs or feet). A modified Bromage renumbers these 0-3. Reports the grade the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: aldrete.');
    root.appendChild(select('Bromage grade', 'bromage-grade', [
      ['I', 'I - nil (free knees and feet)'],
      ['II', 'II - partial (just able to flex the knees)'],
      ['III', 'III - almost complete (some foot movement)'],
      ['IV', 'IV - complete (no leg or foot movement)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['bromage-grade'], () => safe(o, () => {
      const r = M.bromageScale({ grade: val('bromage-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
