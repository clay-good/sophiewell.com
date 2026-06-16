// spec-v90 §2: renderers for the six cardiology / ECG tiles
// (ecg-axis, lvh-criteria, timi-stemi, duke-treadmill, cardiac-power-output,
// aortic-valve-area).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Nullable numeric outputs route through fmt() so a guarded null never reaches
// the DOM as NaN/undefined (spec-v53 §3.2). Each tile renders the spec-v50 §3
// clinical posture note and quotes the cited source's own band / criterion -
// none authors a management order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import * as M from '../lib/cardio-v90.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || 'any');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
const YESNO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) {
  const v = document.getElementById(id).value;
  return v === '' ? null : Number(v);
}
function selVal(id) { return document.getElementById(id).value; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not an order. The axes, bands, and criteria are the cited source’s; the diagnosis and the management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}
// "met" / "not met" / "—" (unknown) tag for a criterion-grid row.
function metTag(b) { return b === true ? 'met' : (b === false ? 'not met' : '—'); }

export const renderers = {
  // ----- 2.1 ecg-axis -----------------------------------------------------
  'ecg-axis'(root) {
    root.appendChild(field('Net QRS deflection in lead I (mm, signed)', 'ea-i', { placeholder: 'e.g. 8' }));
    root.appendChild(field('Net QRS deflection in lead aVF (mm, signed)', 'ea-avf', { placeholder: 'e.g. 6' }));
    root.appendChild(field('Net QRS deflection in lead II (mm, optional)', 'ea-ii', { placeholder: 'optional' }));
    const o = out(); root.appendChild(o);
    wire(['ea-i', 'ea-avf', 'ea-ii'], () => safe(o, () => {
      const r = M.ecgAxis({ leadI: optNum('ea-i'), avf: optNum('ea-avf'), leadII: optNum('ea-ii') });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      if (r.indeterminate) {
        resultRow(o, [{ text: r.band, cls: 'warn' }]);
        note(o, r.note);
        return;
      }
      resultRow(o, [
        { text: r.band, cls: (r.quadrant === 'extreme' || r.quadrant === 'rad') ? 'warn' : null },
        { label: 'Mean QRS axis', value: `${fmt(r.axis, { fallback: '--' })} deg` },
        { label: 'Quadrant', value: r.quadrantLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 lvh-criteria -------------------------------------------------
  'lvh-criteria'(root) {
    root.appendChild(field('S wave in V1 (mm)', 'lv-sv1', { placeholder: 'e.g. 20' }));
    root.appendChild(field('R wave in V5 (mm)', 'lv-rv5', { placeholder: 'e.g. 18' }));
    root.appendChild(field('R wave in V6 (mm)', 'lv-rv6', { placeholder: 'e.g. 16' }));
    root.appendChild(field('S wave in V3 (mm)', 'lv-sv3', { placeholder: 'e.g. 12' }));
    root.appendChild(field('R wave in aVL (mm)', 'lv-ravl', { placeholder: 'e.g. 10' }));
    root.appendChild(selectField('Sex (for the Cornell threshold)', 'lv-sex', [
      { value: 'male', text: 'Male (Cornell > 28 mm)' },
      { value: 'female', text: 'Female (Cornell > 20 mm)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['lv-sv1', 'lv-rv5', 'lv-rv6', 'lv-sv3', 'lv-ravl', 'lv-sex'], () => safe(o, () => {
      const r = M.lvhCriteria({
        sV1: optNum('lv-sv1'), rV5: optNum('lv-rv5'), rV6: optNum('lv-rv6'),
        sV3: optNum('lv-sv3'), rAVL: optNum('lv-ravl'), sex: selVal('lv-sex'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.anyMet ? 'warn' : null },
        { label: 'Sokolow-Lyon sum (SV1 + max RV5/RV6)', value: fmt(r.sokolowSum, { fallback: '(enter SV1 and RV5/RV6)' }) },
        { label: 'Sokolow-Lyon (>= 35 mm)', value: metTag(r.sokolowMet) },
        { label: `Cornell sum (SV3 + RaVL)`, value: fmt(r.cornellSum, { fallback: '(enter SV3 and RaVL)' }) },
        { label: `Cornell voltage (> ${r.cornellThreshold} mm)`, value: metTag(r.cornellMet) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 timi-stemi ---------------------------------------------------
  'timi-stemi'(root) {
    root.appendChild(field('Age (years)', 'ts-age', { placeholder: 'e.g. 70' }));
    root.appendChild(selectField('History of diabetes, hypertension, or angina', 'ts-hist', YESNO));
    root.appendChild(selectField('Systolic BP < 100 mmHg', 'ts-sbp', YESNO));
    root.appendChild(selectField('Heart rate > 100 bpm', 'ts-hr', YESNO));
    root.appendChild(selectField('Killip class II–IV', 'ts-killip', YESNO));
    root.appendChild(selectField('Weight < 67 kg', 'ts-weight', YESNO));
    root.appendChild(selectField('Anterior ST-elevation or LBBB', 'ts-ste', YESNO));
    root.appendChild(selectField('Time to treatment > 4 hours', 'ts-time', YESNO));
    const o = out(); root.appendChild(o);
    wire(['ts-age', 'ts-hist', 'ts-sbp', 'ts-hr', 'ts-killip', 'ts-weight', 'ts-ste', 'ts-time'], () => safe(o, () => {
      const r = M.timiStemi({
        age: optNum('ts-age'),
        diabetesHtnAngina: selVal('ts-hist'), sbpLow: selVal('ts-sbp'), hrHigh: selVal('ts-hr'),
        killip24: selVal('ts-killip'), weightLow: selVal('ts-weight'),
        anteriorSteLbbb: selVal('ts-ste'), timeOver4h: selVal('ts-time'),
      });
      resultRow(o, [
        { text: r.band, cls: r.total >= 5 ? 'warn' : null },
        { label: 'Total score', value: `${r.total} of 14` },
        { label: '30-day mortality (Morrow)', value: `${fmt(r.mortality, { fallback: '--' })}%` },
        ...(r.ageProvided ? [] : [{ label: 'Age', value: 'left blank (0 age points)' }]),
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 duke-treadmill ----------------------------------------------
  'duke-treadmill'(root) {
    root.appendChild(field('Exercise time (min, Bruce protocol)', 'dt-time', { placeholder: 'e.g. 7' }));
    root.appendChild(field('Maximal ST-segment deviation (mm)', 'dt-st', { placeholder: 'e.g. 1' }));
    root.appendChild(selectField('Exercise angina index', 'dt-angina', [
      { value: '0', text: '0 — no angina' },
      { value: '1', text: '1 — non-limiting angina' },
      { value: '2', text: '2 — exercise-limiting angina' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['dt-time', 'dt-st', 'dt-angina'], () => safe(o, () => {
      const r = M.dukeTreadmill({
        exerciseTime: optNum('dt-time'), stDeviation: optNum('dt-st'),
        anginaIndex: Number(selVal('dt-angina')),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.risk === 'high' ? 'warn' : null },
        { label: 'Duke treadmill score', value: fmt(r.score, { fallback: '--' }) },
        { label: 'Risk band', value: r.risk },
        { label: 'Cited 5-year survival', value: `${r.survival}%` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 cardiac-power-output ----------------------------------------
  'cardiac-power-output'(root) {
    root.appendChild(field('Mean arterial pressure (mmHg)', 'cp-map', { placeholder: 'e.g. 80' }));
    root.appendChild(field('Cardiac output (L/min)', 'cp-co', { placeholder: 'e.g. 5' }));
    const o = out(); root.appendChild(o);
    wire(['cp-map', 'cp-co'], () => safe(o, () => {
      const r = M.cardiacPowerOutput({ map: optNum('cp-map'), co: optNum('cp-co') });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.belowThreshold ? 'warn' : null },
        { label: 'Cardiac power output', value: `${fmt(r.cpo, { fallback: '--' })} W` },
        { label: '< 0.6 W cardiogenic-shock threshold', value: r.belowThreshold ? 'below threshold' : 'above threshold' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 aortic-valve-area -------------------------------------------
  'aortic-valve-area'(root) {
    root.appendChild(field('LVOT diameter (cm)', 'av-d', { placeholder: 'e.g. 2.0' }));
    root.appendChild(field('LVOT VTI (cm)', 'av-lvti', { placeholder: 'e.g. 20' }));
    root.appendChild(field('Aortic-valve VTI (cm)', 'av-avti', { placeholder: 'e.g. 100' }));
    const o = out(); root.appendChild(o);
    wire(['av-d', 'av-lvti', 'av-avti'], () => safe(o, () => {
      const r = M.aorticValveArea({
        lvotDiameter: optNum('av-d'), lvotVti: optNum('av-lvti'), avVti: optNum('av-avti'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.severity === 'severe' ? 'warn' : null },
        { label: 'Aortic valve area', value: `${fmt(r.ava, { fallback: '--' })} cm²` },
        { label: 'Dimensionless index', value: fmt(r.di, { fallback: '--' }) },
        { label: 'Severity', value: r.severityLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
