// spec-v821 §2: renderer for ghent-marfan — the revised Ghent nosology (Clinical Scoring &
// Risk, Group G).
//
// Two shapes here are load-bearing rather than cosmetic:
//   * FBN1 is a three-way select, not a checkbox. A mutation known to be associated with
//     aortic root disease and one not known with it lead to DIFFERENT diagnoses in the same
//     patient, and a boolean cannot express that.
//   * The three graded systemic items are selects with their published levels, because each
//     scores 2 or 1 depending on which form is present.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ghent-marfan-v821.js';
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
  'ghent-marfan'(root) {
    note(root, 'The nosology returns four possible diagnoses, not a yes or no: Marfan syndrome, ectopia lentis syndrome, MASS phenotype and mitral valve prolapse syndrome.');

    root.appendChild(el('h2', { text: 'Cardinal features' }));
    numField(root, 'Aortic root Z score at the sinuses of Valsalva', 'gm-z', { step: '0.1' });
    root.appendChild(checkField('Ectopia lentis', 'gm-el'));
    root.appendChild(checkField('Family history of Marfan syndrome', 'gm-fh'));
    numField(root, 'Age in years (the aortic threshold rises below 20 when there is a family history)', 'gm-age', { min: '0', max: '130', step: '1' });
    selField(root, 'FBN1 status', 'gm-fbn1', [
      ['none', 'No FBN1 mutation, or not tested'],
      ['known-with-ao', 'FBN1 mutation known to be associated with aortic root disease'],
      ['not-known-with-ao', 'FBN1 mutation NOT known to be associated with aortic root disease'],
    ]);

    root.appendChild(el('h2', { text: 'Systemic score, out of 20' }));
    selField(root, 'Wrist and thumb signs', 'gm-wristthumb', [
      ['none', 'Neither'], ['one', 'Wrist OR thumb sign (1 point)'], ['both', 'Wrist AND thumb sign (3 points)'],
    ]);
    selField(root, 'Chest wall', 'gm-pectus', [
      ['none', 'Normal'], ['excavatum', 'Pectus excavatum or chest asymmetry (1 point)'], ['carinatum', 'Pectus carinatum (2 points)'],
    ]);
    selField(root, 'Foot', 'gm-hindfoot', [
      ['none', 'Normal'], ['planus', 'Plain pes planus (1 point)'], ['deformity', 'Hindfoot deformity (2 points)'],
    ]);
    root.appendChild(checkField('Spontaneous pneumothorax (2 points)', 'gm-pneumothorax'));
    root.appendChild(checkField('Dural ectasia (2 points)', 'gm-dural'));
    root.appendChild(checkField('Protrusio acetabuli (2 points)', 'gm-protrusio'));
    root.appendChild(checkField('Reduced upper to lower segment ratio AND increased arm span to height AND no severe scoliosis (1 point)', 'gm-segment'));
    root.appendChild(checkField('Scoliosis or thoracolumbar kyphosis (1 point)', 'gm-scoliosis'));
    root.appendChild(checkField('Reduced elbow extension (1 point)', 'gm-elbow'));
    root.appendChild(checkField('Facial features, 3 of 5 (1 point)', 'gm-facial'));
    root.appendChild(checkField('Skin striae (1 point)', 'gm-striae'));
    root.appendChild(checkField('Myopia over 3 diopters (1 point)', 'gm-myopia'));
    root.appendChild(checkField('Mitral valve prolapse, all types (1 point)', 'gm-mvp'));

    root.appendChild(el('h2', { text: 'The differential' }));
    root.appendChild(checkField('Discriminating features of Shprintzen-Goldberg, Loeys-Dietz and vascular Ehlers-Danlos have been excluded, with testing where indicated', 'gm-differential'));

    const ids = ['gm-z', 'gm-el', 'gm-fh', 'gm-age', 'gm-fbn1', 'gm-wristthumb', 'gm-pectus',
      'gm-hindfoot', 'gm-pneumothorax', 'gm-dural', 'gm-protrusio', 'gm-segment', 'gm-scoliosis',
      'gm-elbow', 'gm-facial', 'gm-striae', 'gm-myopia', 'gm-mvp', 'gm-differential'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ghentMarfan({
        aorticZScore: val('gm-z'),
        ectopiaLentis: checked('gm-el'),
        familyHistory: checked('gm-fh'),
        age: val('gm-age'),
        fbn1: val('gm-fbn1'),
        wristThumb: val('gm-wristthumb'),
        pectus: val('gm-pectus'),
        hindfoot: val('gm-hindfoot'),
        pneumothorax: checked('gm-pneumothorax'),
        duralEctasia: checked('gm-dural'),
        protrusioAcetabuli: checked('gm-protrusio'),
        segmentRatio: checked('gm-segment'),
        scoliosis: checked('gm-scoliosis'),
        reducedElbowExtension: checked('gm-elbow'),
        facialFeatures: checked('gm-facial'),
        skinStriae: checked('gm-striae'),
        myopia: checked('gm-myopia'),
        mvp: checked('gm-mvp'),
        differentialExcluded: checked('gm-differential'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Systemic score', value: `${r.systemicScore}/20` },
      ]);
      if (r.systemicContributions.length) note(o, 'Scoring: ' + r.systemicContributions.join('; ') + '.');
      if (r.ageNote) note(o, r.ageNote);
      if (r.fbn1Note) note(o, r.fbn1Note);
      if (r.caveat) note(o, r.caveat);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to findings already gathered. It does not order the echocardiogram, the slit-lamp examination or the genetic testing they depend on.' }));
  },
};
