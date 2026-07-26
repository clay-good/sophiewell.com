// spec-v438: renderer for the Eaton-Littler thumb CMC arthritis stage (I-IV). Group G. The clinician picks
// the stage; the tile reports the stage and its radiographic description. As a stage descriptor it reports
// the stage the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Eaton-Littler stage; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/eaton-littler-v438.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/eaton-littler-v438.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the hand / orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'eaton-littler'(root) {
    note(root, 'The Eaton-Littler classification of thumb carpometacarpal (basal-joint) osteoarthritis, by the radiographic joint findings. Pick the stage. I: normal or slightly widened joint (synovitis); II: slight narrowing, osteophytes <2 mm, subluxation up to 1/3; III: marked narrowing, osteophytes >=2 mm, subluxation >1/3, scaphotrapezial joint spared; IV: pantrapezial arthritis. Reports the stage the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: outerbridge-cartilage.');
    root.appendChild(select('Eaton-Littler stage', 'eaton-stage', [
      ['I', 'I - normal or slightly widened joint (synovitis)'],
      ['II', 'II - slight narrowing, osteophytes <2 mm'],
      ['III', 'III - marked narrowing, osteophytes >=2 mm'],
      ['IV', 'IV - pantrapezial arthritis'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['eaton-stage'], () => safe(o, () => {
      const r = M.eatonLittler({ stage: val('eaton-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
