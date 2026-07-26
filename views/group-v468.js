// spec-v468: renderer for the Brouet cryoglobulinemia classification (types I-III). Group G. The clinician
// picks the type; the tile reports the type and its clonality / association description. As a type descriptor
// it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Brouet type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/brouet-cryoglobulinemia-v468.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/brouet-cryoglobulinemia-v468.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the hematology / rheumatology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'brouet-cryoglobulinemia'(root) {
    note(root, 'The Brouet classification of cryoglobulinemia, by the clonality of the cryoprecipitating immunoglobulins. Pick the type. I: a single monoclonal immunoglobulin (lymphoproliferative disorders); II: mixed, a monoclonal immunoglobulin plus polyclonal IgG (strongly linked to hepatitis C); III: mixed, polyclonal immunoglobulins only. Types II and III are "mixed" cryoglobulinemia. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: ffs-2011.');
    root.appendChild(select('Brouet type', 'brouet-type', [
      ['I', 'I - monoclonal only (lymphoproliferative)'],
      ['II', 'II - mixed: monoclonal + polyclonal (HCV)'],
      ['III', 'III - mixed: polyclonal only'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['brouet-type'], () => safe(o, () => {
      const r = M.brouetCryoglobulinemia({ type: val('brouet-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
