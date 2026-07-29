// spec-v610: renderer for the Edinburgh CT criteria. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). APOE offers "unknown" as a first-class answer, because that is the usual state when
// the CT is read and it is why the simplified version exists (lib/edinburgh-caa-v610.js).
//
// Per spec-v11 section 5.3 this estimates a cause; it never diagnoses the hemorrhage, never establishes
// cerebral amyloid angiopathy, and never decides anticoagulation.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/edinburgh-caa-v610.js';
import { resultRow } from '../lib/result-copy.js';

const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];
const APOE = [['', '--'], ['unknown', 'Not back yet / not tested'], ['negative', 'Negative'], ['positive', 'Positive']];

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
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'edinburgh-caa'(root) {
    note(root, 'For a lobar intracerebral hemorrhage already seen on non-contrast CT.');

    heading(root, 'CT findings');
    root.appendChild(select(M.FINDINGS[0].text, 'edin-subarachnoidExtension', YN));
    root.appendChild(select(M.FINDINGS[1].text, 'edin-fingerLikeProjections', YN));
    note(root, M.FLP_NOTE);

    heading(root, 'APOE e4 genotype');
    root.appendChild(select('APOE e4 status', 'edin-apoe', APOE));
    note(root, M.APOE_NOTE);

    const o = out(); root.appendChild(o);
    wire(['edin-subarachnoidExtension', 'edin-fingerLikeProjections', 'edin-apoe'], () => safe(o, () => {
      const r = M.edinburghCaa({
        subarachnoidExtension: val('edin-subarachnoidExtension'),
        fingerLikeProjections: val('edin-fingerLikeProjections'),
        apoe: val('edin-apoe'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Original', value: r.original || 'not computable' },
        { label: 'Simplified', value: r.simplified },
        { label: 'Agree', value: r.original ? (r.disagree ? 'No' : 'Yes') : 'n/a' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Why the two versions can differ');
    note(root, M.DIRECTION_NOTE);
    note(root, M.NOT_A_COUNT_NOTE);
    heading(root, 'The published rule-in and rule-out criteria');
    note(root, M.RULE_OUT);
    note(root, M.RULE_IN);
    postureNote(root);
  },
};
