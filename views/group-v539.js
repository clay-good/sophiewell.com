// spec-v539: renderer for the ISL staging of peripheral lymphedema. Group G. Three selects under two h2
// section headings, one per axis, because stage and severity are SEPARATE axes the consensus applies
// together (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The stage options carry the elevation and pitting behavior that actually separates them, including that
// pitting FALLS AWAY again in late stage II and stage III. A reader who treats pitting as a severity dial
// reads stage III backwards (lib/isl-lymphedema-v539.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile describes a limb; it
// never diagnoses lymphedema, never distinguishes it from its mimics, and never indicates a treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/isl-lymphedema-v539.js';
import { resultRow } from '../lib/result-copy.js';

const YES_NO = [['no', 'No'], ['yes', 'Yes']];

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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'isl-lymphedema'(root) {
    note(root, 'The International Society of Lymphology staging of peripheral lymphedema. Stage and severity are separate axes applied together: the stage describes what the tissue has become, the severity grade describes how much volume the limb has gained, and neither implies the other. Note that pitting is not a severity dial — it rises from stage I to stage II, then falls away again through late stage II to stage III as fibrosis replaces fluid. It describes a limb; it does not diagnose lymphedema or distinguish it from venous disease, heart or kidney failure, thrombosis, lipedema, or infection.');

    heading(root, 'Stage — what the tissue has become');
    root.appendChild(select('Which description fits the limb? A limb may exhibit more than one stage across different lymphatic territories.', 'isl-stage',
      M.ISL_STAGES.map((s) => [s.value, `${s.label} — ${s.text} ${s.elevation} ${s.pitting}`])));

    heading(root, 'Severity — excess volume compared with the other limb');
    root.appendChild(select('Excess volume difference between limbs', 'isl-severity',
      M.ISL_SEVERITY.map((s) => [s.value, `${s.label} — ${s.text}`])));
    root.appendChild(select('Is the swelling bilateral? The severity grade is an inter-limb comparison, so bilateral swelling understates it.', 'isl-bilateral', YES_NO));

    const o = out(); root.appendChild(o);
    wire(['isl-stage', 'isl-severity', 'isl-bilateral'], () => safe(o, () => {
      const r = M.islLymphedema({
        stage: val('isl-stage'), severity: val('isl-severity'), bilateral: val('isl-bilateral'),
      });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [
        { text: r.band },
        { label: 'Stage', value: r.stageLabel },
        { label: 'Severity by volume', value: r.severityLabel },
      ];
      if (r.bilateral) rows.push({ label: 'Bilateral', value: 'yes — the inter-limb grade understates the disease' });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
