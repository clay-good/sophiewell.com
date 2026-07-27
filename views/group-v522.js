// spec-v522: renderer for the Pediatric Crohn's Disease Activity Index (PCDAI). Group G. Eight enum selects
// plus the hematocrit age/sex band select and three number inputs, under three h2 section headings that
// follow the index's own three fields - history, physical examination and growth, and laboratory (never h3 -
// an h3 under the page h1 is a heading-level skip).
//
// The hematocrit band is asked EXPLICITLY rather than inferred, because there is no single low-hematocrit
// cut: 34 percent is a 0 in a girl of 12 and 2.5 points in a boy of 12, and scoring every child against one
// threshold is the specific error that item exists to prevent (lib/pcdai-v522.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports a disease-activity
// score; it never asserts a diagnosis, mucosal healing, or a therapy change.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pcdai-v522.js';
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

export const renderers = {
  'pcdai'(root) {
    note(root, 'The Pediatric Crohn’s Disease Activity Index: eleven items, total 0 to 100. The weights are not uniform — eight items score 0, 5, or 10; hematocrit and ESR score 0, 2.5, or 5; and albumin scores 0, 5, or 10 like the eight. The hematocrit threshold depends on age and sex, so the band is asked explicitly. Below 10 is inactive and 30 or above is moderate to severe, following the cut scores recommended in the 2005 prospective evaluation. It scores activity — it does not diagnose Crohn’s disease and does not measure mucosal healing.');

    const ids = [];
    const addSelect = (item) => {
      const id = `pcd-${item.key}`;
      ids.push(id);
      root.appendChild(select(item.text, id, item.options.map((o) => [o.value, o.text])));
    };

    heading(root, 'History over the past week');
    for (const item of M.PCDAI_ITEMS.filter((i) => i.group === 'history')) addSelect(item);

    heading(root, 'Physical examination and growth');
    for (const item of M.PCDAI_ITEMS.filter((i) => i.group === 'exam')) addSelect(item);

    heading(root, 'Laboratory');
    ids.push('pcd-hctBand');
    root.appendChild(select('Age and sex band for the hematocrit threshold (the cut differs by band — there is no single low-hematocrit value)',
      'pcd-hctBand', M.HCT_BANDS.map((b) => [b.value, b.text])));
    ids.push('pcd-hct', 'pcd-esr', 'pcd-albumin');
    root.appendChild(number('Hematocrit (percent)', 'pcd-hct', '0.1'));
    root.appendChild(number('ESR (mm/hr)', 'pcd-esr', '1'));
    root.appendChild(number('Serum albumin (g/dL)', 'pcd-albumin', '0.1'));

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const item of M.PCDAI_ITEMS) args[item.key] = val(`pcd-${item.key}`);
      args.hctBand = val('pcd-hctBand');
      args.hct = val('pcd-hct');
      args.esr = val('pcd-esr');
      args.albumin = val('pcd-albumin');
      const r = M.pcdai(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: `${r.total} of 100` },
        { label: 'Activity', value: r.activity },
        { label: 'Clinical items', value: `${r.clinicalTotal} of 80` },
        { label: 'Labs', value: `${r.labTotal} of 20` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
