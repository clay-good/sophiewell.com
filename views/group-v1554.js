// spec-v1554: renderers for who-cotrimoxazole (Group J); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/who-cotrimoxazole-v1554.js';
import * as M1 from '../lib/who-hiv-staging-v1554.js';
import * as M2 from '../lib/who-advanced-hiv-v1554.js';
import * as M3 from '../lib/crag-screen-fluconazole-v1554.js';
import * as M4 from '../lib/infant-hiv-test-schedule-v1554.js';
import * as M5 from '../lib/infant-arv-prophylaxis-v1554.js';
import * as M6 from '../lib/who-pediatric-arv-dose-v1554.js';
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
  'who-cotrimoxazole'(root) {
    const pairs = [['ctx-group', 'group'], ['ctx-weight', 'weight'], ['ctx-prev', 'highPrevalence'], ['ctx-tb', 'tb'], ['ctx-stage', 'advanced'], ['ctx-cd4', 'cd4']];
    selectField(root, 'Who it is for', 'ctx-group', M0.GROUP_OPTIONS, true);
    numField(root, 'Weight in kg (infants and children)', 'ctx-weight', 'e.g. 12', '150');
    selectField(root, 'High malaria or bacterial-infection setting (adults)', 'ctx-prev', M0.YES_NO, false);
    selectField(root, 'Active TB (adults)', 'ctx-tb', M0.YES_NO, false);
    selectField(root, 'WHO stage 3 or 4 (adults)', 'ctx-stage', M0.YES_NO, false);
    numField(root, 'CD4 count, cells/mm³ (adults)', 'ctx-cd4', 'e.g. 300', '3000');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.whoCotrimoxazole(args);
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
  'who-hiv-staging'(root) {
    const pairs = [['hs-age', 'ageGroup'], ['hs-s4', 's4'], ['hs-s3', 's3'], ['hs-s2', 's2']];
    selectField(root, 'Age group', 'hs-age', M1.AGE_OPTIONS, true);
    selectField(root, 'Stage 4 condition present', 'hs-s4', M1.STAGE4_OPTIONS, false);
    selectField(root, 'Stage 3 condition present', 'hs-s3', M1.STAGE3_OPTIONS, false);
    selectField(root, 'Stage 2 condition present', 'hs-s2', M1.STAGE2_OPTIONS, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.whoHivStaging(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO stage', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'who-advanced-hiv'(root) {
    const pairs = [['ah-age', 'age'], ['ah-cd4', 'cd4'], ['ah-stage', 'stage'], ['ah-stable', 'stable']];
    numField(root, 'Age in years', 'ah-age', 'e.g. 35', '120');
    numField(root, 'CD4 count, cells/mm³ (leave blank if not available)', 'ah-cd4', 'e.g. 150', '5000');
    selectField(root, 'WHO clinical stage (used when there is no CD4)', 'ah-stage', M2.STAGE_OPTIONS, false);
    selectField(root, 'Under 5: on ART more than a year and clinically stable', 'ah-stable', M2.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M2.whoAdvancedHiv(args);
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
  'crag-screen-fluconazole'(root) {
    const pairs = [['cg-age', 'age'], ['cg-cd4', 'cd4'], ['cg-crag', 'crag'], ['cg-men', 'meningitis'], ['cg-weight', 'weight']];
    numField(root, 'Age in years', 'cg-age', 'e.g. 16', '120');
    numField(root, 'CD4 count, cells/mm³', 'cg-cd4', 'e.g. 80', '5000');
    selectField(root, 'Cryptococcal antigen result', 'cg-crag', M3.CRAG_OPTIONS, false);
    selectField(root, 'Signs or symptoms of meningitis', 'cg-men', M3.YES_NO, false);
    numField(root, 'Weight in kg (adolescents 10-19)', 'cg-weight', 'e.g. 45', '150');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M3.cragScreenFluconazole(args);
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
  'infant-hiv-test-schedule'(root) {
    const pairs = [['ih-age', 'age'], ['ih-feeding', 'feeding'], ['ih-stopped', 'stoppedAt'], ['ih-nat6', 'nat6'], ['ih-nat9', 'nat9']];
    numField(root, 'Infant age in weeks', 'ih-age', 'e.g. 20', '260');
    selectField(root, 'Breastfeeding', 'ih-feeding', M4.FEEDING_OPTIONS, true);
    numField(root, 'Age in weeks when breastfeeding stopped', 'ih-stopped', 'e.g. 30', '260');
    selectField(root, 'NAT at 4-6 weeks', 'ih-nat6', M4.RESULT_OPTIONS, true);
    selectField(root, 'NAT at 9 months', 'ih-nat9', M4.RESULT_OPTIONS, true);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M4.infantHivTestSchedule(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Next test', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'infant-arv-prophylaxis'(root) {
    const pairs = [['iap-art', 'art'], ['iap-vl', 'vl'], ['iap-inc', 'incident'], ['iap-pp', 'postpartum'], ['iap-bf', 'breastfeeding'], ['iap-age', 'age'], ['iap-weight', 'weight']];
    selectField(root, 'Mother\'s ART at delivery', 'iap-art', M5.ART_OPTIONS, true);
    selectField(root, 'Mother\'s viral load in the 4 weeks before delivery', 'iap-vl', M5.VL_OPTIONS, false);
    selectField(root, 'Mother acquired HIV in pregnancy or breastfeeding', 'iap-inc', M5.YES_NO, true);
    selectField(root, 'Mother first identified with HIV after delivery', 'iap-pp', M5.YES_NO, true);
    selectField(root, 'Breastfeeding', 'iap-bf', M5.YES_NO, true);
    numField(root, 'Infant age in weeks', 'iap-age', 'e.g. 0', '104');
    numField(root, 'Infant weight in kg (for alternatives)', 'iap-weight', 'e.g. 3.2', '25');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M5.infantArvProphylaxis(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2025-26', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'who-pediatric-arv-dose'(root) {
    const pairs = [['pad-drug', 'drug'], ['pad-weight', 'weight'], ['pad-age', 'age'], ['pad-rif', 'rif']];
    selectField(root, 'Formulation', 'pad-drug', M6.DRUG_OPTIONS, true);
    numField(root, 'Weight in kg', 'pad-weight', 'e.g. 12', '35');
    numField(root, 'Age in weeks', 'pad-age', 'e.g. 52', '1000');
    selectField(root, 'On rifampicin', 'pad-rif', M6.YES_NO, true);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M6.whoPediatricArvDose(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2026', value: r.bandLabel }]);
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
