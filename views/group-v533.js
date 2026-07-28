// spec-v533: renderer for the Renal Angina Index. Group G. Two selects under an h2 section heading (never h3
// - an h3 under the page h1 is a heading-level skip).
//
// Two selects, not five inputs: the index is a product of two STRATA, and asking for the stratum directly
// keeps the multiplication visible. The option text carries each tier's full definition, including that the
// very-high risk tier needs ventilation AND vasoactive support rather than either
// (lib/renal-angina-v533.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports a prediction
// framed as a rule-out; it never diagnoses or stages an acute kidney injury and never indicates therapy.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/renal-angina-v533.js';
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
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'renal-angina'(root) {
    note(root, 'The Renal Angina Index predicts severe acute kidney injury on day 3 in a critically ill child, scored at about 12 hours after intensive care admission — before the creatinine has moved. It is a product, not a sum: risk multiplied by injury, and 8 or more fulfills renal angina. Only twelve totals are reachable, so it is not a continuous scale out of 40. It predicts; RIFLE, AKIN and KDIGO stage an injury that has already happened.');

    heading(root, 'Risk and injury strata at 12 hours');
    root.appendChild(select('Risk stratum', 'rai-risk', M.RAI_RISK.map((r) => [r.value, r.text])));
    root.appendChild(select('Injury stratum — use whichever route is worse, the fall in estimated creatinine clearance or the percentage of fluid overload', 'rai-injury', M.RAI_INJURY.map((i) => [i.value, i.text])));

    const o = out(); root.appendChild(o);
    wire(['rai-risk', 'rai-injury'], () => safe(o, () => {
      const r = M.renalAngina({ risk: val('rai-risk'), injury: val('rai-injury') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'RAI', value: `${r.riskPoints} x ${r.injuryPoints} = ${r.total}` },
        { label: 'Renal angina', value: r.positive ? 'fulfilled (8 or more)' : 'not fulfilled (below 8)' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
