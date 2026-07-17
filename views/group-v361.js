// spec-v361: renderer for Tanner staging / Sexual Maturity Rating (SMR). Group G. The clinician picks
// the development scale (breast / genital / pubic hair) and the stage (1-5); the tile reports the
// standard Marshall-Tanner description.
//
// Same input/render contract as the rest of the codebase: the inputs have real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Tanner stage description; it never asserts a diagnosis (precocious
// or delayed puberty), an age assessment, or a treatment decision (lib/tanner-staging-v361.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/tanner-staging-v361.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. Whether a stage is early or late for age, and the assessment, stay with the treating clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'tanner-staging'(root) {
    note(root, 'Tanner staging / Sexual Maturity Rating (Marshall & Tanner 1969/1970). Pick the development scale and the stage. Three scales - female breast, male genitalia, and pubic hair - each from stage 1 (prepubertal) to stage 5 (adult). Whether a stage is early or late for age (precocious vs delayed puberty) is a clinician judgment. Near-neighbors: mid-parental-height.');
    root.appendChild(select('Development scale', 'tanner-scale', [
      ['breast', 'Breast (female)'],
      ['genital', 'Genital (male)'],
      ['pubic', 'Pubic hair'],
    ]));
    root.appendChild(select('Tanner stage', 'tanner-stage', [
      ['1', 'Stage 1 - prepubertal'],
      ['2', 'Stage 2'],
      ['3', 'Stage 3'],
      ['4', 'Stage 4'],
      ['5', 'Stage 5 - adult'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['tanner-scale', 'tanner-stage'], () => safe(o, () => {
      const r = M.tannerStaging({ scale: val('tanner-scale'), stage: val('tanner-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
