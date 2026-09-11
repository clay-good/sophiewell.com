// spec-v1241: renderers for the four spine and orthopedic classification tiles (Clinical Scoring &
// Risk, Group G): ao-spine-tl, ao-spine-subaxial, herbert-scaphoid, lenke-scoliosis.
//
// Each select is written as `'dom-id', CONST` with the option list a named export of the lib, so that
// scripts/lib/option-labels.mjs -- which reads views statically -- resolves the option text and the
// tool page prints the wording rather than the raw value.
//
// Every select carries a blank first option. On three of these four tiles the lib refuses a blank
// rather than defaulting, which is the whole point: a missing neurology is not an N0, and a missing
// Herbert type is not an A1.

import { el, clear } from '../lib/dom.js';
import * as T from '../lib/ao-spine-tl-v1241.js';
import * as S from '../lib/ao-spine-subaxial-v1241.js';
import * as H from '../lib/herbert-scaphoid-v1241.js';
import * as L from '../lib/lenke-scoliosis-v1241.js';
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
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function numField(root, label, id, hint) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: '1', inputmode: 'numeric' }));
  if (hint) wrap.appendChild(el('span', { class: 'muted', text: ' ' + hint }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ao-spine-tl'(root) {
    note(root, 'Choose the morphology and the neurological status, then tick any modifier that applies. The score is the sum of the three.');
    selectField(root, 'Morphology', 'aotl-morph', T.AO_TL_MORPHOLOGY, '-- not classified --');
    selectField(root, 'Neurological status', 'aotl-neuro', T.AO_NEURO, '-- not assessed --');
    for (const m of T.AO_TL_MODIFIERS) checkField(root, m.label, `aotl-${m.key}`);

    const o = out(); root.appendChild(o);
    wire(['aotl-morph', 'aotl-neuro', ...T.AO_TL_MODIFIERS.map((m) => `aotl-${m.key}`)], () => safe(o, () => {
      const r = T.aoSpineTl({
        morphology: val('aotl-morph'),
        neuro: val('aotl-neuro'),
        m1: checked('aotl-m1'),
        m2: checked('aotl-m2'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'TL AOSIS', value: String(r.score) },
      ]);
      note(o, r.unscoredModifier);
      note(o, r.neuroNote);
      note(o, r.provenanceNote);
      note(o, r.tlicsNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'ao-spine-subaxial'(root) {
    note(root, 'Choose the morphology, the facet injury and the neurological status, then tick any modifier. The answer is a code, not a total.');
    selectField(root, 'Morphology', 'aosc-morph', S.AO_SUBAXIAL_MORPHOLOGY, '-- not classified --');
    selectField(root, 'Facet injury', 'aosc-facet', S.AO_SUBAXIAL_FACET, '-- not assessed --');
    selectField(root, 'Neurological status', 'aosc-neuro', S.AO_NEURO, '-- not assessed --');
    checkField(root, 'Bilateral facet injury of the same type (BL)', 'aosc-bl');
    for (const m of S.AO_SUBAXIAL_MODIFIERS) checkField(root, m.label, `aosc-${m.key}`);

    const o = out(); root.appendChild(o);
    wire(['aosc-morph', 'aosc-facet', 'aosc-neuro', 'aosc-bl', ...S.AO_SUBAXIAL_MODIFIERS.map((m) => `aosc-${m.key}`)], () => safe(o, () => {
      const r = S.aoSpineSubaxial({
        morphology: val('aosc-morph'),
        facet: val('aosc-facet'),
        neuro: val('aosc-neuro'),
        bilateral: checked('aosc-bl'),
        m1: checked('aosc-m1'),
        m2: checked('aosc-m2'),
        m3: checked('aosc-m3'),
        m4: checked('aosc-m4'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Code', value: r.code },
      ]);
      note(o, r.facetNote);
      note(o, r.neuroNote);
      note(o, r.noTotalNote);
      note(o, r.slicNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'herbert-scaphoid'(root) {
    note(root, 'Choose the type. A2 and B2 are both waist fractures, and only one of them is stable.');
    selectField(root, 'Herbert type', 'hsc-type', H.HERBERT_TYPES, '-- not classified --');

    const o = out(); root.appendChild(o);
    wire(['hsc-type'], () => safe(o, () => {
      const r = H.herbertScaphoid({ type: val('hsc-type') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
      ]);
      note(o, r.proximalPoleNote);
      note(o, r.nonunionNote);
      note(o, r.russeNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'lenke-scoliosis'(root) {
    note(root, 'Enter the three standing Cobb angles and the three side-bending residuals, then the regional kyphosis measurements. The type follows from which curves are structural.');
    numField(root, 'Proximal thoracic Cobb angle, standing', 'lenke-ptCobb', 'degrees');
    numField(root, 'Main thoracic Cobb angle, standing', 'lenke-mtCobb', 'degrees');
    numField(root, 'Thoracolumbar/lumbar Cobb angle, standing', 'lenke-tlCobb', 'degrees');
    numField(root, 'Proximal thoracic Cobb angle on side bending', 'lenke-ptBend', 'degrees');
    numField(root, 'Main thoracic Cobb angle on side bending', 'lenke-mtBend', 'degrees');
    numField(root, 'Thoracolumbar/lumbar Cobb angle on side bending', 'lenke-tlBend', 'degrees');
    numField(root, 'T2 to T5 kyphosis', 'lenke-t2t5', 'degrees');
    numField(root, 'T10 to L2 kyphosis', 'lenke-t10l2', 'degrees');
    numField(root, 'T5 to T12 kyphosis', 'lenke-t5t12', 'degrees');
    selectField(root, 'Center sacral vertical line at the lumbar apex', 'lenke-csvl', L.LENKE_CSVL, '-- not assessed --');

    const ids = ['lenke-ptCobb', 'lenke-mtCobb', 'lenke-tlCobb', 'lenke-ptBend', 'lenke-mtBend', 'lenke-tlBend', 'lenke-t2t5', 'lenke-t10l2', 'lenke-t5t12', 'lenke-csvl'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = L.lenkeScoliosis({
        ptCobb: val('lenke-ptCobb'), mtCobb: val('lenke-mtCobb'), tlCobb: val('lenke-tlCobb'),
        ptBend: val('lenke-ptBend'), mtBend: val('lenke-mtBend'), tlBend: val('lenke-tlBend'),
        t2t5: val('lenke-t2t5'), t10l2: val('lenke-t10l2'), t5t12: val('lenke-t5t12'),
        csvl: val('lenke-csvl'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Lenke', value: r.code },
      ]);
      note(o, r.majorStructuralNote);
      note(o, r.structuralNote);
      note(o, r.marginNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },
};
