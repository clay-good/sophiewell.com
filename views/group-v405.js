// spec-v405: renderer for the modified Savary-Miller classification of reflux esophagitis (grades
// I/II/III/IV/V). Group G. The clinician picks the grade; the tile reports the grade and its endoscopic
// description. As a grading descriptor it reports the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Savary-Miller grade; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/savary-miller-v405.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/savary-miller-v405.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the gastroenterology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'savary-miller'(root) {
    note(root, 'Modified Savary-Miller endoscopic classification of reflux esophagitis, by the extent of the mucosal lesions - the older / alternative companion to the Los Angeles classification. Pick the grade. I: single erosion on one fold; II: multiple non-confluent erosions on more than one fold; III: circumferential confluent erosions; IV: chronic complications (ulcer / stricture / short esophagus); V: Barrett\'s. Near-neighbors: la-esophagitis.');
    root.appendChild(select('Savary-Miller grade', 'sm-grade', [
      ['I', 'Grade I - single erosion on one fold'],
      ['II', 'Grade II - multiple non-confluent erosions, >1 fold'],
      ['III', 'Grade III - circumferential confluent erosions'],
      ['IV', 'Grade IV - chronic complications (ulcer / stricture)'],
      ['V', 'Grade V - Barrett esophagus'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['sm-grade'], () => safe(o, () => {
      const r = M.savaryMiller({ grade: val('sm-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
