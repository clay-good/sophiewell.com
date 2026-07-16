// spec-v349: renderer for the Fazekas scale of white matter hyperintensities (WMH) on brain MRI.
// Group G. The radiologist picks the periventricular (PVH) and deep white matter (DWMH) grades, each
// 0-3; the tile reports both grades, their descriptions, the combined total, and a warn flag when
// either region reaches grade 2 (confluent burden).
//
// Same input/render contract as the rest of the codebase: the inputs have real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Fazekas grades; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/fazekas-v349.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fazekas-v349.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The interpretation stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'fazekas-wmh'(root) {
    note(root, 'Fazekas scale (Fazekas 1987) of white matter hyperintensities on brain MRI (FLAIR preferred). Pick both grades. Periventricular (PVH): 0 absent, 1 caps / thin lining, 2 smooth halo, 3 irregular extension into deep white matter. Deep white matter (DWMH): 0 absent, 1 punctate foci, 2 beginning confluence, 3 large confluent areas. Higher grades indicate greater white-matter-disease burden, read in the clinical context. Near-neighbors: marshall-ct.');
    root.appendChild(select('Periventricular (PVH) grade', 'fz-pvh', [
      ['0', '0 - absent'],
      ['1', '1 - caps or a pencil-thin lining'],
      ['2', '2 - smooth halo'],
      ['3', '3 - irregular, extending into deep white matter'],
    ]));
    root.appendChild(select('Deep white matter (DWMH) grade', 'fz-dwmh', [
      ['0', '0 - absent'],
      ['1', '1 - punctate foci'],
      ['2', '2 - beginning confluence of foci'],
      ['3', '3 - large confluent areas'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['fz-pvh', 'fz-dwmh'], () => safe(o, () => {
      const r = M.fazekas({ pvh: val('fz-pvh'), dwmh: val('fz-dwmh') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'PVH', value: r.pvh },
        { label: 'DWMH', value: r.dwmh },
        { label: 'Combined', value: `${r.total} / 6` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
