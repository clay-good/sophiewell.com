// spec-v1563: renderer for dengue-fluid-plan (the WHO dengue IV fluid ladder; Group F); spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as D from '../lib/dengue-fluid-plan-v1563.js';
import * as M0 from '../lib/hat-treatment-v1563.js';
import * as M1 from '../lib/arbovirus-admission-check-v1563.js';
import * as M2 from '../lib/chikungunya-case-def-v1563.js';
import * as M3 from '../lib/zika-case-def-v1563.js';
import * as M4 from '../lib/yellow-fever-case-def-v1563.js';
import * as M5 from '../lib/visceral-leishmaniasis-2026-v1563.js';
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
  'dengue-fluid-plan'(root) {
    const pairs = [['df-group', 'group'], ['df-age', 'ageGroup'], ['df-weight', 'weight']];
    selectField(root, 'Group', 'df-group', D.GROUP_OPTIONS, true);
    selectField(root, 'Adult or infant/child', 'df-age', D.AGE_OPTIONS, true);
    numField(root, 'Weight in kg (ideal body weight if obese)', 'df-weight', 'e.g. 20', '250');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = D.dengueFluidPlan(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2012', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'hat-treatment'(root) {
    const pairs = [['hat-form', 'form'], ['hat-age', 'age'], ['hat-weight', 'weight'], ['hat-severe', 'severe'], ['hat-follow', 'followUp'], ['hat-lp', 'lp'], ['hat-wbc', 'csfWbc'], ['hat-tryp', 'trypCsf'], ['hat-preg', 'pregnant'], ['hat-swallow', 'swallow']];
    selectField(root, 'Form', 'hat-form', M0.FORM_OPTIONS, true);
    numField(root, 'Age in years', 'hat-age', 'e.g. 30', '120');
    numField(root, 'Weight in kg', 'hat-weight', 'e.g. 60', '250');
    selectField(root, 'Any sign suggesting severe disease (confusion, abnormal behavior, excessive talking, anxiety, poor coordination, tremor, weakness, speech or gait problems, abnormal movements, seizures)', 'hat-severe', M0.YES_NO, false);
    selectField(root, 'Reliable follow-up to detect relapse', 'hat-follow', M0.YES_NO, false);
    selectField(root, 'Lumbar puncture', 'hat-lp', M0.LP_OPTIONS, false);
    numField(root, 'CSF white cells per microL', 'hat-wbc', 'e.g. 20', '10000');
    selectField(root, 'Trypanosomes in the CSF', 'hat-tryp', M0.YES_NO, false);
    selectField(root, 'Pregnancy', 'hat-preg', M0.PREG_OPTIONS, false);
    selectField(root, 'Able to swallow and keep tablets down (rhodesiense)', 'hat-swallow', M0.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.hatTreatment(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2024', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'arbovirus-admission-check'(root) {
    const pairs = [['ab-disease', 'disease'], ['ab-abdo', 'abdo'], ['ab-sensory', 'sensory'], ['ab-mucosal', 'mucosal'], ['ab-liver', 'liver'], ['ab-vomit', 'vomit'], ['ab-hct', 'hct'], ['ab-severe', 'severe'], ['ab-oral', 'oral'], ['ab-breath', 'breath'], ['ab-pulse', 'pulse'], ['ab-hypo', 'hypo'], ['ab-renal', 'renal'], ['ab-crt', 'crt'], ['ab-preg', 'preg'], ['ab-coag', 'coag'], ['ab-risk', 'risk'], ['ab-weight', 'weight']];
    selectField(root, 'Disease', 'ab-disease', M1.DISEASE_OPTIONS, true);
    selectField(root, 'Abdominal pain, continuous or intense', 'ab-abdo', M1.YES_NO, false);
    selectField(root, 'Irritability, drowsiness or lethargy', 'ab-sensory', M1.YES_NO, false);
    selectField(root, 'Mucosal bleeding', 'ab-mucosal', M1.YES_NO, false);
    selectField(root, 'Liver more than 2 cm below the ribs', 'ab-liver', M1.YES_NO, false);
    selectField(root, 'Persistent vomiting (3 in 1 hour or 4 in 6 hours)', 'ab-vomit', M1.YES_NO, false);
    selectField(root, 'Hematocrit rising on 2 measurements in a row', 'ab-hct', M1.YES_NO, false);
    selectField(root, 'Severe dengue (WHO 2009)', 'ab-severe', M1.YES_NO, false);
    selectField(root, 'Unable to tolerate oral fluids', 'ab-oral', M1.YES_NO, false);
    selectField(root, 'Difficulty breathing', 'ab-breath', M1.YES_NO, false);
    selectField(root, 'Narrowing pulse pressure', 'ab-pulse', M1.YES_NO, false);
    selectField(root, 'Low blood pressure', 'ab-hypo', M1.YES_NO, false);
    selectField(root, 'Acute kidney failure', 'ab-renal', M1.YES_NO, false);
    selectField(root, 'Prolonged capillary refill', 'ab-crt', M1.YES_NO, false);
    selectField(root, 'Pregnancy', 'ab-preg', M1.YES_NO, false);
    selectField(root, 'Coagulopathy', 'ab-coag', M1.YES_NO, false);
    selectField(root, 'Extreme of age or a high-risk condition', 'ab-risk', M1.YES_NO, false);
    numField(root, 'Weight in kg (for the acetaminophen dose)', 'ab-weight', 'e.g. 20', '250');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.arbovirusAdmissionCheck(args);
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
  'chikungunya-case-def'(root) {
    const pairs = [['ck-fever', 'fever'], ['ck-joint', 'joint'], ['ck-epi', 'epi'], ['ck-lab', 'lab'], ['ck-atyp', 'atypical'], ['ck-severe', 'severe'], ['ck-chronic', 'chronic']];
    selectField(root, 'Fever over 38.5 °C', 'ck-fever', M2.YES_NO, false);
    selectField(root, 'Joint pain of acute onset', 'ck-joint', M2.YES_NO, false);
    selectField(root, 'Lives in or visited an area with local transmission in the last 15 days', 'ck-epi', M2.YES_NO, false);
    selectField(root, 'Positive PCR, serology or culture', 'ck-lab', M2.YES_NO, false);
    selectField(root, 'Other organ manifestations (neurological, heart, skin, eye, liver, kidney, lung, blood)', 'ck-atyp', M2.YES_NO, false);
    selectField(root, 'Life-threatening organ dysfunction needing hospitalization', 'ck-severe', M2.YES_NO, false);
    selectField(root, 'Previous diagnosis with joint symptoms beyond 12 weeks', 'ck-chronic', M2.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M2.chikungunyaCaseDef(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Case', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'zika-case-def'(root) {
    const pairs = [['zk-rash', 'rash'], ['zk-fever', 'fever'], ['zk-signs', 'signs'], ['zk-igm', 'igm'], ['zk-epi', 'epi'], ['zk-rna', 'rna'], ['zk-prnt', 'prnt']];
    selectField(root, 'Rash', 'zk-rash', M3.YES_NO, false);
    selectField(root, 'Fever', 'zk-fever', M3.YES_NO, false);
    selectField(root, 'Arthralgia, arthritis or non-purulent conjunctivitis', 'zk-signs', M3.YES_NO, false);
    selectField(root, 'Zika IgM positive (no evidence of other flaviviruses)', 'zk-igm', M3.YES_NO, false);
    selectField(root, 'Epidemiological link (confirmed contact, or local transmission area within 2 weeks)', 'zk-epi', M3.YES_NO, false);
    selectField(root, 'Zika RNA or antigen detected', 'zk-rna', M3.YES_NO, false);
    selectField(root, 'IgM with PRNT90 titer 20 or more, 4 times other flaviviruses, others excluded', 'zk-prnt', M3.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M3.zikaCaseDef(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Case', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'yellow-fever-case-def'(root) {
    const pairs = [['yfd-fever', 'fever'], ['yfd-jaund', 'jaundice'], ['yfd-vac', 'vaccine'], ['yfd-igm', 'igm'], ['yfd-histo', 'histo'], ['yfd-epi', 'epi'], ['yfd-sero', 'serology'], ['yfd-viro', 'virology']];
    selectField(root, 'Acute onset of fever', 'yfd-fever', M4.YES_NO, true);
    selectField(root, 'Jaundice within 14 days of the first symptoms', 'yfd-jaund', M4.YES_NO, true);
    selectField(root, 'Yellow fever vaccination before onset', 'yfd-vac', M4.VACCINE_OPTIONS, false);
    selectField(root, 'Yellow fever IgM positive', 'yfd-igm', M4.YES_NO, false);
    selectField(root, 'Positive postmortem liver histopathology', 'yfd-histo', M4.YES_NO, false);
    selectField(root, 'Epidemiological link to a confirmed case or outbreak', 'yfd-epi', M4.YES_NO, false);
    selectField(root, 'Specific IgM, fourfold antibody rise, or specific neutralizing antibodies', 'yfd-sero', M4.YES_NO, false);
    selectField(root, 'Virus genome by PCR, antigen, or isolation', 'yfd-viro', M4.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M4.yellowFeverCaseDef(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Case', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'visceral-leishmaniasis-2026'(root) {
    const pairs = [['vl-region', 'region'], ['vl-ind', 'indication'], ['vl-weight', 'weight'], ['vl-age', 'age'], ['vl-preg', 'pregnant'], ['vl-contra', 'contraception'], ['vl-excl', 'exclusion'], ['vl-mal', 'malnourished'], ['vl-hiv', 'hiv']];
    selectField(root, 'Region', 'vl-region', M5.REGION_OPTIONS, true);
    selectField(root, 'Indication', 'vl-ind', M5.INDICATION_OPTIONS, true);
    numField(root, 'Weight in kg', 'vl-weight', 'e.g. 20', '200');
    numField(root, 'Age in years', 'vl-age', 'e.g. 10', '100');
    selectField(root, 'Pregnant or breastfeeding', 'vl-preg', M5.YES_NO, false);
    selectField(root, 'Could become pregnant: reliable contraception assured', 'vl-contra', M5.YES_NO, false);
    selectField(root, 'Other exclusion (severe malnutrition, Hb under 5, severe VL, hearing loss, comorbidity, coinfection)', 'vl-excl', M5.YES_NO, false);
    selectField(root, 'Severely malnourished (PKDL)', 'vl-mal', M5.YES_NO, false);
    selectField(root, 'HIV coinfection', 'vl-hiv', M5.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M5.visceralLeishmaniasis2026(args);
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
