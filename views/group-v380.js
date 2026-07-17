// spec-v380: renderer for the Young-Burgess classification of a pelvic ring injury (LC I-III, APC I-III,
// VS, CM). Group G. The clinician picks the pattern; the tile reports the pattern, its mechanism/stability
// description, and whether it is one of the typically-unstable patterns.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Young-Burgess pattern; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/young-burgess-v380.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/young-burgess-v380.js';
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
  'young-burgess'(root) {
    note(root, 'Young-Burgess classification of a pelvic ring injury, by the force vector (mechanism). Pick the pattern. LC (lateral compression) I-III; APC (anteroposterior compression) I-III; VS (vertical shear); CM (combined mechanism). Lateral-compression patterns are the most common and often stable; APC-II/III, LC-III, VS, and CM are the typically-unstable patterns. Near-neighbors: tile-pelvic, iss-rts.');
    root.appendChild(select('Young-Burgess pattern', 'yb-pattern', [
      ['LC-I', 'LC-I - lateral compression, sacral compression'],
      ['LC-II', 'LC-II - lateral compression, crescent fracture'],
      ['LC-III', 'LC-III - windswept pelvis'],
      ['APC-I', 'APC-I - symphysis widening < 2.5 cm'],
      ['APC-II', 'APC-II - open-book, rotationally unstable'],
      ['APC-III', 'APC-III - complete SI disruption'],
      ['VS', 'VS - vertical shear'],
      ['CM', 'CM - combined mechanism'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['yb-pattern'], () => safe(o, () => {
      const r = M.youngBurgess({ pattern: val('yb-pattern') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Pattern', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
