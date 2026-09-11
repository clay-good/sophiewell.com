// spec-v1242: renderers for the four vascular classification tiles (Clinical Scoring & Risk,
// Group G): stanford-dissection, ecst-carotid, endoleak-type, rutherford-ali.
//
// Each select is written as `'dom-id', CONST` so that scripts/lib/option-labels.mjs, which reads
// views statically, resolves the option text and the tool page prints the wording rather than the
// raw value.

import { el, clear } from '../lib/dom.js';
import * as D from '../lib/stanford-dissection-v1242.js';
import * as C from '../lib/ecst-carotid-v1242.js';
import * as E from '../lib/endoleak-type-v1242.js';
import * as R from '../lib/rutherford-ali-v1242.js';
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
  wrap.appendChild(el('input', { id, type: 'number', step: '0.1', inputmode: 'decimal' }));
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
  'stanford-dissection'(root) {
    note(root, 'Tick the aortic segments the dissection involves, then the findings. The letter turns on the ascending aorta alone.');
    for (const s of D.AORTIC_SEGMENTS) checkField(root, s.label, `sd-${s.key}`);
    for (const c of D.TYPE_B_COMPLICATED) checkField(root, c.label, `sd-${c.key}`);
    for (const c of D.TYPE_B_HIGH_RISK) checkField(root, c.label, `sd-${c.key}`);

    const ids = [...D.AORTIC_SEGMENTS, ...D.TYPE_B_COMPLICATED, ...D.TYPE_B_HIGH_RISK].map((x) => `sd-${x.key}`);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const x of [...D.AORTIC_SEGMENTS, ...D.TYPE_B_COMPLICATED, ...D.TYPE_B_HIGH_RISK]) input[x.key] = checked(`sd-${x.key}`);
      const r = D.stanfordDissection(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stanford', value: r.type },
      ]);
      note(o, r.archNote);
      note(o, r.uncomplicatedNote);
      note(o, r.debakeyNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'ecst-carotid'(root) {
    note(root, 'Enter the three diameters from the angiogram. The same artery gets two percentages, and the tool prints both.');
    numField(root, 'Narrowest residual lumen', 'ecst-residual', 'mm');
    numField(root, 'Distal internal carotid diameter, beyond the bulb', 'ecst-distalIca', 'mm');
    numField(root, 'Estimated original diameter at the stenosis', 'ecst-originalBulb', 'mm');

    const o = out(); root.appendChild(o);
    wire(['ecst-residual', 'ecst-distalIca', 'ecst-originalBulb'], () => safe(o, () => {
      const r = C.ecstCarotid({
        residual: val('ecst-residual'),
        distalIca: val('ecst-distalIca'),
        originalBulb: val('ecst-originalBulb'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'NASCET', value: `${r.nascet}%` },
        { label: 'ECST', value: `${r.ecst}%` },
      ]);
      note(o, r.swapNote);
      note(o, r.conversionNote);
      note(o, r.thresholdNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'endoleak-type'(root) {
    note(root, 'Say what the imaging shows. The type follows from the mechanism, and the urgency follows from the pressure rather than from the numeral.');
    selectField(root, 'Finding on imaging', 'el-finding', E.ENDOLEAK_FINDINGS, '-- not assessed --');

    const o = out(); root.appendChild(o);
    wire(['el-finding'], () => safe(o, () => {
      const r = E.endoleakType({ finding: val('el-finding') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
      ]);
      note(o, r.exclusionNote);
      note(o, r.earlyNote);
      note(o, r.ladderNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },

  'rutherford-ali'(root) {
    note(root, 'Record all four findings. The venous Doppler signal is the one that separates a limb to revascularize now from one where revascularization is the wrong operation.');
    selectField(root, 'Sensory loss', 'ali-sensory', R.ALI_SENSORY, '-- not assessed --');
    selectField(root, 'Muscle weakness', 'ali-motor', R.ALI_MOTOR, '-- not assessed --');
    selectField(root, 'Arterial Doppler signal', 'ali-arterialDoppler', R.ALI_DOPPLER, '-- not assessed --');
    selectField(root, 'Venous Doppler signal', 'ali-venousDoppler', R.ALI_DOPPLER, '-- not assessed --');

    const o = out(); root.appendChild(o);
    wire(['ali-sensory', 'ali-motor', 'ali-arterialDoppler', 'ali-venousDoppler'], () => safe(o, () => {
      const r = R.rutherfordAli({
        sensory: val('ali-sensory'),
        motor: val('ali-motor'),
        arterialDoppler: val('ali-arterialDoppler'),
        venousDoppler: val('ali-venousDoppler'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Category', value: r.category },
      ]);
      note(o, r.conflictNote);
      note(o, r.venousNote);
      note(o, r.arterialOnlyNote);
      note(o, r.chronicNote);
      note(o, r.postureNote);
      note(o, r.note);
    }));
  },
};
