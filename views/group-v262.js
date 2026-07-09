// spec-v262 §2: renderers for the pediatric acute-assessment instruments — the
// Lab-score for serious bacterial infection, the CHALICE head-injury rule, and the
// Egami IVIG-resistance score. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the imaging, lumbar-puncture, admission,
// and prescribing decision to the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pediatric-acute-v262.js';
import { resultRow } from '../lib/result-copy.js';

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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The scan, tap, admission, and treatment decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'lab-score'(root) {
    note(root, 'Lab-score (Galetto-Lacour 2008): biomarker risk of serious bacterial infection in fever without source. Total 0-9; >= 3 = high risk. Near-neighbors: step-by-step, rochester, nigrovic.');
    root.appendChild(select('CRP', 'ls-crp', [['lt40', 'CRP < 40 mg/L (0)'], ['mid', 'CRP 40-99 mg/L (+2)'], ['high', 'CRP >= 100 mg/L (+4)']]));
    root.appendChild(select('Procalcitonin', 'ls-pct', [['lt05', 'PCT < 0.5 ng/mL (0)'], ['mid', 'PCT 0.5-1.99 ng/mL (+2)'], ['high', 'PCT >= 2.0 ng/mL (+4)']]));
    root.appendChild(check('Urine dipstick positive (leukocyte esterase and/or nitrite) (+1)', 'ls-urine'));
    const o = out(); root.appendChild(o);
    wire(['ls-crp', 'ls-pct', 'ls-urine'], () => safe(o, () => {
      render(o, M.labScore({ crp: val('ls-crp'), pct: val('ls-pct'), urinePositive: chk('ls-urine') }), 'Lab-score');
    }));
    postureNote(root);
  },
  'chalice'(root) {
    note(root, 'CHALICE rule (Dunning 2006): a sensitivity-first pediatric head-CT rule. CT recommended if ANY of 14 criteria is present. Near-neighbors: pecarn-head, catch-head, canadian-ct-head.');
    note(root, 'History:');
    root.appendChild(check('Witnessed loss of consciousness > 5 min', 'ch-loc'));
    root.appendChild(check('Amnesia > 5 min', 'ch-amnesia'));
    root.appendChild(check('Abnormal drowsiness', 'ch-drowsy'));
    root.appendChild(check('>= 3 vomits after injury', 'ch-vomit'));
    root.appendChild(check('Suspicion of non-accidental injury', 'ch-nai'));
    root.appendChild(check('Post-traumatic seizure without epilepsy history', 'ch-seizure'));
    note(root, 'Examination:');
    root.appendChild(check('GCS < 14 (or < 15 if age < 1 year)', 'ch-gcs'));
    root.appendChild(check('Suspected penetrating/depressed skull injury or tense fontanelle', 'ch-penetrating'));
    root.appendChild(check('Signs of a basal skull fracture', 'ch-basal'));
    root.appendChild(check('Positive focal neurology', 'ch-focal'));
    root.appendChild(check('Bruise/swelling/laceration > 5 cm if age < 1 year', 'ch-bruise'));
    note(root, 'Mechanism:');
    root.appendChild(check('High-speed road-traffic accident (> 40 mph) as pedestrian/cyclist/occupant', 'ch-rta'));
    root.appendChild(check('Fall > 3 m', 'ch-fall'));
    root.appendChild(check('High-speed projectile or object', 'ch-projectile'));
    const o = out(); root.appendChild(o);
    wire(['ch-loc', 'ch-amnesia', 'ch-drowsy', 'ch-vomit', 'ch-nai', 'ch-seizure', 'ch-gcs', 'ch-penetrating', 'ch-basal', 'ch-focal', 'ch-bruise', 'ch-rta', 'ch-fall', 'ch-projectile'], () => safe(o, () => {
      render(o, M.chalice({
        locOver5: chk('ch-loc'), amnesiaOver5: chk('ch-amnesia'), drowsiness: chk('ch-drowsy'),
        vomits3: chk('ch-vomit'), nonAccidental: chk('ch-nai'), seizure: chk('ch-seizure'),
        gcsLow: chk('ch-gcs'), penetrating: chk('ch-penetrating'), basalSkull: chk('ch-basal'),
        focalNeuro: chk('ch-focal'), bruise5: chk('ch-bruise'), highSpeedRta: chk('ch-rta'),
        fall3m: chk('ch-fall'), projectile: chk('ch-projectile'),
      }), 'Positive');
    }));
    postureNote(root);
  },
  'egami'(root) {
    note(root, 'Egami score (Egami 2006): predicts IVIG resistance in Kawasaki disease. Total 0-6; >= 3 = high risk. Near-neighbor: kawasaki-criteria.');
    root.appendChild(check('ALT >= 80 IU/L (+2)', 'eg-alt'));
    root.appendChild(check('Age <= 6 months (+1)', 'eg-age'));
    root.appendChild(check('Treatment on illness day <= 4 (+1)', 'eg-day'));
    root.appendChild(check('CRP >= 8 mg/dL (+1)', 'eg-crp'));
    root.appendChild(check('Platelets <= 300k /mm^3 (+1)', 'eg-plt'));
    const o = out(); root.appendChild(o);
    wire(['eg-alt', 'eg-age', 'eg-day', 'eg-crp', 'eg-plt'], () => safe(o, () => {
      render(o, M.egami({
        altHigh: chk('eg-alt'), ageYoung: chk('eg-age'), earlyTreatment: chk('eg-day'),
        crpHigh: chk('eg-crp'), plateletsLow: chk('eg-plt'),
      }), 'Egami');
    }));
    postureNote(root);
  },
};
