// spec-v541: renderer for RACHS-1. Group G. A category select plus three modifier controls under two h2
// section headings (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The category options carry representative procedures, because the category comes from the PROCEDURE rather
// than from the patient. The modifiers are shown in their own section and reported as adjusted odds ratios,
// never summed into the category (lib/rachs1-v541.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports a
// risk-adjustment category; it never predicts an individual child's outcome.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rachs1-v541.js';
import { resultRow } from '../lib/result-copy.js';

const YES_NO = [['no', 'No'], ['yes', 'Yes']];

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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the surgical team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'rachs1'(root) {
    note(root, 'RACHS-1 groups congenital heart surgery procedures into six consensus risk categories. The category comes from the procedure, not from the patient. Category 5 has no published mortality — the derivation had too few cases — so none is shown rather than interpolating between its neighbours. The mortality figures are historical, from the 2002 cohort, and outcomes have improved substantially since. It is a risk-adjustment tool for comparing programs and case-mixes, not a prediction for an individual child.');

    heading(root, 'Procedure category');
    root.appendChild(select('Which RACHS-1 category does the procedure fall in? The examples are representative, not exhaustive.', 'rachs-category',
      M.RACHS_CATEGORIES.map((c) => [c.value, `Category ${c.value} — ${c.examples}`])));

    heading(root, 'Separate risk modifiers (adjusted odds ratios, not points)');
    root.appendChild(select('Age at surgery', 'rachs-ageBand', M.RACHS_MODIFIERS.map((m) => [m.value, `${m.text} — odds ratio about ${m.oddsRatio}`])));
    root.appendChild(select('Prematurity? Adjusted odds ratio about 1.8.', 'rachs-premature', YES_NO));
    root.appendChild(select('Major non-cardiac structural anomaly? Adjusted odds ratio about 1.8.', 'rachs-majorAnomaly', YES_NO));

    const o = out(); root.appendChild(o);
    wire(['rachs-category', 'rachs-ageBand', 'rachs-premature', 'rachs-majorAnomaly'], () => safe(o, () => {
      const r = M.rachs1({
        category: val('rachs-category'), ageBand: val('rachs-ageBand'),
        premature: val('rachs-premature'), majorAnomaly: val('rachs-majorAnomaly'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Category', value: r.category },
        { label: 'Derivation-cohort mortality', value: r.mortalityPublished ? r.mortality : 'none published for this category' },
        { label: 'Risk modifiers', value: r.modifiers.length ? r.modifiers.join('; ') : 'none selected' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
