// spec-v550: renderer for the Global Limb Anatomic Staging System (GLASS). Group G. Two grade selects, two
// calcification selects and the inframalleolar modifier, under h2 section headings (never h3 - an h3 under
// the page h1 is a heading-level skip).
//
// The inframalleolar modifier sits under its OWN heading, separated from the two segment grades, because it
// is a descriptor appended to the stage and never an input to the matrix. Grouping it with the graded
// segments would imply it feeds them (lib/glass-stage-v550.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile describes an anatomic
// pattern; it never diagnoses limb-threatening ischemia and never indicates revascularization.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/glass-stage-v550.js';
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
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const YESNO = [['no', 'No'], ['yes', 'Yes']];

export const renderers = {
  'glass-stage'(root) {
    note(root, 'The Global Limb Anatomic Staging System grades the femoropopliteal and infrapopliteal segments of a target arterial path from 0 to 4 each, then looks the pair up in a matrix to give stage I, II or III. It describes the anatomic pattern of disease and estimates what an endovascular attempt at that path would face — a companion to the WIfI limb-threat stage and the Rutherford and Fontaine symptom stages, which answer different questions about the same limb. Grade 0 in both segments is not stage I but “not applicable”: with no significant disease in either segment there is no target arterial path to stage.');

    heading(root, 'Femoropopliteal segment');
    root.appendChild(select('Femoropopliteal grade', 'glass-fp',
      M.FP_GRADES.map((g) => [String(g.value), `${g.value} — ${g.text}`])));
    root.appendChild(select('Severe calcification in this segment? (raises the grade by one, capped at 4)', 'glass-fp-calc', YESNO));

    heading(root, 'Infrapopliteal segment');
    root.appendChild(select('Infrapopliteal grade', 'glass-ip',
      M.IP_GRADES.map((g) => [String(g.value), `${g.value} — ${g.text}`])));
    root.appendChild(select('Severe calcification in this segment? (raises the grade by one, capped at 4)', 'glass-ip-calc', YESNO));

    heading(root, 'Inframalleolar modifier');
    note(root, 'Reported alongside the stage and never inside it. The guideline states that the inframalleolar modifier is not considered in the primary stage assignment, so a P2 limb and a P0 limb with the same segment grades carry the same GLASS stage.');
    root.appendChild(select('Inframalleolar (pedal) modifier', 'glass-im',
      M.IM_MODIFIERS.map((m) => [m.value, `${m.value} — ${m.text}`])));

    const o = out(); root.appendChild(o);
    wire(['glass-fp', 'glass-fp-calc', 'glass-ip', 'glass-ip-calc', 'glass-im'], () => safe(o, () => {
      const r = M.glassStage({
        fp: val('glass-fp'), ip: val('glass-ip'),
        fpCalcification: val('glass-fp-calc'), ipCalcification: val('glass-ip-calc'),
        imModifier: val('glass-im'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.applicable ? `GLASS ${r.stage}, ${r.imModifier}` : `not applicable, ${r.imModifier}` },
        { label: 'Graded segments', value: `FP ${r.fp}, IP ${r.ip}` },
        { label: 'Calcification adjustment', value: r.calcificationApplied ? `applied — from FP ${r.fpBase}, IP ${r.ipBase}` : 'none' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
