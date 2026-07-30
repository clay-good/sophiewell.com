// spec-v615: renderer for the AREDS simplified severity scale. Group G. Sections are h2 (an h3 under the
// page h1 is a heading-level skip). The two eyes get their own sections and the bilateral intermediate-drusen
// question gets a third, because it is one factor for the PERSON and only applies when neither eye has large
// drusen (lib/areds-v615.js).
//
// Per spec-v11 section 5.3 this estimates a group-level risk; it never diagnoses, never grades existing
// disease, and never decides supplementation or injection.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/areds-v615.js';
import { resultRow } from '../lib/result-copy.js';

const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];

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

const cap = (s) => `${s[0].toUpperCase()}${s.slice(1)}`;
const argKey = (eye, feature) => `${eye}${cap(feature)}`;
const aid = (k) => `areds-${k}`;

export const renderers = {
  areds(root) {
    note(root, M.PERSON_NOTE);

    for (const eye of M.EYES) {
      heading(root, eye.text);
      for (const f of M.EYE_FEATURES) {
        root.appendChild(select(f.text, aid(argKey(eye.key, f.key)), YN));
      }
    }
    note(root, M.ADVANCED_NOTE);

    heading(root, 'Intermediate drusen — one factor for the person, and only sometimes');
    root.appendChild(select('Intermediate drusen in BOTH eyes', aid('bilateralIntermediateDrusen'), YN));
    note(root, M.INTERMEDIATE_NOTE);

    const o = out(); root.appendChild(o);
    const ids = [
      ...M.EYES.flatMap((eye) => M.EYE_FEATURES.map((f) => aid(argKey(eye.key, f.key)))),
      aid('bilateralIntermediateDrusen'),
    ];
    wire(ids, () => safe(o, () => {
      const input = { bilateralIntermediateDrusen: val(aid('bilateralIntermediateDrusen')) };
      for (const eye of M.EYES) {
        for (const f of M.EYE_FEATURES) input[argKey(eye.key, f.key)] = val(aid(argKey(eye.key, f.key)));
      }
      const r = M.aredsSimplified(input);
      if (!r.valid) { note(o, r.message); return; }
      const row = [
        { text: r.bandLabel },
        { label: 'Risk factors', value: `${r.factors} of ${r.maxFactors}` },
      ];
      for (const e of r.perEye) row.push({ label: e.text, value: `${e.factors}` });
      if (r.fiveYearRiskPercent !== null) row.push({ label: 'Five-year risk', value: `${r.fiveYearRiskPercent}%` });
      resultRow(o, row);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'The risk is not evenly spaced');
    note(root, M.NONLINEAR_NOTE);
    note(root, M.AT_LEAST_ONE_NOTE);
    postureNote(root);
  },
};
