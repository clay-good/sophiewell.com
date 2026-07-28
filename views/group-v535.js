// spec-v535: renderer for the CaPTHUS score. Group G. Five yes/no selects under an h2 section heading (never
// h3 - an h3 under the page h1 is a heading-level skip).
//
// The calcium label carries BOTH units, because the threshold is 12 mg/dL and the equivalent 3 mmol/L sits
// next to a score that also runs 0-5; reading the 3 as mg/dL would award that point to almost every patient.
// Concordance is its own select rather than being inferred from the two scan selects, because two positive
// scans pointing at different glands must score 2 and not 3 (lib/capthus-v535.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile predicts anatomy; it never
// diagnoses primary hyperparathyroidism and never asserts that surgery is indicated.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/capthus-v535.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The operative decision stays with the surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'capthus'(root) {
    note(root, 'The CaPTHUS score predicts single-gland disease in a patient already diagnosed with primary hyperparathyroidism: five criteria, one point each, and 3 or more predicts a single adenoma. The calcium threshold is 12 mg/dL (3 mmol/L) — reading the 3 as mg/dL would award that point to almost every patient. Concordance is scored separately, so two positive scans pointing at different glands score 2, not 3. It predicts anatomy, not whether an operation is indicated, and its negative predictive value is poor: a low score is an absence of information, not evidence of four-gland disease.');

    heading(root, 'The five CaPTHUS criteria');
    const ids = [];
    for (const c of M.CAPTHUS_CRITERIA) {
      const id = `cap-${c.key}`;
      ids.push(id);
      root.appendChild(select(`${c.letter} — ${c.text}. ${c.detail}`, id, YES_NO));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const c of M.CAPTHUS_CRITERIA) args[c.key] = val(`cap-${c.key}`);
      const r = M.capthus(args);
      if (!r.valid) { note(o, r.message); return; }
      const rows = [
        { text: r.band },
        { label: 'Score', value: `${r.total} of 5` },
        { label: 'Predicts single-gland disease', value: r.predictsSingleGland ? 'yes (3 or more)' : 'no (below 3)' },
      ];
      if (r.discordantScans) rows.push({ label: 'Scans', value: 'both positive but discordant — no concordance point' });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
