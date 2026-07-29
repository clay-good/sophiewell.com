// spec-v591: renderer for the Heffner criteria. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). The laboratory upper limit of normal for serum LDH sits in its own section with the
// three fluid tests kept separate, because it is the one input that is NOT from the pleural fluid and the
// whole point of these criteria is that no patient serum is drawn (lib/heffner-v591.js).
//
// Per spec-v11 section 5.3 this classifies an effusion and never gives a cause, and never indicates or
// contraindicates drainage.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/heffner-v591.js';
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
  heffner(root) {
    note(root, 'Classifies a pleural effusion as exudative without a paired serum sample. Any ONE test is enough — the tests do not vote. Light’s criteria are also in this catalog and need a serum sample drawn at the same time.');

    heading(root, 'The three pleural fluid tests');
    root.appendChild(number('Pleural fluid LDH (U/L)', 'heff-ldh'));
    root.appendChild(number(`Pleural fluid cholesterol (mg/dL) — exudate above ${M.CHOLESTEROL_THRESHOLD}`, 'heff-chol'));
    root.appendChild(number(`Pleural fluid protein (g/dL) — exudate above ${M.PROTEIN_THRESHOLD}`, 'heff-protein'));
    note(root, M.ROUNDING_NOTE);

    heading(root, 'The one input that is not from the pleural fluid');
    root.appendChild(number('Your laboratory’s upper limit of normal for SERUM LDH (U/L)', 'heff-uln'));
    note(root, M.SERUM_NOTE);

    const o = out(); root.appendChild(o);
    wire(['heff-ldh', 'heff-chol', 'heff-protein', 'heff-uln'], () => safe(o, () => {
      const r = M.heffner({
        pleuralLdh: val('heff-ldh'), serumLdhUln: val('heff-uln'),
        pleuralCholesterol: val('heff-chol'), pleuralProtein: val('heff-protein'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Three-test rule', value: r.exudate ? 'exudate' : 'transudate' },
        { label: 'Two-test rule', value: r.exudateByTwoTestRule ? 'exudate' : 'transudate' },
        { label: 'Positive tests', value: r.positiveTests.length ? r.positiveTests.join(', ') : 'none' },
        { label: 'LDH cutoff used', value: `${r.ldhCutoffUsed} U/L` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'What you give up by skipping the serum sample');
    note(root, M.TRADE_NOTE);
    note(root, M.DIURETIC_NOTE);
    postureNote(root);
  },
};
