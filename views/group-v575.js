// spec-v575: renderer for the Peradeniya Organophosphorus Poisoning scale. Group G. Inputs under an h2
// section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// Fasciculation is TWO separate yes/no controls rather than one three-level select, because the published
// row is a conjunction (generalized OR continuous = 1; BOTH = 2) rather than a severity ladder. Heart rate
// is a number input so the hole at exactly 40 can be surfaced rather than hidden inside a select
// (lib/peradeniya-op-v575.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile grades severity; it never
// indicates or titrates atropine.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/peradeniya-op-v575.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const opts = (levels) => levels.map((l) => [l.value, `${l.text} — ${l.points} point${l.points === 1 ? '' : 's'}`]);
const YESNO = [['no', 'No'], ['yes', 'Yes']];

export const renderers = {
  'peradeniya-op'(root) {
    note(root, 'The POP scale grades acute organophosphate poisoning severity. Maximum 11, not 12: five parameters score 0-2 but seizures scores 0-1 only. Bands 0-3 mild, 4-7 moderate, 8-11 severe. It must be applied BEFORE treatment — atropine reverses miosis and bradycardia, two of the six parameters.');

    heading(root, 'Clinical parameters, scored before treatment');
    root.appendChild(select('Pupil size', 'pop-pupil', opts(M.PUPIL_LEVELS)));
    note(root, 'The published levels overlap: a pinpoint pupil is also under 2 mm. Pinpoint takes precedence.');
    root.appendChild(select('Respiratory rate', 'pop-resp', opts(M.RESPIRATORY_LEVELS)));
    root.appendChild(number('Heart rate (per minute)', 'pop-hr', '1'));
    note(root, `Levels: above 60 = 0; 41-60 = 1; below 40 = 2. A rate of exactly ${M.UNSCOREABLE_HEART_RATE} falls in NO published level and is refused rather than assigned to a neighbour.`);

    heading(root, 'Fasciculation (a conjunction, not a ladder)');
    note(root, 'Generalized OR continuous scores 1; BOTH scores 2. Intensity is not the axis, so the two attributes are asked separately.');
    root.appendChild(select('Fasciculation generalized?', 'pop-fasc-gen', YESNO));
    root.appendChild(select('Fasciculation continuous?', 'pop-fasc-cont', YESNO));

    heading(root, 'Neurological');
    root.appendChild(select('Level of consciousness', 'pop-loc', opts(M.CONSCIOUSNESS_LEVELS)));
    root.appendChild(select('Seizures — half weight, 0 or 1 only', 'pop-seizures', opts(M.SEIZURE_LEVELS)));

    const ids = ['pop-pupil', 'pop-resp', 'pop-hr', 'pop-fasc-gen', 'pop-fasc-cont', 'pop-loc', 'pop-seizures'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.peradeniyaOp({
        pupil: val('pop-pupil'), respiratory: val('pop-resp'), heartRate: val('pop-hr'),
        fasciculationGeneralized: val('pop-fasc-gen'), fasciculationContinuous: val('pop-fasc-cont'),
        consciousness: val('pop-loc'), seizures: val('pop-seizures'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'POP score', value: `${r.total} of ${r.max}` },
        { label: 'Severity', value: r.band },
        { label: 'Fasciculation', value: `${r.fasciculationPoints} point(s)${r.bothFasciculationAttributes ? ' — both attributes' : ''}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
