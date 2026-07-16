// spec-v328: renderer for the Montreal classification of IBD.
// Group G. The clinician picks the disease (Crohn's or UC) and the relevant axes; the tile
// composes the Montreal phenotype.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the phenotype; it never asserts a diagnosis or a
// treatment decision (lib/montreal-ibd-v328.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/montreal-ibd-v328.js';
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
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const IDS = ['mibd-disease', 'mibd-age', 'mibd-loc', 'mibd-l4', 'mibd-beh', 'mibd-p', 'mibd-ext', 'mibd-sev'];

export const renderers = {
  'montreal-ibd'(root) {
    note(root, 'Montreal classification of IBD (Silverberg 2005). Choose the disease, then the relevant axes. Crohn’s uses age (A), location (L), and behavior (B); ulcerative colitis uses extent (E) and severity (S). Near-neighbors: harvey-bradshaw.');
    root.appendChild(select('Disease', 'mibd-disease', [
      ['crohn', 'Crohn’s disease'],
      ['uc', 'Ulcerative colitis'],
    ]));

    note(root, 'For Crohn’s disease:');
    root.appendChild(select('Age at diagnosis (A)', 'mibd-age', [
      ['A1', 'A1 — ≤ 16 years'],
      ['A2', 'A2 — 17–40 years'],
      ['A3', 'A3 — > 40 years'],
    ]));
    root.appendChild(select('Location (L)', 'mibd-loc', [
      ['L1', 'L1 — ileal'],
      ['L2', 'L2 — colonic'],
      ['L3', 'L3 — ileocolonic'],
    ]));
    root.appendChild(check('Isolated upper-GI disease (+L4 modifier)', 'mibd-l4'));
    root.appendChild(select('Behavior (B)', 'mibd-beh', [
      ['B1', 'B1 — non-stricturing, non-penetrating'],
      ['B2', 'B2 — stricturing'],
      ['B3', 'B3 — penetrating'],
    ]));
    root.appendChild(check('Perianal disease (p modifier)', 'mibd-p'));

    note(root, 'For ulcerative colitis:');
    root.appendChild(select('Extent (E)', 'mibd-ext', [
      ['E1', 'E1 — ulcerative proctitis'],
      ['E2', 'E2 — left-sided (distal)'],
      ['E3', 'E3 — extensive (pancolitis)'],
    ]));
    root.appendChild(select('Severity (S)', 'mibd-sev', [
      ['S0', 'S0 — clinical remission'],
      ['S1', 'S1 — mild'],
      ['S2', 'S2 — moderate'],
      ['S3', 'S3 — severe'],
    ]));

    const o = out(); root.appendChild(o);
    wire(IDS, () => safe(o, () => {
      const r = M.montrealIbd({
        disease: val('mibd-disease'),
        crohnAge: val('mibd-age'), crohnLocation: val('mibd-loc'), crohnUpperGI: chk('mibd-l4'),
        crohnBehavior: val('mibd-beh'), crohnPerianal: chk('mibd-p'),
        ucExtent: val('mibd-ext'), ucSeverity: val('mibd-sev'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Phenotype', value: r.phenotype },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
