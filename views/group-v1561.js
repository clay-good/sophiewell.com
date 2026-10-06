// spec-v1561: renderers for leprosy-classify-mdt (Group J); leprosy-pep-rifampicin (Group J); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/leprosy-classify-mdt-v1561.js';
import * as M1 from '../lib/leprosy-pep-rifampicin-v1561.js';
import * as M2 from '../lib/buruli-ulcer-category-v1561.js';
import * as M3 from '../lib/yaws-test-and-treat-v1561.js';
import * as M4 from '../lib/leprosy-reaction-prednisolone-v1561.js';
import * as M5 from '../lib/leprosy-disability-grade-v1561.js';
import * as M6 from '../lib/scabies-diagnosis-mda-v1561.js';
import * as M7 from '../lib/filarial-lymphedema-stage-v1561.js';
import * as M8 from '../lib/noma-stage-v1561.js';
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
  'leprosy-classify-mdt'(root) {
    const pairs = [['lep-lesions', 'lesions'], ['lep-nerve', 'nerve'], ['lep-smear', 'smear'], ['lep-age', 'age'], ['lep-weight', 'weight']];
    numField(root, 'Number of skin lesions', 'lep-lesions', 'e.g. 3', '100');
    selectField(root, 'Nerve involvement', 'lep-nerve', M0.NERVE_OPTIONS, false);
    selectField(root, 'Skin smear', 'lep-smear', M0.SMEAR_OPTIONS, false);
    numField(root, 'Age in years', 'lep-age', 'e.g. 30', '120');
    numField(root, 'Weight in kg (needed under 10 years or under 40 kg)', 'lep-weight', 'e.g. 30', '250');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.leprosyClassifyMdt(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2018', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'leprosy-pep-rifampicin'(root) {
    const pairs = [['sdr-age', 'age'], ['sdr-weight', 'weight']];
    numField(root, 'Age in years', 'sdr-age', 'e.g. 7', '120');
    numField(root, 'Weight in kg', 'sdr-weight', 'e.g. 22', '250');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.leprosyPepRifampicin(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2018', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'buruli-ulcer-category'(root) {
    const pairs = [['bu-lesions', 'lesions'], ['bu-diam', 'diameter'], ['bu-critical', 'critical'], ['bu-bone', 'bone'], ['bu-weight', 'weight'], ['bu-preg', 'pregnant'], ['bu-efv', 'efavirenz']];
    numField(root, 'Number of lesions', 'bu-lesions', 'e.g. 1', '50');
    numField(root, 'Largest lesion diameter in cm', 'bu-diam', 'e.g. 8', '100');
    selectField(root, 'At a critical site (eye, breast, genitals, head and neck)', 'bu-critical', M2.YES_NO, false);
    selectField(root, 'Bone or joint involvement', 'bu-bone', M2.YES_NO, false);
    numField(root, 'Weight in kg', 'bu-weight', 'e.g. 30', '250');
    selectField(root, 'Pregnant', 'bu-preg', M2.YES_NO, false);
    selectField(root, 'On efavirenz', 'bu-efv', M2.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M2.buruliUlcerCategory(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'yaws-test-and-treat'(root) {
    const pairs = [['yw-age', 'age'], ['yw-weight', 'weight'], ['yw-endemic', 'endemic'], ['yw-lesion', 'lesion'], ['yw-rdtc', 'rdtC'], ['yw-rdtt', 'rdtT'], ['yw-dppc', 'dppC'], ['yw-dppt', 'dppT'], ['yw-dppnt', 'dppNT'], ['yw-pcr', 'pcr']];
    numField(root, 'Age in years', 'yw-age', 'e.g. 8', '120');
    numField(root, 'Weight in kg (for 30 mg/kg)', 'yw-weight', 'e.g. 25', '250');
    selectField(root, 'Lives or lived where yaws is or was endemic', 'yw-endemic', M3.YES_NO, true);
    selectField(root, 'Yaws-like skin lesion', 'yw-lesion', M3.YES_NO, true);
    selectField(root, 'Rapid test: control line visible', 'yw-rdtc', M3.YES_NO, false);
    selectField(root, 'Rapid test: treponemal line visible', 'yw-rdtt', M3.YES_NO, false);
    selectField(root, 'DPP: control line visible', 'yw-dppc', M3.YES_NO, false);
    selectField(root, 'DPP: treponemal (T) line visible', 'yw-dppt', M3.YES_NO, false);
    selectField(root, 'DPP: non-treponemal line visible', 'yw-dppnt', M3.YES_NO, false);
    selectField(root, 'PCR', 'yw-pcr', M3.PCR_OPTIONS, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M3.yawsTestAndTreat(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'leprosy-reaction-prednisolone'(root) {
    const pairs = [['lr-weight', 'weight'], ['lr-track', 'track'], ['lr-week', 'week']];
    numField(root, 'Weight in kg', 'lr-weight', 'e.g. 60', '250');
    selectField(root, 'Starting dose (optional)', 'lr-track', M4.TRACK_OPTIONS, false);
    numField(root, 'Week of treatment now (optional)', 'lr-week', 'e.g. 6', '20');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M4.leprosyReactionPrednisolone(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2020', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'leprosy-disability-grade'(root) {
    const pairs = [['ld-eyer', 'eyeR'], ['ld-eyel', 'eyeL'], ['ld-handr', 'handR'], ['ld-handl', 'handL'], ['ld-footr', 'footR'], ['ld-footl', 'footL']];
    selectField(root, 'Right eye', 'ld-eyer', M5.EYE_OPTIONS, false);
    selectField(root, 'Left eye', 'ld-eyel', M5.EYE_OPTIONS, false);
    selectField(root, 'Right hand', 'ld-handr', M5.LIMB_OPTIONS, false);
    selectField(root, 'Left hand', 'ld-handl', M5.LIMB_OPTIONS, false);
    selectField(root, 'Right foot', 'ld-footr', M5.LIMB_OPTIONS, false);
    selectField(root, 'Left foot', 'ld-footl', M5.LIMB_OPTIONS, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M5.leprosyDisabilityGrade(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2009', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'scabies-diagnosis-mda'(root) {
    const pairs = [['sc-micro', 'micro'], ['sc-burrows', 'burrows'], ['sc-genital', 'genital'], ['sc-lesions', 'lesions'], ['sc-itch', 'itch'], ['sc-contact', 'contact'], ['sc-other', 'otherLess'], ['sc-prev', 'prevalence'], ['sc-weight', 'weight'], ['sc-preg', 'pregnant'], ['sc-pp', 'postpartum'], ['sc-warf', 'warfarin'], ['sc-ill', 'ill']];
    selectField(root, 'Mites, eggs or feces seen (microscopy, imaging or dermoscopy)', 'sc-micro', M6.YES_NO, false);
    selectField(root, 'Burrows', 'sc-burrows', M6.YES_NO, false);
    selectField(root, 'Typical lesions on the male genitals', 'sc-genital', M6.YES_NO, false);
    selectField(root, 'Lesions', 'sc-lesions', M6.LESION_OPTIONS, false);
    selectField(root, 'Itch', 'sc-itch', M6.YES_NO, false);
    selectField(root, 'A contact with itch', 'sc-contact', M6.YES_NO, false);
    selectField(root, 'Other diagnoses less likely than scabies', 'sc-other', M6.YES_NO, false);
    numField(root, 'Community prevalence, % (optional)', 'sc-prev', 'e.g. 15', '100');
    numField(root, 'Weight in kg (for ivermectin)', 'sc-weight', 'e.g. 40', '250');
    selectField(root, 'Pregnant', 'sc-preg', M6.YES_NO, false);
    selectField(root, 'Gave birth in the last week', 'sc-pp', M6.YES_NO, false);
    selectField(root, 'On warfarin', 'sc-warf', M6.YES_NO, false);
    selectField(root, 'Severely ill', 'sc-ill', M6.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M6.scabiesDiagnosisMda(args);
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
  'filarial-lymphedema-stage'(root) {
    const pairs = [['fl-attack', 'attack'], ['fl-rev', 'reversible'], ['fl-folds', 'folds'], ['fl-knobs', 'knobs'], ['fl-mossy', 'mossy'], ['fl-daily', 'daily']];
    selectField(root, 'Acute attack in the last 30 days', 'fl-attack', M7.YES_NO, true);
    selectField(root, 'Swelling goes down overnight', 'fl-rev', M7.YES_NO, true);
    selectField(root, 'Skin folds', 'fl-folds', M7.FOLD_OPTIONS, false);
    selectField(root, 'Knobs (bumps or lumps on the skin)', 'fl-knobs', M7.YES_NO, false);
    selectField(root, 'Mossy foot', 'fl-mossy', M7.YES_NO, false);
    selectField(root, 'Unable to do daily activities without help', 'fl-daily', M7.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M7.filarialLymphedemaStage(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Dreyer', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'noma-stage'(root) {
    const pairs = [['nm-ging', 'gingivitis'], ['nm-ang', 'ang'], ['nm-edema', 'edema'], ['nm-gang', 'gangrene'], ['nm-scar', 'scarring'], ['nm-seq', 'sequelae']];
    selectField(root, 'Gums bleed when touched, red and swollen', 'nm-ging', M8.YES_NO, false);
    selectField(root, 'Spontaneous gum bleeding, painful ulcerated papillae, fetid breath', 'nm-ang', M8.YES_NO, false);
    selectField(root, 'Facial swelling with a painful cheek and fever', 'nm-edema', M8.YES_NO, false);
    selectField(root, 'Black necrotic area or a hole in the cheek or lips', 'nm-gang', M8.YES_NO, false);
    selectField(root, 'Acute phase over: trismus, loose teeth, exposed bone, scarring', 'nm-scar', M8.YES_NO, false);
    selectField(root, 'Established disfigurement', 'nm-seq', M8.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M8.nomaStage(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO AFRO', value: r.bandLabel }]);
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
