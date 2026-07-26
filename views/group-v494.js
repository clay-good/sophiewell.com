// spec-v494: renderer for the INTERMACS profiles of advanced heart failure (profiles 1-7). Group G. The
// clinician picks the profile; the tile reports the profile and its clinical-severity description. As a
// profile descriptor it reports the profile the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the INTERMACS profile; it never asserts a diagnosis, a decision to
// implant a device, or a survival prediction (lib/intermacs-profile-v494.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/intermacs-profile-v494.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the advanced-heart-failure team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'intermacs-profile'(root) {
    note(root, 'The INTERMACS profiles describe the clinical severity of advanced heart failure when mechanical circulatory support is being considered, from profile 1 (the sickest) to profile 7. Pick the profile. 1: critical cardiogenic shock; 2: progressive decline on inotropes; 3: stable but inotrope dependent; 4: resting symptoms; 5: exertion intolerant; 6: exertion limited; 7: advanced NYHA class III. Reports the profile the clinician has determined, not a device or transplant decision. Near-neighbor: nyha-class.');
    root.appendChild(select('INTERMACS profile', 'intermacs-profile', [
      ['1', '1 - critical cardiogenic shock'],
      ['2', '2 - progressive decline on inotropes'],
      ['3', '3 - stable but inotrope dependent'],
      ['4', '4 - resting symptoms'],
      ['5', '5 - exertion intolerant (housebound)'],
      ['6', '6 - exertion limited (walking wounded)'],
      ['7', '7 - advanced NYHA class III'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['intermacs-profile'], () => safe(o, () => {
      const r = M.intermacsProfile({ profile: val('intermacs-profile') });
      resultRow(o, [
        { text: r.band },
        { label: 'Profile', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
