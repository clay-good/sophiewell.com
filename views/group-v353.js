// spec-v353: renderer for the Crowe classification of adult developmental dysplasia of the hip (grades
// I-IV). Group G. The clinician picks the subluxation grade; the tile reports the grade, its
// description, and whether it is a higher-grade (III-IV) hip.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Crowe grade; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/crowe-ddh-v353.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/crowe-ddh-v353.js';
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
  'crowe-ddh'(root) {
    note(root, 'Crowe classification (Crowe, Mani & Ranawat 1979) of adult developmental dysplasia of the hip. Pick the proximal femoral-head subluxation grade. I: <50%; II: 50-75%; III: 75-100%; IV: >100% (high / complete dislocation). The most commonly used adult-DDH grade for total-hip-arthroplasty planning. Near-neighbors: garden-classification.');
    root.appendChild(select('Crowe grade', 'crowe-grade', [
      ['I', 'Grade I - < 50% subluxation'],
      ['II', 'Grade II - 50-75% subluxation'],
      ['III', 'Grade III - 75-100% subluxation'],
      ['IV', 'Grade IV - > 100% (high / complete dislocation)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['crowe-grade'], () => safe(o, () => {
      const r = M.croweDdh({ grade: val('crowe-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
