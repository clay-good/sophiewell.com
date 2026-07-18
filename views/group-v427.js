// spec-v427: renderer for the Vaughan Williams antiarrhythmic classification (Ia/Ib/Ic/II/III/IV). Group G.
// The user picks the class; the tile reports the class, its mechanism, and representative agents. As a
// classification descriptor it reports the class the user has selected.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Vaughan Williams class; it never asserts a prescribing decision, a dose,
// a diagnosis, or a prognosis (lib/vaughan-williams-v427.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/vaughan-williams-v427.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The prescribing decision stays with the treating team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'vaughan-williams'(root) {
    note(root, 'The Vaughan Williams classification of antiarrhythmic drug actions, grouping antiarrhythmics by primary electrophysiologic mechanism. Pick the class. Ia/Ib/Ic: sodium-channel blockers (moderate/weak/marked block); II: beta-blockers; III: potassium-channel blockers; IV: non-dihydropyridine calcium-channel blockers. Many agents act in more than one class (e.g., amiodarone).');
    root.appendChild(select('Vaughan Williams class', 'vw-class', [
      ['Ia', 'Ia - Na-channel blocker, moderate (quinidine, procainamide)'],
      ['Ib', 'Ib - Na-channel blocker, weak (lidocaine, mexiletine)'],
      ['Ic', 'Ic - Na-channel blocker, marked (flecainide, propafenone)'],
      ['II', 'II - beta-blocker (metoprolol, propranolol, esmolol)'],
      ['III', 'III - K-channel blocker (amiodarone, sotalol, dofetilide)'],
      ['IV', 'IV - non-DHP Ca-channel blocker (verapamil, diltiazem)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['vw-class'], () => safe(o, () => {
      const r = M.vaughanWilliams({ cls: val('vw-class') });
      resultRow(o, [
        { text: r.band },
        { label: 'Class', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
