// spec-v358: renderer for the Ramsay Sedation Scale (levels 1-6). Group G. The clinician picks the
// sedation level; the tile reports the level, its description, whether the patient is awake or asleep,
// and whether the level falls outside the cooperative-to-lightly-sedated range (2-4).
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Ramsay level; it never asserts a diagnosis, a titration order, or
// a target (lib/ramsay-sedation-v358.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ramsay-sedation-v358.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The sedation target and titration decision stay with the treating clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ramsay-sedation'(root) {
    note(root, 'Ramsay Sedation Scale (Ramsay 1974). Pick the level. Awake: 1 agitated / restless; 2 cooperative, tranquil; 3 responds to commands only. Asleep: 4 brisk response to glabellar tap / loud stimulus; 5 sluggish response; 6 no response. Levels 2-4 are the cooperative-to-lightly-sedated range. Near-neighbors: rass, sas-riker.');
    root.appendChild(select('Ramsay level', 'ramsay-level', [
      ['1', 'Level 1 - anxious, agitated, or restless (awake)'],
      ['2', 'Level 2 - cooperative, oriented, tranquil (awake)'],
      ['3', 'Level 3 - responds to commands only (awake)'],
      ['4', 'Level 4 - asleep, brisk response to glabellar tap / loud stimulus'],
      ['5', 'Level 5 - asleep, sluggish response'],
      ['6', 'Level 6 - asleep, no response'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ramsay-level'], () => safe(o, () => {
      const r = M.ramsaySedation({ level: val('ramsay-level') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'State', value: r.state },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
