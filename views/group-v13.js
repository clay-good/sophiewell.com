// spec-v87 §2: renderers for the three critical-care physiology tiles
// (hemodynamic-suite, mechanical-power, dead-space).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Nullable numeric outputs route through fmt() so a guarded null never reaches
// the DOM as NaN/undefined (spec-v53 §3.2). Each tile renders the spec-v50 §3
// clinical posture note and quotes the cited source's own normal ranges / risk
// thresholds - none authors a management order in Sophie's voice (spec-v11
// §5.3).

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import * as H from '../lib/hemodynamics-v87.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not an order. The normal ranges and thresholds are the cited source’s; the diagnosis and the management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}
// Append " (low)"/" (high)" only for an out-of-range flag; normal/null stay clean.
function flagTag(f) { return f === 'low' ? ' (low)' : (f === 'high' ? ' (high)' : ''); }

export const renderers = {
  // ----- 2.1 hemodynamic-suite -------------------------------------------
  'hemodynamic-suite'(root) {
    root.appendChild(field('Cardiac output (L/min)', 'hs-co', { placeholder: 'e.g. 5' }));
    root.appendChild(field('Heart rate (bpm, for stroke volume)', 'hs-hr', { placeholder: 'e.g. 80' }));
    root.appendChild(field('Body surface area (m^2, for indexed values)', 'hs-bsa', { placeholder: 'e.g. 1.9' }));
    root.appendChild(field('Mean arterial pressure (mmHg, for SVR)', 'hs-map', { placeholder: 'e.g. 90' }));
    root.appendChild(field('Central venous pressure (mmHg, for SVR)', 'hs-cvp', { placeholder: 'e.g. 8' }));
    root.appendChild(field('Mean pulmonary artery pressure (mmHg, for PVR)', 'hs-mpap', { placeholder: 'e.g. 25' }));
    root.appendChild(field('Pulmonary capillary wedge pressure (mmHg, for PVR)', 'hs-pcwp', { placeholder: 'e.g. 12' }));
    const o = out(); root.appendChild(o);
    wire(['hs-co', 'hs-hr', 'hs-bsa', 'hs-map', 'hs-cvp', 'hs-mpap', 'hs-pcwp'], () => safe(o, () => {
      const r = H.hemodynamicSuite({
        cardiacOutput: optNum('hs-co'), heartRate: optNum('hs-hr'), bsa: optNum('hs-bsa'),
        map: optNum('hs-map'), cvp: optNum('hs-cvp'), mpap: optNum('hs-mpap'), pcwp: optNum('hs-pcwp'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { label: 'Cardiac index (CI)', value: `${fmt(r.ci, { fallback: '(enter BSA)' })}${flagTag(r.ciFlag)}`, units: 'L/min/m^2' },
        { label: 'Stroke volume (SV)', value: `${fmt(r.sv, { fallback: '(enter heart rate)' })}${flagTag(r.svFlag)}`, units: 'mL' },
        { label: 'Stroke volume index (SVI)', value: `${fmt(r.svi, { fallback: '(enter HR + BSA)' })}${flagTag(r.sviFlag)}`, units: 'mL/m^2' },
        { label: 'SVR', value: `${fmt(r.svr, { fallback: '(enter MAP + CVP)' })}${flagTag(r.svrFlag)}`, units: 'dynes·s·cm^-5' },
        { label: 'SVRI', value: fmt(r.svri, { fallback: '(enter MAP + CVP + BSA)' }), units: 'dynes·s·cm^-5·m^2' },
        { label: 'PVR', value: `${fmt(r.pvr, { fallback: '(enter mPAP + PCWP)' })}${flagTag(r.pvrFlag)}`, units: 'dynes·s·cm^-5' },
        { label: 'PVR (Wood units)', value: fmt(r.pvrWood, { fallback: '(enter mPAP + PCWP)' }), units: 'WU' },
        { label: 'PVRI', value: fmt(r.pvri, { fallback: '(enter mPAP + PCWP + BSA)' }), units: 'dynes·s·cm^-5·m^2' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 mechanical-power --------------------------------------------
  'mechanical-power'(root) {
    root.appendChild(field('Respiratory rate (breaths/min)', 'mp-rr', { placeholder: 'e.g. 22' }));
    root.appendChild(field('Tidal volume (mL)', 'mp-vt', { placeholder: 'e.g. 420' }));
    root.appendChild(field('Plateau pressure (cmH2O)', 'mp-plat', { placeholder: 'e.g. 26' }));
    root.appendChild(field('PEEP (cmH2O)', 'mp-peep', { placeholder: 'e.g. 12' }));
    root.appendChild(field('Peak pressure (cmH2O)', 'mp-peak', { placeholder: 'e.g. 32' }));
    const o = out(); root.appendChild(o);
    wire(['mp-rr', 'mp-vt', 'mp-plat', 'mp-peep', 'mp-peak'], () => safe(o, () => {
      const r = H.mechanicalPower({
        respiratoryRate: optNum('mp-rr'), tidalVolume: optNum('mp-vt'),
        plateau: optNum('mp-plat'), peep: optNum('mp-peep'), peak: optNum('mp-peak'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { label: 'Mechanical power', value: fmt(r.mechanicalPower, { fallback: '--' }), units: 'J/min' },
        { label: 'Driving pressure (Pplat − PEEP)', value: fmt(r.drivingPressure, { fallback: '--' }), units: 'cmH2O' },
        { text: r.band, cls: r.highRisk ? 'warn' : null },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 dead-space --------------------------------------------------
  'dead-space'(root) {
    root.appendChild(field('Arterial PaCO2 (mmHg)', 'ds-paco2', { placeholder: 'e.g. 50' }));
    root.appendChild(selectField('Expired CO2 source', 'ds-source', [
      { value: 'peco2', text: 'Mixed-expired PĒCO2 (volumetric capnography)' },
      { value: 'etco2', text: 'End-tidal EtCO2 (bedside surrogate)' },
    ]));
    root.appendChild(field('Expired CO2 value (mmHg)', 'ds-eco2', { placeholder: 'e.g. 28' }));
    const o = out(); root.appendChild(o);
    wire(['ds-paco2', 'ds-source', 'ds-eco2'], () => safe(o, () => {
      const r = H.deadSpace({ paco2: optNum('ds-paco2'), expiredCo2: optNum('ds-eco2'), source: selVal('ds-source') });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { label: 'Dead-space fraction (Vd/Vt)', value: fmt(r.ratio, { fallback: '--' }) },
        { label: 'As a percentage', value: fmt(r.ratioPercent, { fallback: '--' }), units: '%' },
        { text: r.band, cls: (r.elevated || r.implausible) ? 'warn' : null },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
