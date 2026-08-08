// spec-v673 §2: renderer for heckerling-pneumonia — the Heckerling clinical prediction
// rule for pneumonia (Clinical Scoring & Risk, Group G). Companion to the built
// pneumonia-severity cluster (psi, curb-65, corb-score).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Five predictor
// checkboxes; the 0-5 count maps to a low/intermediate/high probability band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/heckerling-pneumonia-v673.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ` ${label}` }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score estimates the probability of a radiographic infiltrate to help decide whether to image; the percentages are prevalence-dependent (nomogram-based) and approximate. It was derived in adults with acute respiratory illness, is not for immunocompromised patients, and does not diagnose pneumonia by itself.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ITEMS = [
  ['heck-fever', 'Temperature > 37.8 °C (100 °F)'],
  ['heck-tachy', 'Heart rate > 100 /min'],
  ['heck-crackles', 'Crackles (rales) on auscultation'],
  ['heck-breath', 'Decreased breath sounds'],
  ['heck-noasthma', 'Absence of asthma (patient has no asthma)'],
];

export const renderers = {
  'heckerling-pneumonia'(root) {
    note(root, 'Heckerling pneumonia rule (Heckerling 1990): check each finding present. More points = higher probability of a radiographic infiltrate (0–1 low, 2–3 intermediate, 4–5 high) → guides whether to obtain a chest x-ray. Note: the absence of asthma scores the point. Companion tiles: psi, curb-65.');
    for (const [id, label] of ITEMS) root.appendChild(checkField(label, id));
    const ids = ITEMS.map(([id]) => id);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.heckerlingPneumonia({
        fever: checked('heck-fever'),
        tachycardia: checked('heck-tachy'),
        crackles: checked('heck-crackles'),
        decreasedBreathSounds: checked('heck-breath'),
        noAsthma: checked('heck-noasthma'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/5` },
        { label: 'Approx. probability', value: r.approxProbability },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
