// spec-v526: renderer for the neonatal SOFA (nSOFA). Group G. Three h2 section headings, one per organ
// domain, matching the instrument's own structure (never h3 - an h3 under the page h1 is a heading-level
// skip).
//
// The SpO2 and FiO2 inputs are shown only when the infant is intubated, because the published respiratory
// domain scores the ratio ONLY in that case; leaving them visible would imply a non-intubated infant's
// oxygen requirement contributes to the score, which is exactly the misreading the copy warns about
// (lib/nsofa-v526.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports organ
// dysfunction; it never asserts a diagnosis of sepsis or an indication to treat.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nsofa-v526.js';
import { resultRow } from '../lib/result-copy.js';

const YES_NO = [['no', 'No'], ['yes', 'Yes']];

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function number(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'nsofa'(root) {
    note(root, 'The neonatal SOFA: three organ systems, total 0 to 15. It has three domains where the adult SOFA has six, dropping the neurologic, hepatic, and renal domains because they do not mean the same thing in a very preterm infant. It was validated to predict mortality from late-onset sepsis in preterm very-low-birth-weight infants — it does not diagnose sepsis and does not rule it out.');

    heading(root, 'Respiratory');
    root.appendChild(select('Intubated?', 'nso-intubated', YES_NO));
    const spo2Node = number('SpO2 (percent)', 'nso-spo2', '1');
    const fio2Node = number('FiO2 (fraction, for example 0.40 for 40 percent)', 'nso-fio2', '0.01');
    root.appendChild(spo2Node);
    root.appendChild(fio2Node);

    heading(root, 'Cardiovascular');
    root.appendChild(select('Number of inotropes', 'nso-inotropes', M.INOTROPE_OPTIONS.map((o) => [o.value, o.text])));
    root.appendChild(select('Systemic steroid treatment?', 'nso-steroids', YES_NO));

    heading(root, 'Hematologic');
    root.appendChild(number('Platelet count (x10^9/L)', 'nso-platelets', '1'));

    const o = out(); root.appendChild(o);
    const ids = ['nso-intubated', 'nso-spo2', 'nso-fio2', 'nso-inotropes', 'nso-steroids', 'nso-platelets'];
    wire(ids, () => safe(o, () => {
      const intubated = val('nso-intubated') === 'yes';
      // The ratio is scored only when intubated, so the two inputs appear only then.
      spo2Node.hidden = !intubated;
      fio2Node.hidden = !intubated;

      const r = M.nsofa({
        intubated: val('nso-intubated'),
        spo2: val('nso-spo2'),
        fio2: val('nso-fio2'),
        inotropes: val('nso-inotropes'),
        steroids: val('nso-steroids'),
        platelets: val('nso-platelets'),
      });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [
        { text: r.band },
        { label: 'Total', value: `${r.total} of 15` },
        { label: 'Respiratory', value: `${r.respiratory} of 8` },
        { label: 'Cardiovascular', value: `${r.cardiovascular} of 4` },
        { label: 'Hematologic', value: `${r.hematologic} of 3` },
      ];
      if (r.sfRatio !== null) rows.push({ label: 'SpO2/FiO2', value: String(r.sfRatio) });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
