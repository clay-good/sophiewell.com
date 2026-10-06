// spec-v1555b: renderers for snake-antivenom-indication (Group I); snakebite-syndrome (Group I); antivenom-repeat (Group I); snake-neostigmine-trial (Group I); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/snake-antivenom-indication-v1555.js';
import * as M1 from '../lib/snakebite-syndrome-v1555.js';
import * as M2 from '../lib/antivenom-repeat-v1555.js';
import * as M3 from '../lib/snake-neostigmine-trial-v1555.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, required) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [{ value: '', text: required ? '— choose —' : '— not entered —' }, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, max) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', inputmode: 'decimal', min: '0', max, step: 'any', placeholder }));
  root.appendChild(wrap);
}
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}

export const renderers = {
  'snake-antivenom-indication'(root) {
    const pairs = [['ai-region', 'region'], ['ai-bleed', 'bleed'], ['ai-wbct', 'wbct'], ['ai-lab', 'lab'], ['ai-neuro', 'neuro'], ['ai-cardio', 'cardio'], ['ai-aki', 'aki'], ['ai-urine', 'urine'], ['ai-half', 'half'], ['ai-digit', 'digit'], ['ai-rapid', 'rapid'], ['ai-node', 'node'], ['ai-necrotic', 'necrotic'], ['ai-risk', 'risk']];
    selectField(root, 'Region', 'ai-region', M0.REGION_OPTIONS, true);
    selectField(root, 'Spontaneous bleeding away from the bite', 'ai-bleed', M0.YES_NO, false);
    selectField(root, '20WBCT', 'ai-wbct', M0.WBCT_OPTIONS, false);
    selectField(root, 'INR, prothrombin time or platelets (Asia)', 'ai-lab', M0.LAB_OPTIONS, false);
    selectField(root, 'Neurotoxic signs (drooping eyelids, eye movement paralysis, weakness)', 'ai-neuro', M0.YES_NO, false);
    selectField(root, 'Low blood pressure, shock, abnormal rhythm or ECG', 'ai-cardio', M0.YES_NO, false);
    selectField(root, 'Acute kidney injury (Asia)', 'ai-aki', M0.YES_NO, false);
    selectField(root, 'Dark brown urine (Asia)', 'ai-urine', M0.YES_NO, false);
    selectField(root, 'Swelling of more than half the bitten limb (within 48 hours, no tourniquet)', 'ai-half', M0.YES_NO, false);
    selectField(root, 'Bite on a finger or toe, with swelling', 'ai-digit', M0.YES_NO, false);
    selectField(root, 'Rapidly spreading swelling (past the wrist or ankle within hours)', 'ai-rapid', M0.YES_NO, false);
    selectField(root, 'Enlarged tender lymph node draining the limb (Asia)', 'ai-node', M0.YES_NO, false);
    selectField(root, 'Africa: species known to cause tissue death (Bitis, Echis, Cerastes, Macrovipera, spitting cobras)', 'ai-necrotic', M0.YES_NO, false);
    selectField(root, 'Previous reaction to horse or sheep serum, or severe allergy or asthma', 'ai-risk', M0.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.snakeAntivenomIndication(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO criteria', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'snakebite-syndrome'(root) {
    const pairs = [['ss-region', 'region'], ['ss-swelling', 'swelling'], ['ss-blood', 'blood'], ['ss-paralysis', 'paralysis'], ['ss-setting', 'setting'], ['ss-renal', 'renal'], ['ss-maluku', 'maluku']];
    selectField(root, 'Region', 'ss-region', M1.REGION_OPTIONS, true);
    selectField(root, 'Local swelling', 'ss-swelling', M1.SWELLING_OPTIONS, true);
    selectField(root, 'Blood', 'ss-blood', M1.BLOOD_OPTIONS, true);
    selectField(root, 'Paralysis (drooping eyelids, weakness)', 'ss-paralysis', M1.YES_NO, true);
    selectField(root, 'Asia: where the bite happened', 'ss-setting', M1.SETTING_OPTIONS, false);
    selectField(root, 'Asia: dark urine, shock or kidney injury', 'ss-renal', M1.YES_NO, false);
    selectField(root, 'Asia: bitten in Maluku or West Papua (Indonesia)', 'ss-maluku', M1.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.snakebiteSyndrome(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Syndrome', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'antivenom-repeat'(root) {
    const pairs = [['ar-protocol', 'protocol'], ['ar-regimen', 'regimen'], ['ar-dose', 'dose'], ['ar-hours', 'hours'], ['ar-wbct', 'wbct'], ['ar-bleeding', 'bleeding'], ['ar-neuro', 'neuro'], ['ar-vent', 'ventilated'], ['ar-given', 'given']];
    selectField(root, 'Protocol', 'ar-protocol', M2.PROTOCOL_OPTIONS, true);
    selectField(root, 'India regimen', 'ar-regimen', M2.REGIMEN_OPTIONS, false);
    numField(root, 'Initial dose in vials (product insert or national protocol; India mode sets its own)', 'ar-dose', 'e.g. 10', '100');
    numField(root, 'Hours since the initial dose ended', 'ar-hours', 'e.g. 6', '48');
    selectField(root, '20WBCT now', 'ar-wbct', M2.WBCT_OPTIONS, true);
    selectField(root, 'Still bleeding briskly', 'ar-bleeding', M2.YES_NO, true);
    selectField(root, 'Neurotoxic or cardiovascular signs', 'ar-neuro', M2.NEURO_OPTIONS, true);
    selectField(root, 'Paralyzed and on a ventilator', 'ar-vent', M2.YES_NO, true);
    numField(root, 'Vials given so far (checked against India\'s limits)', 'ar-given', 'e.g. 10', '200');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M2.antivenomRepeat(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Repeat', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'snake-neostigmine-trial'(root) {
    const pairs = [['nt-protocol', 'protocol'], ['nt-age', 'ageGroup'], ['nt-weight', 'weight'], ['nt-mamba', 'mamba'], ['nt-response', 'response'], ['nt-neo', 'neoConc'], ['nt-atr', 'atrConc']];
    selectField(root, 'Protocol', 'nt-protocol', M3.PROTOCOL_OPTIONS, true);
    selectField(root, 'Adult or child', 'nt-age', M3.AGE_OPTIONS, true);
    numField(root, 'Weight in kg', 'nt-weight', 'e.g. 60', '250');
    selectField(root, 'WHO: suspected mamba bite (Africa)', 'nt-mamba', M3.YES_NO, false);
    selectField(root, 'Response so far', 'nt-response', M3.RESPONSE_OPTIONS, true);
    numField(root, 'Neostigmine concentration, mg/mL (for doses in mL)', 'nt-neo', 'e.g. 0.5', '10');
    numField(root, 'Atropine concentration, mg/mL (for doses in mL)', 'nt-atr', 'e.g. 0.6', '10');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M3.snakeNeostigmineTrial(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Trial', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
};
