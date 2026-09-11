// spec-v1243: renderers for the four liver-and-endoscopy tiles (Clinical Scoring & Risk, Group G):
// sarin-gastric-varices, hill-grade, hepatopulmonary-syndrome, portopulmonary-hypertension.
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as S from '../lib/sarin-gastric-varices-v1243.js';
import * as H from '../lib/hill-grade-v1243.js';
import * as P from '../lib/hepatopulmonary-syndrome-v1243.js';
import * as O from '../lib/portopulmonary-hypertension-v1243.js';
import { resultRow } from '../lib/result-copy.js';

const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function selectField(root, label, id, options, blankText) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  sel.appendChild(el('option', { value: '', text: blankText }));
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id, hint) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: '0.1', inputmode: 'decimal' }));
  if (hint) wrap.appendChild(el('span', { class: 'muted', text: ' ' + hint }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'sarin-gastric-varices'(root) {
    note(root, 'Choose what the endoscopy showed. The two isolated types are the ones that bleed most, so there is no safe default.');
    selectField(root, 'Sarin type', 'sgv-type', S.SARIN_TYPES, '-- not classified --');

    const o = out(); root.appendChild(o);
    wire(['sgv-type'], () => safe(o, () => {
      const r = S.sarinGastricVarices({ type: val('sgv-type') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
      ]);
      note(o, r.commonestNote);
      note(o, r.isolatedNote);
      note(o, r.seriesNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'hill-grade'(root) {
    note(root, 'Grade the flap valve on the retroflexed view. It is a finding that exists only while the endoscope is in.');
    selectField(root, 'Flap valve appearance', 'hill-grade', H.HILL_GRADES, '-- not graded --');

    const o = out(); root.appendChild(o);
    wire(['hill-grade'], () => safe(o, () => {
      const r = H.hillGrade({ grade: val('hill-grade') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.grade },
      ]);
      note(o, r.herniaNote);
      note(o, r.notEsophagitisNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'hepatopulmonary-syndrome'(root) {
    note(root, 'All three criteria are asked. The gradient threshold moves above the age of 64, because the gradient widens with age on its own.');
    selectField(root, 'Liver disease or portal hypertension', 'hps-liverDisease', YES_NO, '-- not assessed --');
    selectField(root, 'Intrapulmonary vascular dilatation shown (contrast echocardiogram)', 'hps-ipvd', YES_NO, '-- not assessed --');
    numField(root, 'Age', 'hps-age', 'years');
    numField(root, 'Room-air arterial oxygen (PaO2)', 'hps-pao2', 'mmHg');
    numField(root, 'Room-air alveolar-arterial oxygen gradient', 'hps-aaGradient', 'mmHg');

    const o = out(); root.appendChild(o);
    wire(['hps-liverDisease', 'hps-ipvd', 'hps-age', 'hps-pao2', 'hps-aaGradient'], () => safe(o, () => {
      const r = P.hepatopulmonarySyndrome({
        liverDisease: val('hps-liverDisease') === 'yes' ? true : (val('hps-liverDisease') === 'no' ? false : ''),
        ipvd: val('hps-ipvd') === 'yes' ? true : (val('hps-ipvd') === 'no' ? false : ''),
        age: val('hps-age'),
        pao2: val('hps-pao2'),
        aaGradient: val('hps-aaGradient'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Criteria', value: r.meets ? 'met' : 'not met' },
      ]);
      note(o, r.ageNote);
      note(o, r.mildNote);
      note(o, r.severityScopeNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'portopulmonary-hypertension'(root) {
    note(root, 'Enter the catheter numbers. Two definitions of pulmonary hypertension are in use and they disagree at the bottom, so both are reported.');
    selectField(root, 'Portal hypertension present', 'poph-portalHypertension', YES_NO, '-- not assessed --');
    numField(root, 'Mean pulmonary artery pressure', 'poph-mpap', 'mmHg');
    numField(root, 'Pulmonary vascular resistance', 'poph-pvrWood', 'Wood units');
    numField(root, 'Pulmonary artery wedge pressure', 'poph-wedge', 'mmHg');

    const o = out(); root.appendChild(o);
    wire(['poph-portalHypertension', 'poph-mpap', 'poph-pvrWood', 'poph-wedge'], () => safe(o, () => {
      const r = O.portopulmonaryHypertension({
        portalHypertension: val('poph-portalHypertension') === 'yes' ? true : (val('poph-portalHypertension') === 'no' ? false : ''),
        mpap: val('poph-mpap'),
        pvrWood: val('poph-pvrWood'),
        wedge: val('poph-wedge'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: '2022 ESC/ERS', value: r.meets2022 ? 'met' : 'not met' },
        { label: '2004 task force', value: r.meets2004 ? 'met' : 'not met' },
      ]);
      note(o, r.wedgeNote);
      note(o, r.severityNote);
      note(o, r.definitionNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },
};
