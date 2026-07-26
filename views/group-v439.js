// spec-v439: renderer for the Hamada grade of cuff tear arthropathy (1-5). Group G. The clinician picks the
// grade; the tile reports the grade and its radiographic description. As a grade descriptor it reports the
// grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Hamada grade; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/hamada-v439.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hamada-v439.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic / shoulder team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hamada'(root) {
    note(root, 'The Hamada classification of rotator cuff tear arthropathy on shoulder radiographs, by the acromiohumeral interval (AHI) and glenohumeral / acromial changes. Pick the grade. 1: AHI >= 6 mm; 2: AHI <= 5 mm; 3: AHI <= 5 mm with acetabularization; 4: glenohumeral arthritis; 5: humeral head collapse. A later modification subdivides grade 4 (4A/4B). Reports the grade the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: goutallier.');
    root.appendChild(select('Hamada grade', 'hamada-grade', [
      ['1', '1 - AHI >= 6 mm'],
      ['2', '2 - AHI <= 5 mm'],
      ['3', '3 - AHI <= 5 mm with acetabularization'],
      ['4', '4 - glenohumeral arthritis'],
      ['5', '5 - humeral head collapse'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['hamada-grade'], () => safe(o, () => {
      const r = M.hamada({ grade: val('hamada-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
