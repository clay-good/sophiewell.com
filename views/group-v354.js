// spec-v354: renderer for the Tonnis classification (grade) of hip osteoarthritis (grades 0-3). Group
// G. The clinician picks the radiographic grade; the tile reports the grade, its description, and
// whether it meets the radiographic-OA threshold (grade 2-3).
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Tonnis grade; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/tonnis-hip-oa-v354.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/tonnis-hip-oa-v354.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The surgical decision stays with the orthopedic surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'tonnis-hip-oa'(root) {
    note(root, 'Tonnis classification (Tonnis 1987) of hip osteoarthritis on an AP pelvis radiograph. Pick the grade. 0: no OA; 1: slight sclerosis / narrowing / small osteophytes; 2: small cysts, moderate narrowing, moderate loss of sphericity; 3: large cysts, severe narrowing, head deformity, or AVN. Grade 2+ defines radiographic hip OA. The hip counterpart to Kellgren-Lawrence; this is the OA grade, not the Tonnis angle. Near-neighbors: kellgren-lawrence, crowe-ddh.');
    root.appendChild(select('Tonnis grade', 'tonnis-grade', [
      ['0', 'Grade 0 - no osteoarthritis'],
      ['1', 'Grade 1 - slight sclerosis / narrowing / small osteophytes'],
      ['2', 'Grade 2 - small cysts, moderate narrowing, moderate loss of sphericity'],
      ['3', 'Grade 3 - large cysts, severe narrowing, head deformity, or AVN'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['tonnis-grade'], () => safe(o, () => {
      const r = M.tonnisHipOa({ grade: val('tonnis-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
