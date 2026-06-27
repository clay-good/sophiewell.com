// spec-v158 §2: renderers for the five echocardiography quantification tiles of
// the spec-v157 Subspecialty Depth program — lvMassIndex (LV mass / LVMI /
// geometry), laVolumeIndex (LAVI), teichholzLvef (Teichholz LVEF / FS), rvspPasp
// (RVSP / PASP from the TR jet), and mitralEePrime (E/e′). All Clinical Math &
// Conversions (Group E).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each
// compute is closed-form arithmetic over finite-checked measurements; every
// division (LA length, the Teichholz 2.4+D, the e′ ratio) and the RVSP square is
// guarded in lib/echo-v158.js (a blank / non-finite / zero-denominator input
// renders a surfaced complete-the-fields fallback, never NaN / Infinity).
// Per the spec-v50 §3 posture note each tile defers the management decision to
// the clinician (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/echo-v158.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
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
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}
function num(label, id) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal' });
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The value and its interpretation are the cited guideline’s, computed from the measurements you enter; image quality, loading conditions, and acquisition angle apply. The management decision stays with the reading clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SEX_OPTS = [
  { value: 'male', text: 'Male' },
  { value: 'female', text: 'Female' },
];
const RAP_OPTS = [
  { value: '3', text: 'Small / collapsing IVC (3 mmHg)' },
  { value: '8', text: 'Intermediate (8 mmHg)' },
  { value: '15', text: 'Dilated / non-collapsing IVC (15 mmHg)' },
];
const EE_SITE_OPTS = [
  { value: 'septal', text: 'Septal e′' },
  { value: 'lateral', text: 'Lateral e′' },
  { value: 'average', text: 'Average (septal + lateral)/2' },
];

