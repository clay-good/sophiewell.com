// spec-v796 §2: renderer for eu-tirads — the European Thyroid Association ultrasound risk
// stratification (Clinical Scoring & Risk, Group G). Companion to acr-tirads.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The high-risk
// features sit under a heading that states the override, because any one of them decides
// the category on its own.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/eu-tirads-v796.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('min', '0');
  inp.setAttribute('max', '200');
  inp.setAttribute('step', '0.1');
  inp.setAttribute('inputmode', 'decimal');
  inp.setAttribute('placeholder', 'e.g. 18');
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reports an ultrasound category and the size rule that goes with it. It does not read the images, and a needle decision also weighs clinical risk factors, suspicious lymph nodes and what the patient wants.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const APPEARANCE = [
  { value: 'iso-hyperechoic', text: 'Ovoid, smooth, iso- or hyperechoic (category 3)' },
  { value: 'mildly-hypoechoic', text: 'Ovoid, smooth, mildly hypoechoic (category 4)' },
  { value: 'benign', text: 'Pure cyst or entirely spongiform (category 2)' },
  { value: 'no-nodule', text: 'No nodule (category 1)' },
];

export const renderers = {
  'eu-tirads'(root) {
    note(root, 'EU-TIRADS (Russ 2017): pick the basic appearance, then tick any high-risk feature. Fine-needle aspiration is indicated above 20 mm in category 3, above 15 mm in category 4 and above 10 mm in category 5 - the more suspicious the nodule, the smaller it needs to be before a needle is warranted.');
    root.appendChild(selectField('Basic ultrasound appearance', 'eutr-appearance', APPEARANCE));
    root.appendChild(el('h2', { text: 'High-risk features (any one makes it category 5)' }));
    root.appendChild(checkField('Taller-than-wide shape', 'eutr-taller'));
    root.appendChild(checkField('Irregular margins', 'eutr-margins'));
    root.appendChild(checkField('Microcalcifications', 'eutr-microcalc'));
    root.appendChild(checkField('Marked hypoechogenicity', 'eutr-hypo'));
    root.appendChild(el('h2', { text: 'Size' }));
    root.appendChild(numberField('Largest nodule diameter (mm)', 'eutr-size'));
    const ids = ['eutr-appearance', 'eutr-taller', 'eutr-margins', 'eutr-microcalc', 'eutr-hypo', 'eutr-size'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.euTirads({
        appearance: val('eutr-appearance'),
        tallerThanWide: checked('eutr-taller'),
        irregularMargins: checked('eutr-margins'),
        microcalcifications: checked('eutr-microcalc'),
        markedHypoechogenicity: checked('eutr-hypo'),
        sizeMm: val('eutr-size'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Category', value: `EU-TIRADS ${r.category} (${r.categoryName})` },
        { label: 'Needle above', value: r.fnaThresholdMm === null ? 'not indicated on ultrasound grounds' : `${r.fnaThresholdMm} mm` },
      ]);
      note(o, r.highRiskFeatures.length ? `High-risk features present: ${r.highRiskFeatures.join(', ')}.` : 'No high-risk features selected.');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
