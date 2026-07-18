// spec-v415: renderer for the Geissler arthroscopic classification of interosseous carpal-ligament injury
// (grades I/II/III/IV). Group G. The clinician picks the grade; the tile reports the grade and its
// arthroscopic-appearance description. As a grading descriptor it reports the grade the clinician has
// determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Geissler grade; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/geissler-carpal-v415.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/geissler-carpal-v415.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the hand / orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'geissler-carpal'(root) {
    note(root, 'Geissler arthroscopic classification of an interosseous (scapholunate / lunotriquetral) carpal-ligament injury, grading instability by what is seen from the radiocarpal vs midcarpal joint. Pick the grade. I: radiocarpal attenuation, midcarpal alignment congruent; II: added midcarpal incongruency, no probe passage; III: incongruency from both joints, a probe passes; IV: gross instability, a 2.7 mm arthroscope passes (drive-through sign). Near-neighbors: mayfield-perilunate.');
    root.appendChild(select('Geissler grade', 'gc-grade', [
      ['I', 'Grade I - radiocarpal attenuation, midcarpal congruent'],
      ['II', 'Grade II - added midcarpal incongruency, no probe passage'],
      ['III', 'Grade III - probe passes the interval (both joints)'],
      ['IV', 'Grade IV - arthroscope passes (drive-through sign)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['gc-grade'], () => safe(o, () => {
      const r = M.geisslerCarpal({ grade: val('gc-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
