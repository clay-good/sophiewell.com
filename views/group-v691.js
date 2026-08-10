// spec-v691 §2: renderer for posas-observer-scar — the POSAS Observer Scale (Clinical
// Scoring & Risk, Group G). Modern companion to the vancouver-scar-scale tile.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six 1-10 number
// inputs plus an optional overall-opinion input; the sum 6-60 describes the scar.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/posas-observer-scar-v691.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '1', max: '10', step: '1', inputmode: 'numeric' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The POSAS Observer Scale describes a scar and is most useful for tracking change over time; it is typically paired with the patient-rated component and supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'posas-observer-scar'(root) {
    note(root, 'POSAS Observer Scale: rate six scar characteristics, each 1 (like normal skin) to 10 (worst scar imaginable). The total is the sum of the six items (6–60; 6 = normal skin, higher is worse). The overall opinion is recorded separately and is not part of the total.');
    root.appendChild(numberField('Vascularity (1–10)', 'posas-vasc'));
    root.appendChild(numberField('Pigmentation (1–10)', 'posas-pigment'));
    root.appendChild(numberField('Thickness (1–10)', 'posas-thick'));
    root.appendChild(numberField('Relief / surface roughness (1–10)', 'posas-relief'));
    root.appendChild(numberField('Pliability (1–10)', 'posas-pliab'));
    root.appendChild(numberField('Surface area (1–10)', 'posas-area'));
    root.appendChild(numberField('Overall opinion (1–10, optional)', 'posas-overall'));
    const ids = ['posas-vasc', 'posas-pigment', 'posas-thick', 'posas-relief', 'posas-pliab', 'posas-area', 'posas-overall'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.posasObserverScar({
        vascularity: val('posas-vasc'), pigmentation: val('posas-pigment'), thickness: val('posas-thick'),
        relief: val('posas-relief'), pliability: val('posas-pliab'), surfaceArea: val('posas-area'), overallOpinion: val('posas-overall'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.score}/60` },
        { label: 'Overall', value: r.overall !== null ? `${r.overall}/10` : '—' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
