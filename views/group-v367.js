// spec-v367: renderer for the Penetration-Aspiration Scale (PAS, scores 1-8). Group G. The clinician
// picks the worst airway-invasion score seen on the swallow study; the tile reports the score, its
// description, the penetration/aspiration category, and flags aspiration (score 6-8).
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the PAS score; it never asserts a diagnosis, a diet/management
// decision, or a prognosis (lib/pas-swallow-v367.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pas-swallow-v367.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. A single worst-score does not capture the whole study; the management decision stays with the speech-language pathologist and team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'pas-swallow'(root) {
    note(root, 'Penetration-Aspiration Scale (Rosenbek 1996) for a swallow study (videofluoroscopy / FEES). Pick the worst airway-invasion score. 1: no airway invasion; 2-5: penetration (above / at the vocal folds); 6-8: aspiration (below the vocal folds); 8: silent aspiration. Near-neighbors: guss, eat-10.');
    root.appendChild(select('PAS score', 'pas-score', [
      ['1', '1 - does not enter the airway'],
      ['2', '2 - above vocal folds, ejected (penetration)'],
      ['3', '3 - above vocal folds, not ejected (penetration)'],
      ['4', '4 - contacts vocal folds, ejected (penetration)'],
      ['5', '5 - contacts vocal folds, not ejected (penetration)'],
      ['6', '6 - below vocal folds, ejected (aspiration)'],
      ['7', '7 - below vocal folds, not ejected despite effort (aspiration)'],
      ['8', '8 - below vocal folds, no effort to eject (silent aspiration)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['pas-score'], () => safe(o, () => {
      const r = M.pasSwallow({ score: val('pas-score') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
