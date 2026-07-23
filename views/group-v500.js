// spec-v500: renderer for the Tegner activity scale (levels 0-10). Group G. The patient and clinician agree
// the level; the tile reports the level and its work / sport anchors. As an activity-level descriptor it
// reports the level recorded, and no level is "abnormal".
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Tegner level; it never asserts a diagnosis, a return-to-sport
// clearance, or a prediction of what the knee will tolerate (lib/tegner-activity-v500.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/tegner-activity-v500.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The return-to-play decision stays with the treating clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'tegner-activity'(root) {
    note(root, 'The Tegner activity scale records a knee activity level from 0 to 10, and is normally reported alongside the Lysholm knee score: the score measures symptoms, the scale records the activity level those symptoms are measured against. Pick the level. 0 is sick leave or a disability pension because of knee problems; 10 is competitive sport at the national elite level. Each level names representative work and sport anchors. This is an activity level, not a pathology grade and not a return-to-sport clearance. Near-neighbor: lysholm-knee-score.');
    root.appendChild(select('Tegner activity level', 'tegner-level', [
      ['0', '0 - sick leave or disability pension (knee)'],
      ['1', '1 - sedentary work'],
      ['2', '2 - light labor, uneven ground'],
      ['3', '3 - light labor (nursing), swimming'],
      ['4', '4 - moderately heavy labor, recreational cycling'],
      ['5', '5 - heavy labor, competitive cycling'],
      ['6', '6 - recreational tennis, skiing, frequent jogging'],
      ['7', '7 - competitive tennis or running; recreational team sport'],
      ['8', '8 - competitive squash, downhill skiing, track and field'],
      ['9', '9 - competitive team sport, lower divisions'],
      ['10', '10 - competitive team sport, national elite'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['tegner-level'], () => safe(o, () => {
      const r = M.tegnerActivity({ level: val('tegner-level') });
      resultRow(o, [
        { text: r.band },
        { label: 'Level', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
