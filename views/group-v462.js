// spec-v462: renderer for the GMFCS cerebral-palsy gross-motor classification (levels I-V). Group G. The
// clinician picks the level; the tile reports the level and its mobility description. As a level descriptor it
// reports the level the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the GMFCS level; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/gmfcs-v462.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gmfcs-v462.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the pediatric-neurology / rehabilitation team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'gmfcs'(root) {
    note(root, 'The Gross Motor Function Classification System (GMFCS) for cerebral palsy, by self-initiated movement (emphasizing sitting and walking). Pick the level. I: walks without limitations; II: walks with limitations; III: walks using a hand-held mobility device; IV: self-mobility with limitations, may use powered mobility; V: transported in a manual wheelchair. Reports the level the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: sarnat-hie.');
    root.appendChild(select('GMFCS level', 'gmfcs-level', [
      ['I', 'I - walks without limitations'],
      ['II', 'II - walks with limitations'],
      ['III', 'III - walks using a hand-held mobility device'],
      ['IV', 'IV - self-mobility with limitations; may use powered mobility'],
      ['V', 'V - transported in a manual wheelchair'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['gmfcs-level'], () => safe(o, () => {
      const r = M.gmfcs({ level: val('gmfcs-level') });
      resultRow(o, [
        { text: r.band },
        { label: 'Level', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
