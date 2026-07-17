// spec-v357: renderer for the NYHA functional classification of heart failure (classes I-IV). Group G.
// The clinician picks the functional class; the tile reports the class, its symptom-limitation
// description, and whether it is an advanced (class III-IV) limitation.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the NYHA class; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/nyha-class-v357.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nyha-class-v357.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The class is symptom-based and can vary; the management decision stays with the treating clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'nyha-class'(root) {
    note(root, 'NYHA (New York Heart Association) functional classification of heart failure. Pick the class from the patient\'s symptoms. I: no limitation; II: slight limitation, symptoms on ordinary activity; III: marked limitation, symptoms on less-than-ordinary activity; IV: symptoms at rest. Comfortable at rest in I-III. Used as an input to many cardiac risk scores. Near-neighbors: maggic-hf, euroscore-2.');
    root.appendChild(select('NYHA class', 'nyha-class', [
      ['I', 'Class I - no limitation of physical activity'],
      ['II', 'Class II - slight limitation; symptoms on ordinary activity'],
      ['III', 'Class III - marked limitation; symptoms on less-than-ordinary activity'],
      ['IV', 'Class IV - symptoms at rest / any activity causes discomfort'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['nyha-class'], () => safe(o, () => {
      const r = M.nyhaClass({ cls: val('nyha-class') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
