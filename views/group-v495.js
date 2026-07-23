// spec-v495: renderer for the Ranawat classification of rheumatoid cervical myelopathy (classes I, II, IIIA,
// IIIB). Group G. The clinician picks the class; the tile reports the class and its neurologic-deficit
// description. As a class descriptor it reports the class the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Ranawat class; it never asserts a diagnosis, a decision to
// operate, or a prognosis (lib/ranawat-myelopathy-v495.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ranawat-myelopathy-v495.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the spine team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ranawat-myelopathy'(root) {
    note(root, 'The Ranawat classification of the neurologic deficit of the rheumatoid cervical spine. Pick the class. I: pain but no neural deficit; II: subjective weakness with dysesthesias and hyperreflexia; IIIA: objective weakness and long-tract signs, still ambulatory; IIIB: the same, no longer ambulatory. Reports the class the clinician has determined, not a diagnosis or a decision to operate. Near-neighbors: nurick, mjoa.');
    root.appendChild(select('Ranawat class', 'ranawat-class', [
      ['I', 'I - pain, no neural deficit'],
      ['II', 'II - subjective weakness, hyperreflexia'],
      ['IIIA', 'IIIA - objective weakness, ambulatory'],
      ['IIIB', 'IIIB - objective weakness, non-ambulatory'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ranawat-class'], () => safe(o, () => {
      const r = M.ranawatMyelopathy({ klass: val('ranawat-class') });
      resultRow(o, [
        { text: r.band },
        { label: 'Class', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
