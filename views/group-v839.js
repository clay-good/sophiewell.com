// spec-v839 §2: renderer for af-stages-2023 — the 2023 stage-based classification of atrial
// fibrillation (Clinical Scoring & Risk, Group G).
//
// "Rhythm control is no longer being pursued" is its own checkbox, separate from the duration
// pattern, because permanent AF is a decision rather than a duration. Folding it into the
// pattern select would be the exact error the staging exists to prevent.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/af-stages-2023-v839.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function selField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'af-stages-2023'(root) {
    note(root, 'Permanent atrial fibrillation is a decision, not a duration. The stages also begin before any arrhythmia exists, which is what makes prevention part of the classification.');

    root.appendChild(el('h2', { text: 'Before the arrhythmia' }));
    root.appendChild(checkField('Risk factors for atrial fibrillation are present', 'afs-risk'));
    root.appendChild(checkField('Structural or electrical findings that predispose to atrial fibrillation', 'afs-predisposing'));

    root.appendChild(el('h2', { text: 'Documented atrial fibrillation' }));
    root.appendChild(checkField('Atrial fibrillation has been documented', 'afs-documented'));
    selField(root, 'Pattern', 'afs-pattern', [
      ['', 'Not yet specified'],
      ['paroxysmal', 'Paroxysmal: intermittent, terminating within 7 days'],
      ['persistent', 'Persistent: continuous beyond 7 days, needing intervention to terminate'],
      ['long-standing-persistent', 'Long-standing persistent: continuous beyond 12 months'],
    ]);
    root.appendChild(checkField('Free from atrial fibrillation after ablation or surgical intervention', 'afs-ablation'));

    root.appendChild(el('h2', { text: 'The decision that defines stage 4' }));
    root.appendChild(checkField('A joint decision has been made to make no further attempts at rhythm control', 'afs-abandoned'));

    const ids = ['afs-risk', 'afs-predisposing', 'afs-documented', 'afs-pattern', 'afs-ablation', 'afs-abandoned'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.afStages2023({
        riskFactors: checked('afs-risk'),
        predisposingFindings: checked('afs-predisposing'),
        documentedAf: checked('afs-documented'),
        pattern: val('afs-pattern'),
        freeAfterAblation: checked('afs-ablation'),
        rhythmControlAbandoned: checked('afs-abandoned'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.permanentNote) note(o, r.permanentNote);
      if (r.preAfNote) note(o, r.preAfNote);
      if (r.ablationNote) note(o, r.ablationNote);
      if (r.continuumNote) note(o, r.continuumNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published classification to a history already taken. It does not choose anticoagulation or a rhythm-control strategy.' }));
  },
};
