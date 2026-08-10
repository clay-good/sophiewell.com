// spec-v696 §2: renderer for framingham-hf-criteria — the Framingham heart-failure
// diagnostic criteria (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Fourteen
// checkboxes (8 major + 6 minor); decision logic returns whether HF criteria are met.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/framingham-hf-criteria-v696.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function heading(text) { return el('p', { class: 'muted', text }); }
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Framingham criteria are a clinical rule; confirm with objective testing (natriuretic peptides, echocardiography). A minor criterion counts only if not attributable to another condition. It supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'framingham-hf-criteria'(root) {
    note(root, 'Framingham criteria (McKee 1971): heart failure is diagnosed with ≥ 2 major criteria, or 1 major plus ≥ 2 minor criteria.');
    root.appendChild(heading('Major criteria'));
    root.appendChild(checkField('Acute pulmonary edema', 'fhf-edema'));
    root.appendChild(checkField('Cardiomegaly', 'fhf-cardiomegaly'));
    root.appendChild(checkField('Hepatojugular reflux', 'fhf-hjr'));
    root.appendChild(checkField('Neck-vein distention (raised JVP)', 'fhf-jvd'));
    root.appendChild(checkField('Paroxysmal nocturnal dyspnea or orthopnea', 'fhf-pnd'));
    root.appendChild(checkField('Pulmonary rales', 'fhf-rales'));
    root.appendChild(checkField('Third heart sound (S3 gallop)', 'fhf-s3'));
    root.appendChild(checkField('Weight loss > 4.5 kg in 5 days with HF treatment', 'fhf-wtloss'));
    root.appendChild(heading('Minor criteria (count only if not from another condition)'));
    root.appendChild(checkField('Ankle edema', 'fhf-ankle'));
    root.appendChild(checkField('Dyspnea on exertion', 'fhf-doe'));
    root.appendChild(checkField('Hepatomegaly', 'fhf-hepatomegaly'));
    root.appendChild(checkField('Nocturnal cough', 'fhf-cough'));
    root.appendChild(checkField('Pleural effusion', 'fhf-effusion'));
    root.appendChild(checkField('Tachycardia (heart rate > 120/min)', 'fhf-tachy'));
    const ids = ['fhf-edema', 'fhf-cardiomegaly', 'fhf-hjr', 'fhf-jvd', 'fhf-pnd', 'fhf-rales', 'fhf-s3', 'fhf-wtloss', 'fhf-ankle', 'fhf-doe', 'fhf-hepatomegaly', 'fhf-cough', 'fhf-effusion', 'fhf-tachy'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.framinghamHfCriteria({
        acutePulmonaryEdema: checked('fhf-edema'), cardiomegaly: checked('fhf-cardiomegaly'), hepatojugularReflux: checked('fhf-hjr'),
        neckVeinDistention: checked('fhf-jvd'), pndOrthopnea: checked('fhf-pnd'), rales: checked('fhf-rales'), s3Gallop: checked('fhf-s3'),
        weightLossTreatment: checked('fhf-wtloss'),
        ankleEdema: checked('fhf-ankle'), dyspneaExertion: checked('fhf-doe'), hepatomegaly: checked('fhf-hepatomegaly'),
        nocturnalCough: checked('fhf-cough'), pleuralEffusion: checked('fhf-effusion'), tachycardia: checked('fhf-tachy'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Major', value: `${r.major}` },
        { label: 'Minor', value: `${r.minor}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
