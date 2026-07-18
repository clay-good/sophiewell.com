// spec-v424: renderer for the Bethesda System for Reporting Thyroid Cytopathology (categories I-VI). Group G.
// The cytopathologist picks the category; the tile reports the category and its cytologic meaning. As a
// category descriptor it reports the category the cytopathologist has assigned.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Bethesda category; it never asserts a diagnosis, a risk estimate, a
// treatment decision, or a prognosis (lib/bethesda-thyroid-v424.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bethesda-thyroid-v424.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the pathology / endocrinology / surgery team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'bethesda-thyroid'(root) {
    note(root, 'The Bethesda System for Reporting Thyroid Cytopathology, the standardized six-category scheme for a thyroid fine-needle-aspiration (FNA). Pick the category. I: nondiagnostic; II: benign; III: atypia of undetermined significance (AUS/FLUS); IV: follicular neoplasm or suspicious for one; V: suspicious for malignancy; VI: malignant. Reports the category and its cytologic meaning, not the implied malignancy risk, the recommended management, or a diagnosis.');
    root.appendChild(select('Bethesda thyroid category', 'bt-cat', [
      ['I', 'I - nondiagnostic or unsatisfactory'],
      ['II', 'II - benign'],
      ['III', 'III - atypia of undetermined significance (AUS/FLUS)'],
      ['IV', 'IV - follicular neoplasm or suspicious for one'],
      ['V', 'V - suspicious for malignancy'],
      ['VI', 'VI - malignant'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['bt-cat'], () => safe(o, () => {
      const r = M.bethesdaThyroid({ category: val('bt-cat') });
      resultRow(o, [
        { text: r.band },
        { label: 'Category', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
