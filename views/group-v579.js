// spec-v579: renderer for the Robarts Histopathology Index. Group G. Items under an h2 section heading
// (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The erosion item is addressed by DESCRIPTOR rather than by score, because two of its five descriptors
// share a value: a five-level select carrying five distinct values would give a maximum of 38 instead of
// 33. The three Geboes grades that contribute nothing are listed as descriptors so a reader does not go
// looking for fields that do not exist (lib/robarts-index-v579.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile scores histologic
// activity; it never diagnoses ulcerative colitis and never selects therapy.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/robarts-index-v579.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'robarts-index'(root) {
    note(root, 'The Robarts index is a WEIGHTED SUM over four items, range 0-33. It is a companion to the Nancy index, which is a decision tree emitting a single grade — the two disagree on real biopsies. Remission is 3 or less and response 9 or less on this index; those are NOT the Geboes thresholds.');

    heading(root, 'Scored items');
    for (const item of [M.CHRONIC_INFILTRATE, M.LAMINA_PROPRIA_NEUTROPHILS, M.EPITHELIAL_NEUTROPHILS]) {
      root.appendChild(select(`${item.geboes} — weight ×${item.weight}`, `rhi-${item.key}`,
        item.levels.map((l) => [String(l.value), `${l.value} — ${l.text} (contributes ${l.value * item.weight})`])));
    }
    note(root, 'Note the epithelial-neutrophil bands overlap and leave a hole: “under 5%” is a subset of “under 50%”, so 3% fits two levels, and exactly 50% fits neither. Choose the level, not a percentage.');

    root.appendChild(select(`${M.EROSION_ULCERATION.geboes} — weight ×${M.EROSION_ULCERATION.weight}`, 'rhi-erosion',
      M.EROSION_ULCERATION.levels.map((l) => [l.descriptor, `${l.descriptor} — ${l.text} (raw ${l.value}, contributes ${l.value * M.EROSION_ULCERATION.weight})`])));
    note(root, 'Five descriptors, four distinct values: 5.1 and 5.2 both score raw 1. Chosen by descriptor for that reason.');

    heading(root, 'Graded in Geboes, but contributing nothing here');
    for (const g of M.GEBOES_GRADES_CONTRIBUTING_ZERO) {
      note(root, `${g.geboes}: ${g.text} — contributes 0 at every level, so it is not an input.`);
    }

    const ids = ['rhi-chronicInfiltrate', 'rhi-laminaPropriaNeutrophils', 'rhi-epithelialNeutrophils', 'rhi-erosion'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.robartsIndex({
        chronicInfiltrate: val('rhi-chronicInfiltrate'),
        laminaPropriaNeutrophils: val('rhi-laminaPropriaNeutrophils'),
        epithelialNeutrophils: val('rhi-epithelialNeutrophils'),
        erosionUlceration: val('rhi-erosion'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Robarts index', value: `${r.total} of ${r.max}` },
        { label: 'Remission / response', value: r.remission ? 'histological remission' : (r.response ? 'response, not remission' : 'neither') },
        { label: 'Contributions', value: r.items.map((i) => `${i.key} ${i.raw}×${i.weight}=${i.contribution}`).join(', ') },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
