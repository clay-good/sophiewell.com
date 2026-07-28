// spec-v567: renderer for the IGCCCG prognostic classification. Group G. Inputs under h2 section headings
// (never h3 - an h3 under the page h1 is a heading-level skip).
//
// Histology comes first and gates the rest, because seminoma and nonseminoma are scored from different
// variables entirely: seminoma ignores hCG and LDH and has no poor-prognosis category, while its AFP field
// is a reclassification gate rather than a graded marker (lib/igcccg-v567.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile assigns a prognostic
// group; it never diagnoses germ cell cancer and never selects a regimen.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/igcccg-v567.js';
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
function number(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step }));
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

const YESNO = [['no', 'No'], ['yes', 'Yes']];

export const renderers = {
  igcccg(root) {
    note(root, 'The IGCCCG assigns a prognostic group for METASTATIC germ cell cancer. Good prognosis requires EVERY criterion to be met; intermediate and poor are triggered by ANY ONE marker criterion — both directions live in the same table. Seminoma has NO poor-prognosis category at all, permits any primary site, and ignores hCG and LDH entirely.');

    heading(root, 'Histology and disease extent');
    root.appendChild(select('Histology', 'igcccg-histology',
      M.HISTOLOGIES.map((h) => [h.value, h.text])));
    root.appendChild(select('Nonpulmonary visceral metastases? (pulmonary metastases do not count)', 'igcccg-npvm', YESNO));

    heading(root, 'Nonseminoma only');
    root.appendChild(select('Primary site — mediastinal is poor prognosis on its own', 'igcccg-primary',
      M.PRIMARY_SITES.map((p) => [p.value, p.text])));
    note(root, M.MARKER_TIMING);
    root.appendChild(number('AFP (ng/mL)', 'igcccg-afp', '1'));
    root.appendChild(number('hCG (IU/L — not IU/mL)', 'igcccg-hcg', '1'));
    root.appendChild(number('LDH as a MULTIPLE of the local upper limit of normal (not an absolute value)', 'igcccg-ldh', '0.1'));

    heading(root, 'Seminoma only');
    note(root, 'A raised AFP means the tumor is not a pure seminoma and must be classified as a nonseminoma — this is a gate, not a graded marker.');
    root.appendChild(select('Is the AFP normal?', 'igcccg-afp-normal', YESNO));

    const ids = ['igcccg-histology', 'igcccg-npvm', 'igcccg-primary', 'igcccg-afp', 'igcccg-hcg',
      'igcccg-ldh', 'igcccg-afp-normal'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.igcccg({
        histology: val('igcccg-histology'),
        nonpulmonaryVisceralMets: val('igcccg-npvm'),
        primarySite: val('igcccg-primary'),
        afp: val('igcccg-afp'), hcg: val('igcccg-hcg'), ldhMultiple: val('igcccg-ldh'),
        afpNormal: val('igcccg-afp-normal'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Prognostic group', value: r.classified ? `${r.group} (${r.histology})` : 'not classifiable as seminoma' },
        { label: '5-year survival', value: r.classified ? `${r.survival.update2021} (2021 update); ${r.survival.original1997} (1997 original)` : 'not applicable' },
        { label: 'Basis', value: r.classified && r.reasons ? r.reasons.join('; ') : (r.classified ? 'nonpulmonary visceral metastases decide the seminoma group' : 'reclassify as nonseminoma') },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
