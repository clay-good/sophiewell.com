// spec-v596: renderer for the Lepine criteria. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). The Heffner two-test rule is computed alongside from the same three inputs, because
// the two rules use the SAME measurements with thresholds that move in opposite directions and neither
// dominates the other (lib/lepine-v596.js).
//
// Per spec-v11 section 5.3 this classifies an effusion and never gives a cause, and never indicates or
// contraindicates drainage.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lepine-v596.js';
import { resultRow } from '../lib/result-copy.js';

function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any' }));
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
  lepine(root) {
    note(root, 'Either test alone classifies the effusion as an exudate — the tests do not vote. The Heffner two-test rule is computed alongside, because it uses the same two measurements with different thresholds.');

    heading(root, 'The two pleural fluid tests');
    root.appendChild(number('Pleural fluid LDH (U/L)', 'lep-ldh'));
    root.appendChild(number(`Pleural fluid cholesterol (mg/dL) — exudate above ${M.CHOLESTEROL_THRESHOLD} (${M.CHOLESTEROL_THRESHOLD_MMOL} mmol/L)`, 'lep-chol'));

    heading(root, 'The one input that is not from the pleural fluid');
    root.appendChild(number('Your laboratory’s upper limit of normal for SERUM LDH (U/L)', 'lep-uln'));
    note(root, M.SERUM_NOTE);

    const o = out(); root.appendChild(o);
    wire(['lep-ldh', 'lep-chol', 'lep-uln'], () => safe(o, () => {
      const r = M.lepine({
        pleuralLdh: val('lep-ldh'), serumLdhUln: val('lep-uln'),
        pleuralCholesterol: val('lep-chol'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Lepine', value: r.exudate ? 'exudate' : 'transudate' },
        { label: 'Heffner two-test', value: r.exudateByHeffner ? 'exudate' : 'transudate' },
        { label: 'Rules disagree', value: r.rulesDisagree ? `YES — on the ${r.disagreementAxis} axis` : 'no' },
        { label: 'LDH cutoff used', value: `${r.ldhCutoffUsed} U/L` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Why neither rule dominates the other');
    note(root, M.OPPOSITE_NOTE);
    note(root, M.TRADE_NOTE);
    note(root, M.DIURETIC_NOTE);
    postureNote(root);
  },
};
