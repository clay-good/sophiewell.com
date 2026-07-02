// spec-v203 §2: renderers for the perioperative, fracture, cerebrovascular &
// frailty risk instruments — DASI, ABCD3-I, Edmonton Frail Scale, SORT, and
// Garvan. Group G. Shipped one tile at a time; closes the Deep Subspecialty
// Quantitation program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the surgery / anticoagulation /
// imaging / bone-therapy / disposition decision to the clinician and the patient
// (spec-v11 §5.3) — these estimate risk and screen, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/periop-frailty-v203.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The estimate is the cited source’s, computed from the inputs you enter. The surgical, anticoagulation, imaging, and bone-therapy decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.5 dasi ------------------------------------------------------------
  dasi(root) {
    note(root, 'Duke Activity Status Index (Hlatky 1989): a 12-item self-report functional-capacity questionnaire. Affirmative activities are summed by their METs weights (max 58.2); peak VO₂ = 0.43 × DASI + 9.6 and METs = VO₂ / 3.5. < 4 METs marks poor functional capacity. Near-neighbors: rcri, mets-activity. Check every activity the patient can do:');
    const items = [
      ['dasi-selfcare', 'Take care of self (eat, dress, bathe, toilet) — 2.75'],
      ['dasi-walkindoors', 'Walk indoors — 1.75'],
      ['dasi-walkblocks', 'Walk 1–2 blocks on level ground — 2.75'],
      ['dasi-stairs', 'Climb a flight of stairs or walk up a hill — 5.5'],
      ['dasi-run', 'Run a short distance — 8'],
      ['dasi-lightwork', 'Light housework (dusting, dishes) — 2.7'],
      ['dasi-modwork', 'Moderate housework (vacuum, carry groceries) — 3.5'],
      ['dasi-heavywork', 'Heavy housework (scrub floors, move furniture) — 8'],
      ['dasi-yardwork', 'Yardwork (rake, mow) — 4.5'],
      ['dasi-sexual', 'Sexual relations — 5.25'],
      ['dasi-modrec', 'Moderate recreation (golf, bowling, dancing) — 6'],
      ['dasi-strenuous', 'Strenuous sports (swimming, tennis, skiing) — 7.5'],
    ];
    for (const [id, label] of items) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    const ids = items.map((i) => i[0]);
    wire(ids, () => safe(o, () => {
      const r = M.dasi({
        selfCare: chk('dasi-selfcare'), walkIndoors: chk('dasi-walkindoors'), walkBlocks: chk('dasi-walkblocks'),
        stairs: chk('dasi-stairs'), run: chk('dasi-run'), lightWork: chk('dasi-lightwork'), moderateWork: chk('dasi-modwork'),
        heavyWork: chk('dasi-heavywork'), yardWork: chk('dasi-yardwork'), sexual: chk('dasi-sexual'),
        moderateRec: chk('dasi-modrec'), strenuous: chk('dasi-strenuous'),
      });
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'DASI', value: `${r.score}` }, { label: 'METs', value: `${r.mets}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