export const renderers = {
  // ----- 2.1 lv-mass-index ---------------------------------------------------
  'lv-mass-index'(root) {
    note(root, 'LV mass (Devereux 1986) with the ASE/EACVI (Lang 2015) geometry partitions. LV mass = 0.8·{1.04·[(LVIDd + PWTd + IVSd)³ − LVIDd³]} + 0.6; LVMI = mass/BSA; RWT = 2·PWTd/LVIDd. Geometry combines RWT 0.42 with the sex-specific LVMI limit (men > 115, women > 95 g/m²). Near-neighbors: aortic-valve-area, lvh-criteria, bw-bsa-suite.');
    root.appendChild(num('LV internal diameter, end-diastole LVIDd (cm)', 'lvmi-lvidd'));
    root.appendChild(num('Posterior-wall thickness, diastole PWTd (cm)', 'lvmi-pwtd'));
    root.appendChild(num('Septal-wall thickness, diastole IVSd (cm)', 'lvmi-ivsd'));
    root.appendChild(num('Body surface area BSA (m²)', 'lvmi-bsa'));
    root.appendChild(pickField('Sex', 'lvmi-sex', SEX_OPTS));
    const o = out(); root.appendChild(o);
    wire(['lvmi-lvidd', 'lvmi-pwtd', 'lvmi-ivsd', 'lvmi-bsa', 'lvmi-sex'], () => safe(o, () => {
      const r = M.lvMassIndex({ lvidd: val('lvmi-lvidd'), pwtd: val('lvmi-pwtd'), ivsd: val('lvmi-ivsd'), bsa: val('lvmi-bsa'), sex: val('lvmi-sex') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'LV mass', value: `${r.mass} g` },
        { label: 'LVMI', value: `${r.lvmi} g/m²` },
        { label: 'RWT', value: `${r.rwt}` },
        { label: 'Geometry', value: r.pattern },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 la-volume-index -------------------------------------------------
  'la-volume-index'(root) {
    note(root, 'Left-atrial volume index (Lang 2015), biplane area-length: LA volume = 0.85·(A1·A2)/L, where A1 = A4C LA area, A2 = A2C LA area, L = the shorter LA length; LAVI = volume/BSA. Bands (mL/m²): normal ≤ 34, mild 35–41, moderate 42–48, severe > 48. Near-neighbors: aortic-valve-area, mitral-e-e-prime.');
    root.appendChild(num('Apical 4-chamber LA area A1 (cm²)', 'lavi-a1'));
    root.appendChild(num('Apical 2-chamber LA area A2 (cm²)', 'lavi-a2'));
    root.appendChild(num('LA length L — the shorter of the two (cm)', 'lavi-l'));
    root.appendChild(num('Body surface area BSA (m²)', 'lavi-bsa'));
    const o = out(); root.appendChild(o);
    wire(['lavi-a1', 'lavi-a2', 'lavi-l', 'lavi-bsa'], () => safe(o, () => {
      const r = M.laVolumeIndex({ a1: val('lavi-a1'), a2: val('lavi-a2'), l: val('lavi-l'), bsa: val('lavi-bsa') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'LA volume', value: `${r.volume} mL` },
        { label: 'LAVI', value: `${r.lavi} mL/m²` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 teichholz-lvef --------------------------------------------------
  'teichholz-lvef'(root) {
    note(root, 'Teichholz LVEF & fractional shortening (Teichholz 1976; ASE 2015 bands). V = 7·D³/(2.4 + D); EDV uses LVIDd, ESV uses LVIDs; LVEF = (EDV − ESV)/EDV; FS = (LVIDd − LVIDs)/LVIDd. Dimension-derived — biplane Simpson is preferred when wall motion is regional. Near-neighbors: la-volume-index, mitral-e-e-prime.');
    root.appendChild(num('LV internal diameter, end-diastole LVIDd (cm)', 'teich-lvidd'));
    root.appendChild(num('LV internal diameter, end-systole LVIDs (cm)', 'teich-lvids'));
    root.appendChild(pickField('Sex', 'teich-sex', SEX_OPTS));
    const o = out(); root.appendChild(o);
    wire(['teich-lvidd', 'teich-lvids', 'teich-sex'], () => safe(o, () => {
      const r = M.teichholzLvef({ lvidd: val('teich-lvidd'), lvids: val('teich-lvids'), sex: val('teich-sex') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'LVEF', value: `${r.ef} %` },
        { label: 'FS', value: `${r.fs} %` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 rvsp-pasp -------------------------------------------------------
  'rvsp-pasp'(root) {
    note(root, 'RV systolic pressure / PASP from the tricuspid-regurgitation jet (Yock 1984): RVSP = 4·(TR Vmax)² + RAP (simplified Bernoulli). Equals PASP absent pulmonic stenosis / RVOT obstruction. RAP from the IVC: small/collapsing 3, intermediate 8, dilated/non-collapsing 15 mmHg. Near-neighbors: ivc-fluid-responsiveness, mitral-e-e-prime.');
    root.appendChild(num('Peak TR jet velocity Vmax (m/s)', 'rvsp-vmax'));
    root.appendChild(pickField('Estimated right-atrial pressure (from IVC)', 'rvsp-rap', RAP_OPTS));
    const o = out(); root.appendChild(o);
    wire(['rvsp-vmax', 'rvsp-rap'], () => safe(o, () => {
      const r = M.rvspPasp({ trVmax: val('rvsp-vmax'), rap: val('rvsp-rap') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'RVSP / PASP', value: `${r.rvsp} mmHg` },
        { label: 'RAP', value: `${r.rap} mmHg` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 mitral-e-e-prime ------------------------------------------------
  'mitral-e-e-prime'(root) {
    note(root, 'E/e′, the LV filling-pressure estimate (Nagueh 2016): E/e′ = mitral E (cm/s) ÷ tissue-Doppler e′ (cm/s). Average E/e′: < 9 normal, 9–14 indeterminate, > 14 elevated. Single-site: septal > 15, lateral > 13 elevated. Near-neighbors: la-volume-index, rvsp-pasp.');
    root.appendChild(num('Mitral-inflow early-diastolic velocity E (cm/s)', 'ee-e'));
    root.appendChild(num('Tissue-Doppler e′ velocity (cm/s)', 'ee-eprime'));
    root.appendChild(pickField('e′ site', 'ee-site', EE_SITE_OPTS));
    const o = out(); root.appendChild(o);
    wire(['ee-e', 'ee-eprime', 'ee-site'], () => safe(o, () => {
      const r = M.mitralEePrime({ e: val('ee-e'), ePrime: val('ee-eprime'), site: val('ee-site') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'E/e′', value: `${r.ratio}` },
        { label: 'Site', value: r.site },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
