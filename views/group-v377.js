// spec-v377: renderer for the Gartland classification of a pediatric extension-type supracondylar
// humerus fracture (types I-III + modified IV). Group G. The clinician picks the type; the tile reports
// the type, its displacement/hinge description, and whether it is a displaced (type II-IV) fracture.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Gartland type; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/gartland-supracondylar-v377.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gartland-supracondylar-v377.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic / trauma team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'gartland-supracondylar'(root) {
    note(root, 'Gartland classification (Gartland 1959; modified type IV, Leitch 2006) of a pediatric extension-type supracondylar humerus fracture. Pick the type. I: nondisplaced (anterior humeral line through the capitellum); II: displaced with an intact posterior cortical hinge (Wilkins IIA stable / IIB malrotated); III: completely displaced, no cortical contact; IV: multidirectional instability, complete periosteal disruption. Near-neighbors: salter-harris, neer-classification.');
    root.appendChild(select('Gartland type', 'gartland-type', [
      ['I', 'Type I - nondisplaced'],
      ['II', 'Type II - displaced, posterior hinge intact'],
      ['III', 'Type III - completely displaced'],
      ['IV', 'Type IV - multidirectional instability (modified)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['gartland-type'], () => safe(o, () => {
      const r = M.gartlandSupracondylar({ type: val('gartland-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
