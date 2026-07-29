// spec-v594: renderer for the ARC-HBR criteria. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). The four BANDED variables are asked ONCE each in their own section rather than as
// separate major and minor checkboxes, because presenting them twice is what makes implementations
// double-count them (lib/arc-hbr-v594.js).
//
// Per spec-v11 section 5.3 this identifies bleeding risk only; it never weighs it against ischemic risk and
// never shortens or alters antiplatelet or anticoagulant therapy.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/arc-hbr-v594.js';
import { resultRow } from '../lib/result-copy.js';

function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any' }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];
const aid = (key) => `arc-${key}`;

export const renderers = {
  'arc-hbr'(root) {
    note(root, `A patient is at high bleeding risk with ${M.MAJOR_REQUIRED} MAJOR criterion OR ${M.MINOR_REQUIRED} MINOR criteria — two minor are worth one major, so minor criteria alone can qualify a patient.`);

    heading(root, 'The banded variables — each asked once, never twice');
    note(root, M.BANDING_NOTE);
    root.appendChild(select('Sex', aid('sex'), [['', '--'], ['male', 'Male'], ['female', 'Female']]));
    root.appendChild(number(`Hemoglobin (g/dL) — under ${M.HB_MAJOR_BELOW} is major; ${M.HB_MAJOR_BELOW}–${M.HB_MINOR_MAX_MALE} is minor for men, ${M.HB_MAJOR_BELOW}–${M.HB_MINOR_MAX_FEMALE} for women`, aid('hemoglobin')));
    note(root, M.SEX_NOTE);
    root.appendChild(number(`eGFR (mL/min) — under ${M.EGFR_MAJOR_BELOW} is major, ${M.EGFR_MAJOR_BELOW}–${M.EGFR_MINOR_BELOW - 1} is minor`, aid('egfr')));
    root.appendChild(number(`Platelet count (x10^9/L) — under ${M.PLATELET_MAJOR_BELOW} is major`, aid('platelets')));
    root.appendChild(number(`Age (years) — ${M.AGE_MINOR_AT_LEAST} or over is minor`, aid('age')));
    root.appendChild(select('Prior spontaneous bleeding', aid('priorBleeding'),
      [['', '--'], ...M.BLEEDING_OPTIONS.map((b) => [b.value, `${b.text}${b.tier ? ` — ${b.tier}` : ''}`])]));
    root.appendChild(select('Prior ischemic stroke', aid('priorStroke'),
      [['', '--'], ...M.STROKE_OPTIONS.map((s) => [s.value, `${s.text}${s.tier ? ` — ${s.tier}` : ''}`])]));
    note(root, M.TIMING_NOTE);

    heading(root, 'Major criteria');
    for (const m of M.MAJOR_BOOLEANS) root.appendChild(select(m.text, aid(m.key)));

    heading(root, 'Minor criteria');
    for (const m of M.MINOR_BOOLEANS) root.appendChild(select(m.text, aid(m.key)));

    const ids = [aid('sex'), aid('hemoglobin'), aid('egfr'), aid('platelets'), aid('age'),
      aid('priorBleeding'), aid('priorStroke'),
      ...M.MAJOR_BOOLEANS.map((m) => aid(m.key)), ...M.MINOR_BOOLEANS.map((m) => aid(m.key))];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        sex: val(aid('sex')), age: val(aid('age')), hemoglobin: val(aid('hemoglobin')),
        egfr: val(aid('egfr')), platelets: val(aid('platelets')),
        priorBleeding: val(aid('priorBleeding')), priorStroke: val(aid('priorStroke')),
      };
      for (const m of [...M.MAJOR_BOOLEANS, ...M.MINOR_BOOLEANS]) args[m.key] = val(aid(m.key));
      const r = M.arcHbr(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Major', value: `${r.majorCount}` },
        { label: 'Minor', value: `${r.minorCount}` },
        { label: 'Rule', value: `${M.MAJOR_REQUIRED} major or ${M.MINOR_REQUIRED} minor` },
        { label: 'Qualifies on minors alone', value: r.qualifiesOnMinorsAlone ? 'YES' : 'no' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'A definition, not a score');
    note(root, M.DEFINITION_NOTE);
    postureNote(root);
  },
};
