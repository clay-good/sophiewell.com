// spec-v457: renderer for the Stulberg Perthes residual-deformity classification (classes I-V). Group G. The
// clinician picks the class; the tile reports the class and its sphericity / congruency description. As a
// class descriptor it reports the class the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Stulberg class; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/stulberg-v457.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/stulberg-v457.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'stulberg'(root) {
    note(root, 'The Stulberg classification of the residual femoral head after Legg-Calve-Perthes disease, by sphericity and joint congruency at skeletal maturity. Pick the class. I: normal spherical head; II: spherical but with coxa magna, a short neck, or an abnormal acetabulum; III: non-spherical (ovoid/mushroom/umbrella) but not flat; IV: flat head, congruent; V: flat head, incongruent. Reports the class the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: catterall-perthes.');
    root.appendChild(select('Stulberg class', 'stulberg-class', [
      ['I', 'I - normal spherical head'],
      ['II', 'II - spherical, with coxa magna / short neck / abnormal acetabulum'],
      ['III', 'III - non-spherical but not flat'],
      ['IV', 'IV - flat head, congruent'],
      ['V', 'V - flat head, incongruent'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['stulberg-class'], () => safe(o, () => {
      const r = M.stulberg({ cls: val('stulberg-class') });
      resultRow(o, [
        { text: r.band },
        { label: 'Class', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
