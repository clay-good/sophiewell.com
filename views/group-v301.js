// spec-v301: renderer for the diabetic retinopathy severity (ICDR scale). Group G
// (clinical scoring & reference). The clinician checks the dilated-ophthalmoscopy
// findings; the tile reports the ICDR grade (the highest-severity level whose
// criteria are met).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the ICDR grade; it never asserts a diagnosis or a
// follow-up plan (lib/dr-severity-v301.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/dr-severity-v301.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'icdr-retinopathy'(root) {
    note(root, 'Diabetic retinopathy severity — the International Clinical Diabetic Retinopathy (ICDR) scale. Check the dilated-fundus findings; the tile reports the ICDR grade (the highest-severity level that applies). With no findings checked it reports “no apparent retinopathy”. Near-neighbors: egfr.');
    root.appendChild(check('Neovascularization (of the disc or elsewhere)', 'dr-neo'));
    root.appendChild(check('Vitreous or preretinal hemorrhage', 'dr-vith'));
    root.appendChild(check('>20 intraretinal hemorrhages in each of 4 quadrants', 'dr-hem421'));
    root.appendChild(check('Definite venous beading in ≥2 quadrants', 'dr-vb'));
    root.appendChild(check('Prominent IRMA in ≥1 quadrant', 'dr-irma'));
    root.appendChild(check('Findings beyond microaneurysms (but below severe)', 'dr-beyond'));
    root.appendChild(check('Microaneurysms present', 'dr-ma'));

    const o = out(); root.appendChild(o);
    wire(['dr-neo', 'dr-vith', 'dr-hem421', 'dr-vb', 'dr-irma', 'dr-beyond', 'dr-ma'], () => safe(o, () => {
      const r = M.drSeverityIcdr({
        neovascularization: chk('dr-neo'),
        vitreousHemorrhage: chk('dr-vith'),
        hem4quadrants: chk('dr-hem421'),
        venousBeading2: chk('dr-vb'),
        irma1: chk('dr-irma'),
        beyondMicroaneurysms: chk('dr-beyond'),
        microaneurysms: chk('dr-ma'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ICDR grade', value: `${r.grade} of 5` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
