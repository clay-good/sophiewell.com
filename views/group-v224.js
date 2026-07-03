// spec-v224 §2: renderers for the neurology instruments — ID Migraine, ONLS,
// END-IT, Engel and ILAE epilepsy-surgery outcome, Salzburg NCSE criteria, and the
// Dizziness Handicap Inventory. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnostic / treatment decision to
// the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/neurology-v224.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
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
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnostic and treatment decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel, value) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'id-migraine'(root) {
    note(root, 'ID Migraine screener (Lipton 2003): nausea, photophobia, headache-related disability over the past 3 months. >= 2 positive = positive migraine screen. Near-neighbors: midas, pound-migraine.');
    root.appendChild(check('Nausea or sick to your stomach with headaches', 'idm-nausea'));
    root.appendChild(check('Light bothers you a lot more when you have headaches', 'idm-photo'));
    root.appendChild(check('Headaches limited activity for >= 1 day', 'idm-dis'));
    const o = out(); root.appendChild(o);
    wire(['idm-nausea', 'idm-photo', 'idm-dis'], () => safe(o, () => {
      const r = M.idMigraine({ nausea: chk('idm-nausea'), photophobia: chk('idm-photo'), disability: chk('idm-dis') });
      render(o, r, 'ID Migraine', `${r.score}`);
    }));
    postureNote(root);
  },
  'onls'(root) {
    note(root, 'ONLS (Graham & Hughes 2006): arm scale (0-5) + leg scale (0-7), total 0-12. Higher = greater neuropathy-related limitation. Near-neighbors: mrc-sum-score, edss.');
    root.appendChild(select('Arm scale (0-5)', 'onls-arm', [['0', '0 - normal'], ['1', '1 - minor symptoms, no functional effect'], ['2', '2 - affects but does not prevent functions'], ['3', '3 - prevents >= 1 function'], ['4', '4 - prevents all listed functions, purposeful movement possible'], ['5', '5 - no purposeful movement in either arm']]));
    root.appendChild(select('Leg scale (0-7)', 'onls-leg', [['0', '0 - unaffected'], ['1', '1 - affected, gait normal-looking'], ['2', '2 - independent, gait abnormal'], ['3', '3 - unilateral support to walk 10 m'], ['4', '4 - bilateral support to walk 10 m'], ['5', '5 - wheelchair, can stand/walk 1 m with help'], ['6', '6 - wheelchair, some purposeful leg movement'], ['7', '7 - wheelchair/bed-bound, no purposeful leg movement']]));
    const o = out(); root.appendChild(o);
    wire(['onls-arm', 'onls-leg'], () => safe(o, () => {
      render(o, M.onls({ arm: val('onls-arm'), leg: val('onls-leg') }), 'ONLS', `${M.onls({ arm: val('onls-arm'), leg: val('onls-leg') }).score}`);
    }));
    postureNote(root);
  },
  'end-it-score'(root) {
    note(root, 'END-IT score (Gao 2016): encephalitis, nonconvulsive SE, diazepam resistance, imaging (uni 1 / bi 2), intubation (0-6). >= 3 unfavorable outcome. Near-neighbors: stess, helps2b.');
    root.appendChild(check('Encephalitis etiology (+1)', 'end-enc'));
    root.appendChild(check('Nonconvulsive SE after convulsive SE controlled (+1)', 'end-ncse'));
    root.appendChild(check('Diazepam resistance (+1)', 'end-diaz'));
    root.appendChild(select('Imaging', 'end-img', [['0', 'Normal / no lesions (0)'], ['1', 'Unilateral lesions (+1)'], ['2', 'Bilateral lesions / diffuse cerebral edema (+2)']]));
    root.appendChild(check('Tracheal intubation (+1)', 'end-intub'));
    const o = out(); root.appendChild(o);
    wire(['end-enc', 'end-ncse', 'end-diaz', 'end-img', 'end-intub'], () => safe(o, () => {
      const r = M.endIt({ encephalitis: chk('end-enc'), ncse: chk('end-ncse'), diazepamResistance: chk('end-diaz'), imaging: val('end-img'), intubation: chk('end-intub') });
      render(o, r, 'END-IT', `${r.score}`);
    }));
    postureNote(root);
  },
  'engel-classification'(root) {
    note(root, 'Engel epilepsy-surgery outcome (Engel 1993): Class I free of disabling seizures; II rare disabling; III worthwhile improvement; IV no worthwhile improvement. Near-neighbors: ilae-surgical-outcome, stess.');
    root.appendChild(select('Postoperative seizure outcome', 'eng-out', [['1', 'Free of disabling seizures (Class I)'], ['2', 'Rare disabling seizures (Class II)'], ['3', 'Worthwhile improvement (Class III)'], ['4', 'No worthwhile improvement (Class IV)']]));
    const o = out(); root.appendChild(o);
    wire(['eng-out'], () => safe(o, () => {
      const r = M.engel({ outcome: val('eng-out') });
      render(o, r, 'Engel', r.engelClass);
    }));
    postureNote(root);
  },
  'ilae-surgical-outcome'(root) {
    note(root, 'ILAE epilepsy-surgery outcome (Wieser 2001): Class 1 seizure-free; 2 auras only; 3 1-3 seizure days/year; 4 to 50% reduction; 5 to 100% increase; 6 > 100% increase. Near-neighbors: engel-classification, stess.');
    root.appendChild(check('Completely seizure-free, no auras (Class 1)', 'ilae-free'));
    root.appendChild(check('Only auras, no other seizures (Class 2)', 'ilae-aura'));
    root.appendChild(num('Current seizure days per year', 'ilae-days', { min: '0' }));
    root.appendChild(num('Baseline (preoperative) seizure days per year', 'ilae-base', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ilae-free', 'ilae-aura', 'ilae-days', 'ilae-base'], () => safe(o, () => {
      const r = M.ilaeOutcome({ seizureFree: chk('ilae-free'), aurasOnly: chk('ilae-aura'), seizureDays: val('ilae-days'), baselineDays: val('ilae-base') });
      render(o, r, 'ILAE', r.ilaeClass !== undefined ? `${r.ilaeClass}` : '');
    }));
    postureNote(root);
  },
  'salzburg-ncse-criteria'(root) {
    note(root, 'Salzburg consensus criteria for NCSE (Leitinger 2015): discharges > 2.5/s = definite; slower pattern needs a secondary criterion; EEG-only improvement = possible. Near-neighbors: stess, helps2b.');
    root.appendChild(select('EEG pattern (worst 10-second epoch)', 'salz-pat', [['0', 'Neither of the below'], ['1', 'Epileptiform discharges <= 2.5/s OR rhythmic delta/theta > 0.5/s'], ['2', 'Epileptiform discharges > 2.5/s']]));
    root.appendChild(check('Typical spatiotemporal evolution', 'salz-evo'));
    root.appendChild(check('Subtle clinical ictal phenomena time-locked to the pattern', 'salz-ictal'));
    root.appendChild(check('Clinical AND EEG improvement after IV antiepileptic', 'salz-both'));
    root.appendChild(check('EEG-only improvement after IV antiepileptic', 'salz-eeg'));
    const o = out(); root.appendChild(o);
    wire(['salz-pat', 'salz-evo', 'salz-ictal', 'salz-both', 'salz-eeg'], () => safe(o, () => {
      const r = M.salzburg({ pattern: val('salz-pat'), evolution: chk('salz-evo'), subtleIctal: chk('salz-ictal'), clinicalEegImprovement: chk('salz-both'), eegOnlyImprovement: chk('salz-eeg') });
      render(o, r, 'Verdict', r.bandLabel);
    }));
    postureNote(root);
  },
  'dhi'(root) {
    note(root, 'Dizziness Handicap Inventory (Jacobson & Newman 1990): 25 items, No 0 / Sometimes 2 / Yes 4; total 0-100. 0-30 mild, 31-60 moderate, 61-100 severe. Near-neighbors: epworth, mini-cog.');
    root.appendChild(num('Number of "Yes" answers (0-25)', 'dhi-yes', { min: '0', max: '25' }));
    root.appendChild(num('Number of "Sometimes" answers (0-25)', 'dhi-some', { min: '0', max: '25' }));
    const o = out(); root.appendChild(o);
    wire(['dhi-yes', 'dhi-some'], () => safe(o, () => {
      const r = M.dhi({ numberYes: val('dhi-yes'), numberSometimes: val('dhi-some') });
      render(o, r, 'DHI', r.score !== undefined ? `${r.score}` : '');
    }));
    postureNote(root);
  },
};
