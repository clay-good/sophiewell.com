// spec-v783 §2: renderer for posas-patient-scar — the POSAS Patient Scale (Clinical
// Scoring & Risk, Group G). The patient-rated half of the scale whose observer half is
// the posas-observer-scar tile.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six 1-10 number
// inputs plus an optional overall-opinion input; the sum 6-60 describes the scar.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/posas-patient-scar-v783.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This half of the scale records what the patient reports, including pain and itch that no observer can rate. It describes a scar and tracks change over time, and it is meant to be reported alongside the observer-rated half rather than instead of it.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'posas-patient-scar'(root) {
    note(root, 'POSAS Patient Scale: the patient rates six things about their own scar, each 1 (not at all, or like normal skin) to 10 (very much, or the worst imaginable). The total is the sum of the six items (6 to 60; 6 = like normal skin, higher is worse). The overall opinion is recorded separately and is not part of the total.');
    root.appendChild(numberField('Pain in the scar (1–10)', 'posasp-pain'));
    root.appendChild(numberField('Itch in the scar (1–10)', 'posasp-itch'));
    root.appendChild(numberField('Color, how different from normal skin (1–10)', 'posasp-color'));
    root.appendChild(numberField('Pliability, how much stiffer than normal skin (1–10)', 'posasp-pliab'));
    root.appendChild(numberField('Thickness, how different from normal skin (1–10)', 'posasp-thick'));
    root.appendChild(numberField('Relief, how irregular the surface is (1–10)', 'posasp-relief'));
    root.appendChild(numberField('Overall opinion of the scar (1–10, optional)', 'posasp-overall'));
    const ids = ['posasp-pain', 'posasp-itch', 'posasp-color', 'posasp-pliab', 'posasp-thick', 'posasp-relief', 'posasp-overall'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.posasPatientScar({
        pain: val('posasp-pain'), itch: val('posasp-itch'), color: val('posasp-color'),
        pliability: val('posasp-pliab'), thickness: val('posasp-thick'), relief: val('posasp-relief'),
        overallOpinion: val('posasp-overall'),
      });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.score}/60` },
      ];
      if (r.overall !== null) rows.push({ label: 'Overall opinion', value: `${r.overall}/10 (not in the total)` });
      resultRow(o, rows);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
