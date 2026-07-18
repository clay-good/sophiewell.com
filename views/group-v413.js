// spec-v413: renderer for the Seinsheimer classification of subtrochanteric femur fractures
// (types I/IIA/IIB/IIC/IIIA/IIIB/IV/V). Group G. The clinician picks the type; the tile reports the type and
// its fragment/fracture-line description. As a fracture-type descriptor it reports the type the clinician has
// determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Seinsheimer type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/seinsheimer-subtroch-v413.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/seinsheimer-subtroch-v413.js';
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
  'seinsheimer-subtroch'(root) {
    note(root, 'Seinsheimer classification of a subtrochanteric femur fracture, by fragment count, fracture-line shape, and lesser-trochanter attachment. Pick the type. I: nondisplaced (<2 mm); IIA: two-part transverse; IIB/IIC: two-part spiral (lesser trochanter proximal / distal); IIIA: three-part spiral (lesser trochanter in third fragment); IIIB: three-part spiral with a butterfly fragment; IV: comminuted (four or more fragments); V: subtrochanteric-intertrochanteric. Near-neighbors: pauwels-femoral-neck, winquist-hansen, pipkin-femoral-head.');
    root.appendChild(select('Seinsheimer type', 'ss-type', [
      ['I', 'Type I - nondisplaced (<2 mm)'],
      ['IIA', 'Type IIA - two-part transverse'],
      ['IIB', 'Type IIB - two-part spiral, lesser troch on proximal fragment'],
      ['IIC', 'Type IIC - two-part spiral, lesser troch on distal fragment'],
      ['IIIA', 'Type IIIA - three-part spiral, lesser troch in third fragment'],
      ['IIIB', 'Type IIIB - three-part spiral with butterfly fragment'],
      ['IV', 'Type IV - comminuted (four or more fragments)'],
      ['V', 'Type V - subtrochanteric-intertrochanteric'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ss-type'], () => safe(o, () => {
      const r = M.seinsheimerSubtroch({ type: val('ss-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
