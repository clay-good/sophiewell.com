// spec-v837 §2: renderer for masld-criteria — the 2023 steatotic liver disease nomenclature
// (Clinical Scoring & Risk, Group G).
//
// Ancestry and sex are asked for because two of the five criteria are not one number: the BMI
// cut is ancestry-specific and the HDL cut is sex-specific. Waist thresholds vary by both.
//
// Alcohol is in grams per WEEK, matching the published bands. Asking for a daily figure would
// invite the reader to convert, and the daily numbers in circulation are approximations of
// the weekly ones rather than the definition.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/masld-criteria-v837.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
}
function selField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'masld-criteria'(root) {
    note(root, 'This is a positive diagnosis, not a diagnosis of exclusion. Drinking above the threshold does not remove it - it makes it MetALD, a category created in 2023.');

    root.appendChild(el('h2', { text: 'Entry finding' }));
    root.appendChild(checkField('Hepatic steatosis is present', 'masld-steatosis'));
    root.appendChild(checkField('A specific other cause of steatosis is identified, such as a drug or a monogenic disorder', 'masld-othercause'));

    root.appendChild(el('h2', { text: 'Thresholds that depend on the person' }));
    selField(root, 'Sex', 'masld-sex', [['female', 'Female (HDL cut 50)'], ['male', 'Male (HDL cut 40)']]);
    selField(root, 'Ancestry, for the BMI and waist cuts', 'masld-ancestry', [
      ['european', 'European or general (BMI cut 25)'],
      ['south-asian-chinese', 'South Asian or Chinese (BMI cut 23)'],
      ['japanese', 'Japanese (BMI cut 23)'],
    ]);

    root.appendChild(el('h2', { text: 'The five cardiometabolic criteria: any one suffices' }));
    numField(root, 'Body mass index', 'masld-bmi', { min: '0', max: '150', step: '0.1' });
    numField(root, 'Waist circumference, cm', 'masld-waist', { min: '0', max: '300', step: '0.1' });
    numField(root, 'Fasting glucose, mg per dL', 'masld-glucose', { min: '0', step: '1' });
    numField(root, 'HbA1c, percent', 'masld-hba1c', { min: '0', max: '30', step: '0.1' });
    root.appendChild(checkField('Type 2 diabetes, or treatment for it', 'masld-t2d'));
    numField(root, 'Systolic blood pressure, mmHg', 'masld-sbp', { min: '0', max: '300', step: '1' });
    numField(root, 'Diastolic blood pressure, mmHg', 'masld-dbp', { min: '0', max: '200', step: '1' });
    root.appendChild(checkField('Antihypertensive treatment', 'masld-antihtn'));
    numField(root, 'Triglycerides, mg per dL', 'masld-trig', { min: '0', step: '1' });
    numField(root, 'HDL cholesterol, mg per dL', 'masld-hdl', { min: '0', max: '500', step: '1' });
    root.appendChild(checkField('Lipid-lowering treatment', 'masld-lipid'));

    root.appendChild(el('h2', { text: 'Alcohol, in grams per week' }));
    numField(root, 'Alcohol, grams per week', 'masld-alcohol', { min: '0', max: '10000', step: '1' });

    const ids = ['masld-steatosis', 'masld-othercause', 'masld-sex', 'masld-ancestry', 'masld-bmi',
      'masld-waist', 'masld-glucose', 'masld-hba1c', 'masld-t2d', 'masld-sbp', 'masld-dbp',
      'masld-antihtn', 'masld-trig', 'masld-hdl', 'masld-lipid', 'masld-alcohol'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.masldCriteria({
        hepaticSteatosis: checked('masld-steatosis'),
        otherCause: checked('masld-othercause'),
        sex: val('masld-sex'),
        ancestry: val('masld-ancestry'),
        bmi: val('masld-bmi'),
        waistCm: val('masld-waist'),
        fastingGlucose: val('masld-glucose'),
        hba1c: val('masld-hba1c'),
        type2Diabetes: checked('masld-t2d'),
        systolic: val('masld-sbp'),
        diastolic: val('masld-dbp'),
        antihypertensive: checked('masld-antihtn'),
        triglycerides: val('masld-trig'),
        hdl: val('masld-hdl'),
        lipidLowering: checked('masld-lipid'),
        alcoholGramsPerWeek: val('masld-alcohol'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Cardiometabolic criteria', value: `${r.criteriaMet.length}/5` },
      ]);
      if (r.criteriaMet.length) note(o, 'Met: ' + r.criteriaMet.join('; ') + '.');
      if (r.nomenclatureNote) note(o, r.nomenclatureNote);
      if (r.thresholdNote) note(o, r.thresholdNote);
      if (r.alcoholUnitNote) note(o, r.alcoholUnitNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to findings already gathered. It does not stage fibrosis or direct treatment.' }));
  },
};
