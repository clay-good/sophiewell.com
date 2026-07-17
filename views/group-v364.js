// spec-v364: renderer for the Clinical Activity Score (CAS) for thyroid eye disease (7-item checklist).
// Group G. The clinician checks each inflammatory item present in the study eye; the tile sums the score
// (0-7) and flags active disease (CAS >= 3).
//
// Same input/render contract as the rest of the codebase: each checkbox has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the CAS; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/cas-ted-v364.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cas-ted-v364.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited instrument’s, computed from the items you check. The management decision stays with the treating clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ITEMS = [
  ['cas-pain', 'Spontaneous orbital (retrobulbar) pain'],
  ['cas-gaze', 'Gaze-evoked orbital pain (pain on eye movement)'],
  ['cas-lidsw', 'Eyelid swelling (active thyroid eye disease)'],
  ['cas-lidery', 'Eyelid erythema'],
  ['cas-conj', 'Conjunctival redness (active TED; ignore equivocal)'],
  ['cas-chem', 'Chemosis'],
  ['cas-carun', 'Inflammation of the caruncle or plica'],
];

export const renderers = {
  'cas-ted'(root) {
    note(root, 'Clinical Activity Score (Mourits 1989; EUGOGO) for thyroid eye disease / Graves orbitopathy. Check each inflammatory item present in the study eye. Each scores 1 point; CAS of 3 or more (of 7) indicates active disease. The 10-item follow-up version (adds change-over-time items) is out of scope. Near-neighbors: kwb-retinopathy.');
    for (const [id, label] of ITEMS) root.appendChild(checkField(label, id));

    const o = out(); root.appendChild(o);
    wire(ITEMS.map((i) => i[0]), () => safe(o, () => {
      const r = M.casTed({
        pain: chk('cas-pain'), gazePain: chk('cas-gaze'), lidSwelling: chk('cas-lidsw'),
        lidErythema: chk('cas-lidery'), conjRedness: chk('cas-conj'), chemosis: chk('cas-chem'),
        caruncle: chk('cas-carun'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
