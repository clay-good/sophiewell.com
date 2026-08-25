// spec-v545: renderer for FIGO PALM-COEIN. Group G. Nine category selects plus the leiomyoma sub-tiers,
// under two h2 section headings following the acronym's own split (never h3 - an h3 under the page h1 is a
// heading-level skip).
//
// Every category is rendered for every patient, TNM-style, and every one offers THREE values: 0 absent,
// 1 present, ? not yet assessed. The third is not a placeholder - a clinician who has not done imaging or a
// coagulation screen must not be forced to assert an absence they have not established
// (lib/palm-coein-v545.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile organises a diagnosis; it
// never makes one and never excludes malignancy.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/palm-coein-v545.js';
import { resultRow } from '../lib/result-copy.js';

const CELL = [['0', '0 — absent'], ['1', '1 — present'], ['?', '? — not yet assessed']];

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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'palm-coein'(root) {
    note(root, 'The FIGO PALM-COEIN classification of abnormal uterine bleeding. It is a notation, not a score: modelled on TNM staging, every one of the nine categories is reported for every patient, and each takes 0 for absent, 1 for present, or ? for not yet assessed — a category left unstated is otherwise ambiguous between looked-for-and-not-found and never-assessed. More than one category can be positive at once, and assuming a visible structural lesion is the cause is a known error. This tool implements the 2018 revision, which differs from 2011 on type 3 leiomyomas and on where anticoagulant-associated bleeding sits.');

    const ids = [];
    const addCategory = (c) => {
      const id = `pc-${c.key}`;
      ids.push(id);
      root.appendChild(select(`${c.letter} — ${c.name}`, id, CELL));
    };

    heading(root, 'PALM — defined by visually objective structural criteria');
    for (const c of M.PALM_COEIN_CATEGORIES.filter((x) => x.group === 'PALM')) addCategory(c);

    heading(root, 'COEIN — unrelated to structural anomalies, plus the unclassified category');
    for (const c of M.PALM_COEIN_CATEGORIES.filter((x) => x.group === 'COEIN')) addCategory(c);

    heading(root, 'Leiomyoma sub-classification (used only when L is present)');
    ids.push('pc-leiomyomaSecondary', 'pc-leiomyomaType');
    root.appendChild(select('Secondary classification — this is the tier that carries the clinical weight', 'pc-leiomyomaSecondary',
      [['', 'Not applicable'], ...M.LEIOMYOMA_SECONDARY.map((s) => [s.value, s.text])]));
    root.appendChild(select('Tertiary type (optional)', 'pc-leiomyomaType',
      [['', 'Not specified'], ...M.LEIOMYOMA_TYPES.map((t) => [t.value, t.text])]));

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        leiomyomaSecondary: val('pc-leiomyomaSecondary'),
        leiomyomaType: val('pc-leiomyomaType'),
      };
      for (const c of M.PALM_COEIN_CATEGORIES) args[c.key] = val(`pc-${c.key}`);
      const r = M.palmCoein(args);
      if (!r.valid) { note(o, r.message); return; }
      const rows = [
        { text: r.band },
        { label: 'Notation', value: r.notation },
      ];
      if (r.abbreviated) rows.push({ label: 'Abbreviated', value: r.abbreviated });
      if (r.unassessed.length) rows.push({ label: 'Not yet assessed', value: r.unassessed.join(', ') });
      rows.push({ label: 'Edition', value: r.edition });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
