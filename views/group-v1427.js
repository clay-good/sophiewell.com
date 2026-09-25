// spec-v1427: renderer for mcpherson-pji (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page. The factor labels come from the lib.

import { el, clear } from '../lib/dom.js';
import * as MP from '../lib/mcpherson-pji-v1427.js';
import { resultRow } from '../lib/result-copy.js';

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
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const NA = '-- not entered --';


const TEXT = Object.fromEntries([...MP.MPH_SYSTEMIC, ...MP.MPH_CRITICAL, ...MP.MPH_LOCAL].map((f) => [f.key, f.text]));

export const renderers = {
  'mcpherson-pji'(root) {
    note(root, 'Answer each factor yes or no. A factor left blank is not counted as absent, so the grade it could change is shown as a range.');
    selectField(root, 'Infection type', 'mph-type', MP.MPH_TYPE, NA);
    note(root, 'Systemic host factors');
    selectField(root, TEXT.age80, 'mph-age80', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.alcoholism, 'mph-alcoholism', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.dermatitis, 'mph-dermatitis', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.catheter, 'mph-catheter', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.malnutrition, 'mph-malnutrition', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.nicotine, 'mph-nicotine', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.diabetes, 'mph-diabetes', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.hepatic, 'mph-hepatic', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.immunosuppressive, 'mph-immunosuppressive', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.malignancy, 'mph-malignancy', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.pulmonary, 'mph-pulmonary', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.dialysis, 'mph-dialysis', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.inflammatory, 'mph-inflammatory', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.immune, 'mph-immune', MP.MPH_YES_NO, NA);
    note(root, 'Any one of these makes the host grade C');
    selectField(root, TEXT.anc, 'mph-anc', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.cd4, 'mph-cd4', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.ivdu, 'mph-ivdu', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.otherInfection, 'mph-otherinfection', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.immuneNeoplasm, 'mph-immuneneoplasm', MP.MPH_YES_NO, NA);
    note(root, 'Local extremity (wound) factors');
    selectField(root, TEXT.longInfection, 'mph-longinfection', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.incisions, 'mph-incisions', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.softTissueLoss, 'mph-softtissueloss', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.abscess, 'mph-abscess', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.fistula, 'mph-fistula', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.priorTrauma, 'mph-priortrauma', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.irradiation, 'mph-irradiation', MP.MPH_YES_NO, NA);
    selectField(root, TEXT.vascular, 'mph-vascular', MP.MPH_YES_NO, NA);
    const ids = ['mph-type', 'mph-age80', 'mph-alcoholism', 'mph-dermatitis', 'mph-catheter', 'mph-malnutrition', 'mph-nicotine', 'mph-diabetes', 'mph-hepatic', 'mph-immunosuppressive', 'mph-malignancy', 'mph-pulmonary', 'mph-dialysis', 'mph-inflammatory', 'mph-immune', 'mph-anc', 'mph-cd4', 'mph-ivdu', 'mph-otherinfection', 'mph-immuneneoplasm', 'mph-longinfection', 'mph-incisions', 'mph-softtissueloss', 'mph-abscess', 'mph-fistula', 'mph-priortrauma', 'mph-irradiation', 'mph-vascular'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = MP.mcphersonPji({ type: val('mph-type'), age80: val('mph-age80'), alcoholism: val('mph-alcoholism'), dermatitis: val('mph-dermatitis'), catheter: val('mph-catheter'), malnutrition: val('mph-malnutrition'), nicotine: val('mph-nicotine'), diabetes: val('mph-diabetes'), hepatic: val('mph-hepatic'), immunosuppressive: val('mph-immunosuppressive'), malignancy: val('mph-malignancy'), pulmonary: val('mph-pulmonary'), dialysis: val('mph-dialysis'), inflammatory: val('mph-inflammatory'), immune: val('mph-immune'), anc: val('mph-anc'), cd4: val('mph-cd4'), ivdu: val('mph-ivdu'), otherInfection: val('mph-otherinfection'), immuneNeoplasm: val('mph-immuneneoplasm'), longInfection: val('mph-longinfection'), incisions: val('mph-incisions'), softTissueLoss: val('mph-softtissueloss'), abscess: val('mph-abscess'), fistula: val('mph-fistula'), priorTrauma: val('mph-priortrauma'), irradiation: val('mph-irradiation'), vascular: val('mph-vascular') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'McPherson stage', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
