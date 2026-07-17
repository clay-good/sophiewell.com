// spec-v401: renderer for the modified Zargar endoscopic classification of caustic esophagogastric injury
// (grades 0/1/2a/2b/3a/3b/4). Group G. The clinician picks the grade; the tile reports the grade and its
// endoscopic description. As an injury-grade descriptor it reports the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Zargar grade; it never asserts a diagnosis, a management decision, or
// a prognosis (lib/zargar-caustic-v401.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/zargar-caustic-v401.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the gastroenterology / surgery team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'zargar-caustic'(root) {
    note(root, 'Modified Zargar endoscopic classification of a caustic / corrosive esophagogastric injury, by the depth and extent of the burn. Pick the grade. 0: normal; 1: edema / hyperemia; 2a: superficial; 2b: deep or circumferential ulceration; 3a: focal necrosis; 3b: extensive necrosis; 4: perforation.');
    root.appendChild(select('Zargar grade', 'zargar-grade', [
      ['0', 'Grade 0 - normal mucosa'],
      ['1', 'Grade 1 - edema / hyperemia'],
      ['2a', 'Grade 2a - superficial injury'],
      ['2b', 'Grade 2b - deep or circumferential ulceration'],
      ['3a', 'Grade 3a - focal necrosis'],
      ['3b', 'Grade 3b - extensive necrosis'],
      ['4', 'Grade 4 - perforation'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['zargar-grade'], () => safe(o, () => {
      const r = M.zargarCaustic({ grade: val('zargar-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
