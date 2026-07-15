// spec-v311: renderer for the acute cholecystitis severity grade (Tokyo Guidelines
// TG18/TG13) — the companion to the spec-v310 acute cholangitis grade. Group G. The
// clinician checks the organ-dysfunction (Grade III) and moderate (Grade II)
// criteria they have determined; the tile reports the overall severity grade.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the classification grade; it never asserts an
// operative or drainage order (lib/cholecystitis-v311.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cholecystitis-v311.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The timing of cholecystectomy or gallbladder drainage stays with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const IDS = [
  'cc-cv', 'cc-neuro', 'cc-resp', 'cc-renal', 'cc-hepatic', 'cc-heme',
  'cc-wbc', 'cc-mass', 'cc-duration', 'cc-inflammation',
];

export const renderers = {
  'cholecystitis-severity'(root) {
    note(root, 'Acute cholecystitis severity (Tokyo Guidelines TG18/TG13). Check the criteria you have determined. Grade III (severe): any one organ dysfunction. Grade II (moderate): any one of the moderate criteria. Grade I (mild): neither. Companion: cholangitis-severity.');

    note(root, 'Grade III — organ dysfunction (any one → Grade III):');
    root.appendChild(check('Cardiovascular: hypotension needing dopamine ≥5 µg/kg/min or any norepinephrine', 'cc-cv'));
    root.appendChild(check('Neurological: decreased level of consciousness', 'cc-neuro'));
    root.appendChild(check('Respiratory: PaO₂/FiO₂ ratio <300', 'cc-resp'));
    root.appendChild(check('Renal: oliguria or serum creatinine >2.0 mg/dL', 'cc-renal'));
    root.appendChild(check('Hepatic: PT-INR >1.5', 'cc-hepatic'));
    root.appendChild(check('Hematological: platelet count <100,000/mm³', 'cc-heme'));

    note(root, 'Grade II — moderate criteria (any one → Grade II):');
    root.appendChild(check('Elevated WBC count (>18,000/mm³)', 'cc-wbc'));
    root.appendChild(check('Palpable tender mass in the right upper quadrant', 'cc-mass'));
    root.appendChild(check('Duration of complaints >72 h', 'cc-duration'));
    root.appendChild(check('Marked local inflammation (gangrenous/emphysematous cholecystitis, pericholecystic or hepatic abscess, biliary peritonitis)', 'cc-inflammation'));

    const o = out(); root.appendChild(o);
    wire(IDS, () => safe(o, () => {
      const r = M.cholecystitisSeverity({
        cardiovascular: chk('cc-cv'), neurological: chk('cc-neuro'), respiratory: chk('cc-resp'),
        renal: chk('cc-renal'), hepatic: chk('cc-hepatic'), hematological: chk('cc-heme'),
        elevatedWbc: chk('cc-wbc'), tenderMass: chk('cc-mass'), durationOver72h: chk('cc-duration'),
        markedInflammation: chk('cc-inflammation'),
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
