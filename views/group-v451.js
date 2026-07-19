// spec-v451: renderer for the Sade tympanic-membrane retraction grade (I-IV). Group G. The clinician picks
// the grade; the tile reports the grade and its otoscopy description. As a grade descriptor it reports the
// grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Sade grade; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/sade-retraction-v451.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sade-retraction-v451.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the otolaryngology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'sade-retraction'(root) {
    note(root, 'The Sade classification of pars tensa tympanic-membrane retraction, by the depth of the retraction pocket on otoscopy. Pick the grade. I: mild, not touching the incus; II: touching the incus or stapes; III: touching the promontory (atelectasis) but not adherent; IV: adherent to the promontory (adhesive otitis media). Pars flaccida (attic) retraction is graded separately (Tos). Reports the grade the clinician has determined, not a diagnosis or a treatment decision.');
    root.appendChild(select('Sade grade', 'sade-grade', [
      ['I', 'I - mild, not touching the incus'],
      ['II', 'II - touching the incus or stapes'],
      ['III', 'III - touching the promontory (atelectasis)'],
      ['IV', 'IV - adherent to the promontory (adhesive)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['sade-grade'], () => safe(o, () => {
      const r = M.sadeRetraction({ grade: val('sade-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
