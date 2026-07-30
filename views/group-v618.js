// spec-v618: renderer for the EREFS endoscopic reference score. Group G. Sections are h2 (an h3 under the
// page h1 is a heading-level skip). Each esophageal region gets its own section, because the regions are
// scored separately and a single regional score is not "the EREFS" (lib/erefs-v618.js).
//
// Per spec-v11 section 5.3 this describes endoscopic appearance; it never diagnoses eosinophilic esophagitis,
// never measures symptoms, and never decides dilation, diet or drug therapy.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/erefs-v618.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, grades) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  s.appendChild(el('option', { value: '', text: '--' }));
  for (const g of grades) s.appendChild(el('option', { value: String(g.grade), text: `${g.grade} - ${g.text}` }));
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

const aid = (k) => `erefs-${k}`;

export const renderers = {
  erefs(root) {
    note(root, M.REGION_NOTE);

    for (const r of M.REGIONS) {
      heading(root, `${r.text} — 0 to ${M.REGION_MAX}`);
      for (const f of M.FEATURES) {
        root.appendChild(select(`${f.text} (0 to ${f.grades.length - 1})`, aid(M.argKey(r.key, f.key)), f.grades));
      }
    }
    note(root, M.WEIGHT_NOTE);
    note(root, M.STRICTURE_NOTE);

    const o = out(); root.appendChild(o);
    const ids = M.REGIONS.flatMap((r) => M.FEATURES.map((f) => aid(M.argKey(r.key, f.key))));
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const r of M.REGIONS) {
        for (const f of M.FEATURES) input[M.argKey(r.key, f.key)] = val(aid(M.argKey(r.key, f.key)));
      }
      const res = M.erefs(input);
      if (!res.valid) { note(o, res.message); return; }
      const row = [{ text: res.bandLabel }];
      for (const r of res.perRegion) row.push({ label: r.text, value: `${r.score} of ${r.max}` });
      row.push({ label: 'Full composite', value: `${res.total} of ${res.totalMax}` });
      row.push({ label: 'Inflammatory', value: `${res.inflammatoryScore} of ${res.inflammatoryMax}` });
      row.push({ label: 'Modified', value: `${res.modifiedScore} of ${res.modifiedMax}` });
      resultRow(o, row);
      note(o, res.bandText);
      note(o, res.note);
    }));

    heading(root, 'Which EREFS score is being reported');
    note(root, M.VARIANT_NOTE);
    heading(root, 'Two things this tile deliberately does not assert');
    note(root, M.RINGS_NOTE);
    note(root, M.EXUDATE_BOUNDARY_NOTE);
    note(root, M.NO_BANDS_NOTE);
    postureNote(root);
  },
};
