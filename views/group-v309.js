// spec-v309: renderer for the acute GVHD grade (modified Glucksberg). Group G
// (clinical scoring & reference). The clinician picks the skin, liver, and GI organ
// stages (0-4 each); the tile reports the overall acute GVHD grade.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the classification grade; it never asserts a
// treatment order (lib/gvhd-v309.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gvhd-v309.js';
import { resultRow } from '../lib/result-copy.js';

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
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'gvhd-grade'(root) {
    note(root, 'Acute GVHD grade (modified Glucksberg) after allogeneic transplant. Pick the skin, liver, and gastrointestinal organ stages (0–4 each); the tile reports the overall grade (0–IV). Grades III–IV are severe. Staging thresholds are in the note. Near-neighbors: crs-grade.');
    root.appendChild(select('Skin stage (by BSA rash)', 'gvhd-skin', [
      ['0', '0 — no rash'],
      ['1', '1 — rash <25% BSA'],
      ['2', '2 — rash 25-50% BSA'],
      ['3', '3 — generalized erythroderma'],
      ['4', '4 — erythroderma with bullae / desquamation'],
    ]));
    root.appendChild(select('Liver stage (by bilirubin)', 'gvhd-liver', [
      ['0', '0 — bilirubin <2 mg/dL'],
      ['1', '1 — bilirubin 2-3 mg/dL'],
      ['2', '2 — bilirubin 3-6 mg/dL'],
      ['3', '3 — bilirubin 6-15 mg/dL'],
      ['4', '4 — bilirubin >15 mg/dL'],
    ]));
    root.appendChild(select('Lower GI stage (by diarrhea volume)', 'gvhd-gi', [
      ['0', '0 — <500 mL/day'],
      ['1', '1 — >500 mL/day'],
      ['2', '2 — >1000 mL/day'],
      ['3', '3 — >1500 mL/day'],
      ['4', '4 — >2000 mL/day or severe pain / ileus'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['gvhd-skin', 'gvhd-liver', 'gvhd-gi'], () => safe(o, () => {
      const r = M.gvhdGrade({ skinStage: val('gvhd-skin'), liverStage: val('gvhd-liver'), giStage: val('gvhd-gi') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Overall grade', value: r.hasGvhd ? r.gradeRoman : 'none' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
