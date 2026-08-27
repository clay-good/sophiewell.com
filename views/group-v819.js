// spec-v819 §2: renderer for indomethacin-headache-ichd3 — ICHD-3 3.2 Paroxysmal hemicrania
// and 3.4 Hemicrania continua (Clinical Scoring & Risk, Group G).
//
// The indomethacin question sits under its own heading saying it is a diagnostic criterion.
// It is the one input without which neither diagnosis can be made at all, and burying it
// among the symptom checkboxes would present it as one tick among many.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/indomethacin-headache-ichd3-v819.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'numeric' }, attrs || {})));
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
  'indomethacin-headache-ichd3'(root) {
    note(root, 'Both diagnoses are assessed together. Paroxysmal hemicrania is the one most often mistaken for cluster headache: shorter attacks, more of them, and indomethacin-responsive.');

    root.appendChild(el('h2', { text: 'The indomethacin trial, which is itself a diagnostic criterion' }));
    root.appendChild(checkField('An adequate trial of therapeutic doses of indomethacin has been done and the headache responded absolutely', 'ind-response'));

    root.appendChild(el('h2', { text: 'Attacks, for paroxysmal hemicrania' }));
    numField(root, 'Number of attacks so far', 'ind-attacks', { min: '0', step: '1' });
    numField(root, 'Attack duration, minutes', 'ind-minutes', { min: '0', step: '1' });
    numField(root, 'Attacks per day', 'ind-perday', { min: '0', step: '1' });

    root.appendChild(el('h2', { text: 'Continuous headache, for hemicrania continua' }));
    root.appendChild(checkField('One-sided headache that is continuous rather than in discrete attacks', 'ind-continuous'));
    numField(root, 'Months it has been present', 'ind-months', { min: '0', step: '1' });
    root.appendChild(checkField('With exacerbations of moderate or greater intensity', 'ind-exacerbations'));

    root.appendChild(el('h2', { text: 'Either or both: one autonomic sign on the same side, or restlessness' }));
    root.appendChild(checkField('Conjunctival injection and/or tearing', 'ind-conjunctival'));
    root.appendChild(checkField('Nasal congestion and/or runny nose', 'ind-nasal'));
    root.appendChild(checkField('Eyelid swelling', 'ind-eyelid'));
    root.appendChild(checkField('Forehead and facial sweating', 'ind-sweating'));
    root.appendChild(checkField('Small pupil and/or drooping eyelid', 'ind-miosis'));
    root.appendChild(checkField('A sense of restlessness or agitation', 'ind-restless'));
    root.appendChild(checkField('Pain made worse by movement (accepted by hemicrania continua only)', 'ind-movement'));

    root.appendChild(el('h2', { text: 'Exclusion' }));
    root.appendChild(checkField('Not better accounted for by another ICHD-3 diagnosis', 'ind-noother'));

    const ids = ['ind-response', 'ind-attacks', 'ind-minutes', 'ind-perday', 'ind-continuous',
      'ind-months', 'ind-exacerbations', 'ind-conjunctival', 'ind-nasal', 'ind-eyelid',
      'ind-sweating', 'ind-miosis', 'ind-restless', 'ind-movement', 'ind-noother'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.indomethacinHeadacheIchd3({
        indomethacinResponse: checked('ind-response'),
        attackCount: val('ind-attacks'),
        attackMinutes: val('ind-minutes'),
        attacksPerDay: val('ind-perday'),
        unilateralContinuous: checked('ind-continuous'),
        monthsContinuous: val('ind-months'),
        moderateExacerbations: checked('ind-exacerbations'),
        conjunctivalInjection: checked('ind-conjunctival'),
        nasalCongestion: checked('ind-nasal'),
        eyelidEdema: checked('ind-eyelid'),
        sweating: checked('ind-sweating'),
        miosisPtosis: checked('ind-miosis'),
        restlessness: checked('ind-restless'),
        aggravatedByMovement: checked('ind-movement'),
        noBetterExplanation: checked('ind-noother'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Autonomic signs', value: `${r.autonomicSigns.length}/5` },
      ]);
      if (r.indomethacinNote) note(o, r.indomethacinNote);
      if (r.clusterNote) note(o, r.clusterNote);
      if (r.movementNote) note(o, r.movementNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to a history already taken. It does not start indomethacin or manage its gastrointestinal risk.' }));
  },
};
