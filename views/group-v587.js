// spec-v587: renderer for the quick Pitt (qPitt) bacteremia score. Group G. Sections are h2 (an h3 under the
// page h1 is a heading-level skip). The temperature control is labeled as hypothermia rather than
// "temperature abnormal", because fever scores nothing on this score and a generic label would invite the
// commonest error (lib/qpitt-v587.js).
//
// Per spec-v11 section 5.3 this is a mortality prognostic for an established bloodstream infection; it never
// diagnoses bacteremia and never selects or withholds an antibiotic.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/qpitt-v587.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of [['', '--'], ['no', 'No'], ['yes', 'Yes']]) s.appendChild(el('option', { value, text }));
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

const DOM = {
  hypothermia: 'qpitt-temp', hypotension: 'qpitt-sbp', respiratory: 'qpitt-rr',
  alteredMentalStatus: 'qpitt-mental', cardiacArrest: 'qpitt-arrest',
};

export const renderers = {
  qpitt(root) {
    note(root, `Five binary items, one point each, 0 to ${M.QPITT_MAX}, for a patient who already has a bloodstream infection. High risk is only ${M.HIGH_RISK_THRESHOLD} of ${M.QPITT_MAX}. This is the simplified successor to the Pitt Bacteremia Score in this catalog, which runs 0 to ${M.PREDECESSOR_MAX} with weighted items — the two scores are not interchangeable.`);

    heading(root, 'The five items');
    for (const item of M.ITEMS) {
      root.appendChild(select(item.text, DOM[item.key]));
      note(root, item.detail);
    }

    const o = out(); root.appendChild(o);
    wire(Object.values(DOM), () => safe(o, () => {
      const args = {};
      for (const [key, id] of Object.entries(DOM)) args[key] = val(id);
      const r = M.qPitt(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Score', value: `${r.total} of ${r.max}` },
        { label: 'High risk at', value: `${r.threshold} or more` },
        { label: 'Predicted 28-day mortality', value: `${r.predictedMortalityPercent}%${r.mortalityFigureLumped ? ' (source lumps 4 and 5)' : ''}` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'How it differs from its predecessor');
    note(root, M.WEIGHTING_NOTE);
    note(root, M.FEVER_NOTE);
    note(root, M.LUMPED_NOTE);
    postureNote(root);
  },
};
