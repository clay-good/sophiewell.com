// spec-v392: renderer for the Hill classification of the gastroesophageal flap valve (grades I-IV). Group
// G. The clinician picks the grade; the tile reports the grade, its ridge/valve description, and whether
// it is an abnormal (grade III-IV) flap valve.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Hill grade; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/hill-flap-valve-v392.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hill-flap-valve-v392.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the treating team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hill-flap-valve'(root) {
    note(root, 'Hill classification of the gastroesophageal flap valve, graded from a retroflexed endoscopic view of the cardia. Pick the grade. I: prominent ridge, closely approximated (normal); II: less pronounced ridge, may open with respiration; III: diminished ridge, fails to close around the scope; IV: no ridge, junction stays open. Grades III-IV are associated with a hiatal hernia. Near-neighbors: la-esophagitis.');
    root.appendChild(select('Hill grade', 'hill-grade', [
      ['I', 'Grade I - prominent ridge (normal)'],
      ['II', 'Grade II - less pronounced ridge'],
      ['III', 'Grade III - diminished ridge, fails to close'],
      ['IV', 'Grade IV - no ridge, junction stays open'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['hill-grade'], () => safe(o, () => {
      const r = M.hillFlapValve({ grade: val('hill-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
