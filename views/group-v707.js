// spec-v707 §2: renderer for amsler-krumeich — the Amsler-Krumeich keratoconus staging
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two required
// number inputs (mean K, thinnest thickness), an optional refraction number, and a
// central-scar checkbox; decision logic returns the keratoconus stage.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/amsler-krumeich-v707.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '1', inputmode: 'decimal' }));
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Amsler-Krumeich stage grades severity to guide management; it does not by itself select a treatment. It supports rather than replaces the full corneal-tomography assessment and clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'amsler-krumeich'(root) {
    note(root, 'Amsler-Krumeich keratoconus staging (Krumeich 1998): the stage is the most advanced finding among mean K (< 48 / 48–53 / 54–55 / > 55 D), thinnest thickness (> 500 / 400–500 / 200–400 / < 200 µm), refraction, and central scarring. Stage 1 mildest → 4 most advanced.');
    root.appendChild(numberField('Mean central keratometry (diopters)', 'ak-k', '0.1'));
    root.appendChild(numberField('Thinnest corneal thickness (microns)', 'ak-thick', '1'));
    root.appendChild(numberField('Myopia + astigmatism (diopters, optional)', 'ak-refraction', '0.25'));
    root.appendChild(checkField('Central corneal scarring present (stage 4)', 'ak-scar'));
    const ids = ['ak-k', 'ak-thick', 'ak-refraction', 'ak-scar'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.amslerKrumeich({ meanK: val('ak-k'), thinnestThickness: val('ak-thick'), refraction: val('ak-refraction'), centralScar: checked('ak-scar') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: `${r.stage} of 4` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
