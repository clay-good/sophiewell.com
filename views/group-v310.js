// spec-v310: renderer for the acute cholangitis severity grade (Tokyo Guidelines
// TG18/TG13). Group G (clinical scoring & reference). The clinician checks the
// organ-dysfunction (Grade III) and moderate (Grade II) criteria they have
// determined; the tile reports the overall severity grade (I / II / III).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the classification grade; it never asserts a
// drainage or antibiotic order (lib/cholangitis-v310.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cholangitis-v310.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The timing of biliary drainage and antibiotics stays with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const IDS = [
  'chol-cv', 'chol-neuro', 'chol-resp', 'chol-renal', 'chol-hepatic', 'chol-heme',
  'chol-wbc', 'chol-fever', 'chol-age', 'chol-bili', 'chol-albumin',
];

export const renderers = {
  'cholangitis-severity'(root) {
    note(root, 'Acute cholangitis severity (Tokyo Guidelines TG18/TG13). Check the criteria you have determined. Grade III (severe): any one organ dysfunction. Grade II (moderate): any two of the moderate criteria. Grade I (mild): neither. Near-neighbors: charlson, sirs.');

    note(root, 'Grade III — organ dysfunction (any one → Grade III):');
    root.appendChild(check('Cardiovascular: hypotension needing dopamine ≥5 µg/kg/min or any norepinephrine', 'chol-cv'));
    root.appendChild(check('Neurological: disturbance of consciousness', 'chol-neuro'));
    root.appendChild(check('Respiratory: PaO₂/FiO₂ ratio <300', 'chol-resp'));
    root.appendChild(check('Renal: oliguria or serum creatinine >2.0 mg/dL', 'chol-renal'));
    root.appendChild(check('Hepatic: PT-INR >1.5', 'chol-hepatic'));
    root.appendChild(check('Hematological: platelet count <100,000/mm³', 'chol-heme'));

    note(root, 'Grade II — moderate criteria (any two → Grade II):');
    root.appendChild(check('Abnormal WBC count (>12,000 or <4,000/mm³)', 'chol-wbc'));
    root.appendChild(check('High fever (≥39 °C / 102.2 °F)', 'chol-fever'));
    root.appendChild(check('Age ≥75 years', 'chol-age'));
    root.appendChild(check('Total bilirubin ≥5 mg/dL', 'chol-bili'));
    root.appendChild(check('Hypoalbuminemia (albumin <0.7× lower limit of normal)', 'chol-albumin'));

    const o = out(); root.appendChild(o);
    wire(IDS, () => safe(o, () => {
      const r = M.cholangitisSeverity({
        cardiovascular: chk('chol-cv'), neurological: chk('chol-neuro'), respiratory: chk('chol-resp'),
        renal: chk('chol-renal'), hepatic: chk('chol-hepatic'), hematological: chk('chol-heme'),
        abnormalWbc: chk('chol-wbc'), highFever: chk('chol-fever'), age: chk('chol-age'),
        hyperbilirubinemia: chk('chol-bili'), hypoalbuminemia: chk('chol-albumin'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Severity grade', value: r.gradeRoman },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
