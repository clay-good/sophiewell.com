// spec-v876 §2: renderer for nhsn-vae — the NHSN ventilator-associated event algorithm (Clinical
// Scoring & Risk, Group G).
//
// The no-radiograph sentence prints on every result, because a reader arriving here looking for
// ventilator-associated pneumonia needs to be told immediately that this is not that.

import { el, clear } from '../lib/dom.js';
import * as V from '../lib/nhsn-vae-v876.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number' }, attrs || {})));
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'nhsn-vae'(root) {
    note(root, 'Every value below is a daily minimum, not a value recorded at a moment. No chest radiograph enters this algorithm at any step.');

    root.appendChild(el('h2', { text: 'Baseline period' }));
    checkField(root, 'At least two calendar days of stable or decreasing daily minimum settings', 'vae-stabilityperiod');
    numField(root, 'Baseline daily minimum FiO2, percent', 'vae-baselinefio2', { min: '21', max: '100', step: '1' });
    numField(root, 'Baseline daily minimum PEEP, cmH2O', 'vae-baselinepeep', { min: '0', max: '40', step: '1' });

    root.appendChild(el('h2', { text: 'Event period' }));
    numField(root, 'Event daily minimum FiO2, percent', 'vae-eventfio2', { min: '21', max: '100', step: '1' });
    numField(root, 'Event daily minimum PEEP, cmH2O', 'vae-eventpeep', { min: '0', max: '40', step: '1' });
    checkField(root, 'The rise was sustained for at least two calendar days', 'vae-sustainedtwodays');

    root.appendChild(el('h2', { text: 'Infection-related criteria' }));
    checkField(root, 'Temperature above 100.4 F or below 96.8 F', 'vae-temperatureabnormal');
    checkField(root, 'White cell count at or above 12,000 or at or below 4,000 per cubic millimeter', 'vae-whitecountabnormal');
    checkField(root, 'A new antimicrobial was started and continued for at least four calendar days', 'vae-newantimicrobialfourdays');
    checkField(root, 'A qualifying microbiological criterion is met', 'vae-microbiologicalcriterion');

    const ids = ['vae-stabilityperiod', 'vae-baselinefio2', 'vae-baselinepeep', 'vae-eventfio2', 'vae-eventpeep',
      'vae-sustainedtwodays', 'vae-temperatureabnormal', 'vae-whitecountabnormal', 'vae-newantimicrobialfourdays',
      'vae-microbiologicalcriterion'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = V.nhsnVae({
        stabilityPeriod: checked('vae-stabilityperiod'),
        baselineFio2: val('vae-baselinefio2'),
        baselinePeep: val('vae-baselinepeep'),
        eventFio2: val('vae-eventfio2'),
        eventPeep: val('vae-eventpeep'),
        sustainedTwoDays: checked('vae-sustainedtwodays'),
        temperatureAbnormal: checked('vae-temperatureabnormal'),
        whiteCountAbnormal: checked('vae-whitecountabnormal'),
        newAntimicrobialFourDays: checked('vae-newantimicrobialfourdays'),
        microbiologicalCriterion: checked('vae-microbiologicalcriterion'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.missingNote) note(o, r.missingNote);
      if (r.peepFloorNote) note(o, r.peepFloorNote);
      if (r.nextTierNote) note(o, r.nextTierNote);
      if (r.pvapNote) note(o, r.pvapNote);
      note(o, r.dailyMinimumNote);
      note(o, r.noRadiographNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published surveillance algorithm to values already recorded. It does not diagnose pneumonia, and it does not decide whether to treat.' }));
  },
};
