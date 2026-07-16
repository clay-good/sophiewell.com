// spec-v355: renderer for the Lachman test grade of ACL laxity (grades I-III). Group G. The clinician
// picks the laxity grade; the tile reports the grade, its translation/endpoint description, and whether
// it is a higher (grade II-III) laxity.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Lachman grade; it never asserts a diagnosis, an imaging
// substitute, or a treatment decision (lib/lachman-acl-v355.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lachman-acl-v355.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. This is one exam finding; MRI and the overall picture decide management, which stays with the treating clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'lachman-acl'(root) {
    note(root, 'Lachman test grade of ACL laxity. Pick the grade from the anterior tibial translation (vs the uninjured knee) and endpoint. I: 0-5 mm, firm endpoint; II: 6-10 mm, soft endpoint; III: 11-15 mm, no endpoint. Five mm or more suggests a complete ACL tear. Near-neighbors: ottawa-knee, pittsburgh-knee-rule.');
    root.appendChild(select('Lachman grade', 'lachman-grade', [
      ['I', 'Grade I - 0-5 mm, firm endpoint (mild)'],
      ['II', 'Grade II - 6-10 mm, soft endpoint (moderate)'],
      ['III', 'Grade III - 11-15 mm, no endpoint (severe)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['lachman-grade'], () => safe(o, () => {
      const r = M.lachmanAcl({ grade: val('lachman-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
