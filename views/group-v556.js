// spec-v556: renderer for the Vitiligo Area Scoring Index. Group G. Regions under an h2 section heading
// (never h3 - an h3 under the page h1 is a heading-level skip).
//
// Depigmentation is a SELECT over the seven permitted values, never a number input, because the ladder is
// ordinal and chosen by description: a free-text percentage field would look more precise and would be
// scoring a different instrument (lib/vasi-v556.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile measures extent and
// severity; it never diagnoses vitiligo and never doses phototherapy.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/vasi-v556.js';
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
function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: '0.5' }));
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

const DEPIG = [['', 'Not involved'],
  ...M.DEPIGMENTATION_GRADES.map((g) => [String(g.value), `${g.value}% — ${g.text}`])];

export const renderers = {
  vasi(root) {
    note(root, 'VASI is the sum, over body regions, of the hand units of involvement multiplied by the residual depigmentation. One hand unit is the patient’s own palm including the fingers, taken as 1% of their body surface area — so the unit is patient-relative, not an absolute area. Depigmentation is a seven-level ordinal ladder chosen by description, not a free percentage. This computes the TOTAL-BODY score (0-100); facial VASI runs 0-3 and is a different scale.');

    heading(root, 'Six mutually exclusive regions');
    note(root, 'The upper extremities exclude the hands and the lower extremities exclude the feet. The original description used five regions without those exclusions, so a VASI is only reproducible when its region set is named.');
    for (const region of M.VASI_REGIONS) {
      root.appendChild(number(`${region.text} — involved area in hand units (1 unit = 1% BSA)`, `vasi-${region.key}-area`));
      root.appendChild(select(`${region.text} — residual depigmentation`, `vasi-${region.key}-depig`, DEPIG));
    }

    const ids = M.VASI_REGIONS.flatMap((r) => [`vasi-${r.key}-area`, `vasi-${r.key}-depig`]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const region of M.VASI_REGIONS) {
        input[`${region.key}Area`] = val(`vasi-${region.key}-area`);
        input[`${region.key}Depigmentation`] = val(`vasi-${region.key}-depig`);
      }
      const r = M.vasi(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'T-VASI', value: `${r.total} of ${r.max}` },
        { label: 'Total involved area', value: `${r.totalHandUnits} hand units (% BSA)` },
        { label: 'Region set', value: r.regionSet },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
