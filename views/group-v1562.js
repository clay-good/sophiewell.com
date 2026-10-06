// spec-v1562: renderer for pc-dose-pole (WHO mass drug administration doses by height or age; Group F); spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as D from '../lib/pc-dose-pole-v1562.js';
import * as M0 from '../lib/helminth-intensity-v1562.js';
import * as M1 from '../lib/schisto-community-treatment-v1562.js';
import * as M2 from '../lib/lf-mda-regimen-v1562.js';
import * as M3 from '../lib/cystic-echinococcosis-stage-v1562.js';
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
  'pc-dose-pole'(root) {
    const pairs = [['pc-drug', 'drug'], ['pc-height', 'height'], ['pc-age', 'age']];
    selectField(root, 'Drug', 'pc-drug', D.DRUG_OPTIONS, true);
    numField(root, 'Height in cm (praziquantel, ivermectin)', 'pc-height', 'e.g. 130', '230');
    numField(root, 'Age in years (albendazole, mebendazole, DEC)', 'pc-age', 'e.g. 8', '120');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = D.pcDosePole(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Dose', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'helminth-intensity'(root) {
    const pairs = [['hi-parasite', 'parasite'], ['hi-eggs', 'eggs'], ['hi-hematuria', 'hematuria']];
    selectField(root, 'Parasite', 'hi-parasite', M0.PARASITE_OPTIONS, true);
    numField(root, 'Eggs per gram of stool (or per 10 mL of urine for S. haematobium)', 'hi-eggs', 'e.g. 6000', '1000000');
    selectField(root, 'S. haematobium: visible blood in the urine', 'hi-hematuria', M0.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.helminthIntensity(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO class', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'schisto-community-treatment'(root) {
    const pairs = [['sct-prev', 'prevalence'], ['sct-method', 'method'], ['sct-prior', 'priorProgram'], ['sct-base', 'baseline'], ['sct-rounds', 'rounds']];
    numField(root, 'Community prevalence, %', 'sct-prev', 'e.g. 25', '100');
    selectField(root, 'Measured by', 'sct-method', M1.METHOD_OPTIONS, true);
    selectField(root, 'Regular preventive chemotherapy already given', 'sct-prior', M1.YES_NO, false);
    numField(root, 'Baseline prevalence before mass treatment, % (optional)', 'sct-base', 'e.g. 40', '100');
    selectField(root, 'Two yearly rounds given at 75% coverage or more', 'sct-rounds', M1.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.schistoCommunityTreatment(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2022', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'lf-mda-regimen'(root) {
    const pairs = [['lf-oncho', 'oncho'], ['lf-loa', 'loiasis'], ['lf-iver', 'ivermectinGiven'], ['lf-status', 'status'], ['lf-age', 'age'], ['lf-height', 'height'], ['lf-preg', 'pregnant'], ['lf-ill', 'ill'], ['lf-seiz', 'seizures']];
    selectField(root, 'Onchocerciasis endemic anywhere in the country', 'lf-oncho', M2.YES_NO, true);
    selectField(root, 'Loiasis co-endemic', 'lf-loa', M2.YES_NO, true);
    selectField(root, 'Ivermectin already distributed here (onchocerciasis or LF)', 'lf-iver', M2.YES_NO, false);
    selectField(root, 'Program status (no onchocerciasis or loiasis)', 'lf-status', M2.STATUS_OPTIONS, false);
    numField(root, 'Age in years', 'lf-age', 'e.g. 30', '120');
    numField(root, 'Height in cm', 'lf-height', 'e.g. 165', '230');
    selectField(root, 'Pregnancy', 'lf-preg', M2.PREG_OPTIONS, false);
    selectField(root, 'Severely ill', 'lf-ill', M2.YES_NO, false);
    selectField(root, 'History of seizures or neurocysticercosis', 'lf-seiz', M2.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M2.lfMdaRegimen(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2017', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'cystic-echinococcosis-stage'(root) {
    const pairs = [['ce-organ', 'organ'], ['ce-stage', 'stage'], ['ce-diam', 'diameter'], ['ce-comp', 'complicated'], ['ce-bil', 'biliary'], ['ce-mult', 'multiple'], ['ce-tier', 'tier'], ['ce-weight', 'weight']];
    selectField(root, 'Organ', 'ce-organ', M3.ORGAN_OPTIONS, true);
    selectField(root, 'Ultrasound stage', 'ce-stage', M3.STAGE_OPTIONS, true);
    numField(root, 'Largest cyst diameter in cm', 'ce-diam', 'e.g. 7', '50');
    selectField(root, 'Complicated (rupture, infection, fistula, compression)', 'ce-comp', M3.YES_NO, true);
    selectField(root, 'Communication with the bile ducts', 'ce-bil', M3.YES_NO, false);
    selectField(root, 'Multiple cysts, mixed stages, or several organs', 'ce-mult', M3.YES_NO, false);
    selectField(root, 'Facility tier', 'ce-tier', M3.TIER_OPTIONS, false);
    numField(root, 'Weight in kg (for albendazole)', 'ce-weight', 'e.g. 60', '250');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M3.cysticEchinococcosisStage(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2025', value: r.bandLabel }]);
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
