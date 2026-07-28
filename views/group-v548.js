// spec-v548: renderer for patient-prosthesis mismatch by indexed effective orifice area. Group G. A position
// select and two number inputs under an h2 section heading (never h3 - an h3 under the page h1 is a
// heading-level skip).
//
// The position is a required first choice, not a default, because the thresholds are not interchangeable:
// an indexed area of 1.0 is entirely normal aortic and moderate mismatch mitral. Each position also reports
// its OWN citation, since the mitral grading does not come from the paper usually cited for mismatch
// (lib/ppm-eoai-v548.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile grades a hemodynamic
// relationship; it never diagnoses prosthetic dysfunction and never indicates reoperation.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ppm-eoai-v548.js';
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
function number(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ppm-eoai'(root) {
    note(root, 'Patient-prosthesis mismatch, graded by the indexed effective orifice area — the prosthesis effective orifice area divided by the patient’s body surface area. The indexing is the point: a valve adequate in a small person can be severely mismatched in a large one, and a prosthesis can be working exactly as designed and still be too small for the patient. The thresholds differ by position and are not interchangeable — an indexed area of 1.0 is normal aortic and moderate mitral. Use the prosthesis’s measured or reference effective orifice area, not its labelled size.');

    heading(root, 'Position and measurements');
    root.appendChild(select('Valve position — required, because the thresholds differ', 'ppm-position',
      M.PPM_POSITIONS.map((p) => [p.value, `${p.label} (per ${p.citation})`])));
    root.appendChild(number('Prosthesis effective orifice area (cm²)', 'ppm-eoa', '0.01'));
    root.appendChild(number('Body surface area (m²)', 'ppm-bsa', '0.01'));

    const o = out(); root.appendChild(o);
    wire(['ppm-position', 'ppm-eoa', 'ppm-bsa'], () => safe(o, () => {
      const r = M.ppmEoai({ position: val('ppm-position'), eoa: val('ppm-eoa'), bsa: val('ppm-bsa') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'EOAi', value: `${r.eoai.toFixed(2)} cm²/m²` },
        { label: 'Mismatch', value: r.severity === 'none' ? 'not clinically significant' : r.severity },
        { label: 'Band', value: r.bandText },
        { label: 'Source for this position', value: r.citation },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
