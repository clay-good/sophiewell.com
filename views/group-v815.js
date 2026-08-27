// spec-v815 §2: renderer for migraine-ichd3 — the ICHD-3 criteria for 1.1 Migraine without
// aura and 1.2 Migraine with aura (Clinical Scoring & Risk, Group G).
//
// Photophobia and phonophobia get SEPARATE checkboxes. Criterion D of 1.1 counts them only
// together, and a single combined tick cannot express that - it would let photophobia alone
// satisfy the criterion, which is the misreading this tile exists to prevent.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/migraine-ichd3-v815.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  return wrap;
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
  'migraine-ichd3'(root) {
    note(root, 'Both criteria sets are assessed together, because neither contains the other. Migraine without aura needs 5 attacks; migraine with aura needs only 2.');

    root.appendChild(el('h2', { text: 'Attacks' }));
    root.appendChild(numField('Number of attacks so far', 'mig-attacks', { min: '0', step: '1' }));
    root.appendChild(numField('Headache duration untreated, hours', 'mig-hours', { min: '0', step: '1' }));

    root.appendChild(el('h2', { text: 'Headache characteristics, at least two needed for 1.1' }));
    root.appendChild(checkField('One-sided location', 'mig-unilateral'));
    root.appendChild(checkField('Pulsating quality', 'mig-pulsating'));
    root.appendChild(checkField('Moderate or severe pain intensity', 'mig-severity'));
    root.appendChild(checkField('Made worse by, or causing avoidance of, routine physical activity', 'mig-activity'));

    root.appendChild(el('h2', { text: 'During the headache: nausea or vomiting, OR both phobias together' }));
    root.appendChild(checkField('Nausea and/or vomiting', 'mig-nausea'));
    root.appendChild(checkField('Photophobia', 'mig-photophobia'));
    root.appendChild(checkField('Phonophobia', 'mig-phonophobia'));

    root.appendChild(el('h2', { text: 'Fully reversible aura symptoms, at least one needed for 1.2' }));
    root.appendChild(checkField('Visual', 'mig-aura-visual'));
    root.appendChild(checkField('Sensory', 'mig-aura-sensory'));
    root.appendChild(checkField('Speech and/or language', 'mig-aura-speech'));
    root.appendChild(checkField('Motor', 'mig-aura-motor'));
    root.appendChild(checkField('Brainstem', 'mig-aura-brainstem'));
    root.appendChild(checkField('Retinal', 'mig-aura-retinal'));

    root.appendChild(el('h2', { text: 'Aura characteristics, at least three needed for 1.2' }));
    root.appendChild(checkField('At least one aura symptom spreads gradually over 5 minutes or more', 'mig-aura-spread'));
    root.appendChild(checkField('Two or more aura symptoms occur in succession', 'mig-aura-succession'));
    root.appendChild(checkField('Each individual aura symptom lasts 5 to 60 minutes', 'mig-aura-duration'));
    root.appendChild(checkField('At least one aura symptom is one-sided', 'mig-aura-unilateral'));
    root.appendChild(checkField('At least one aura symptom is positive', 'mig-aura-positive'));
    root.appendChild(checkField('The aura is accompanied, or followed within 60 minutes, by headache', 'mig-aura-headache'));

    root.appendChild(el('h2', { text: 'Exclusion' }));
    root.appendChild(checkField('Not better accounted for by another ICHD-3 diagnosis', 'mig-noother'));

    const ids = ['mig-attacks', 'mig-hours', 'mig-unilateral', 'mig-pulsating', 'mig-severity', 'mig-activity',
      'mig-nausea', 'mig-photophobia', 'mig-phonophobia',
      'mig-aura-visual', 'mig-aura-sensory', 'mig-aura-speech', 'mig-aura-motor', 'mig-aura-brainstem', 'mig-aura-retinal',
      'mig-aura-spread', 'mig-aura-succession', 'mig-aura-duration', 'mig-aura-unilateral', 'mig-aura-positive', 'mig-aura-headache',
      'mig-noother'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.migraineIchd3({
        attackCount: val('mig-attacks'),
        headacheHours: val('mig-hours'),
        unilateral: checked('mig-unilateral'),
        pulsating: checked('mig-pulsating'),
        moderateOrSevere: checked('mig-severity'),
        worseWithActivity: checked('mig-activity'),
        nauseaVomiting: checked('mig-nausea'),
        photophobia: checked('mig-photophobia'),
        phonophobia: checked('mig-phonophobia'),
        auraVisual: checked('mig-aura-visual'),
        auraSensory: checked('mig-aura-sensory'),
        auraSpeech: checked('mig-aura-speech'),
        auraMotor: checked('mig-aura-motor'),
        auraBrainstem: checked('mig-aura-brainstem'),
        auraRetinal: checked('mig-aura-retinal'),
        auraSpreadsGradually: checked('mig-aura-spread'),
        auraInSuccession: checked('mig-aura-succession'),
        auraLasts5to60: checked('mig-aura-duration'),
        auraUnilateral: checked('mig-aura-unilateral'),
        auraPositive: checked('mig-aura-positive'),
        auraWithHeadache: checked('mig-aura-headache'),
        noBetterExplanation: checked('mig-noother'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Headache characteristics', value: `${r.headacheFeatureCount}/4` },
        { label: 'Aura characteristics', value: `${r.auraFeatureCount}/6` },
      ]);
      if (r.phobiaNote) note(o, r.phobiaNote);
      if (r.thresholdNote) note(o, r.thresholdNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to a history already taken. It does not prescribe an abortive or a preventive.' }));
  },
};
