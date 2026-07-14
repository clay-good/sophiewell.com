// spec-v302: renderer for the Instability Severity Index Score (ISIS). Group G
// (clinical scoring & reference). The clinician checks the six preoperative
// factors; the tile reports the 0-10 total and whether the score exceeds the
// published cutoff of 6 (high recurrence risk after arthroscopic Bankart repair).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the cited score; it never asserts a surgical
// decision (lib/isis-v302.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/isis-v302.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'isis-shoulder'(root) {
    note(root, 'Instability Severity Index Score (ISIS) — recurrence risk after arthroscopic Bankart repair for anterior shoulder instability. Check the preoperative factors; the tile sums them (0–10) and flags a score above 6 (high recurrence risk; an open procedure is favored). Near-neighbors: weber-ankle.');
    root.appendChild(check('Age ≤20 years at surgery (2)', 'isis-age'));
    root.appendChild(check('Competitive sport participation (2)', 'isis-comp'));
    root.appendChild(check('Contact or forced-overhead sport (1)', 'isis-contact'));
    root.appendChild(check('Shoulder hyperlaxity, anterior or inferior (1)', 'isis-lax'));
    root.appendChild(check('Hill-Sachs visible on AP external-rotation radiograph (2)', 'isis-hs'));
    root.appendChild(check('Glenoid loss of contour on AP radiograph (2)', 'isis-glenoid'));

    const o = out(); root.appendChild(o);
    wire(['isis-age', 'isis-comp', 'isis-contact', 'isis-lax', 'isis-hs', 'isis-glenoid'], () => safe(o, () => {
      const r = M.isisScore({
        ageUnder20: chk('isis-age'),
        competitive: chk('isis-comp'),
        contactSport: chk('isis-contact'),
        hyperlaxity: chk('isis-lax'),
        hillSachs: chk('isis-hs'),
        glenoidLoss: chk('isis-glenoid'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ISIS', value: `${r.total} of ${r.max}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
