// spec-v144 §2: renderers for the six orthopedic fracture-classification tiles
// (gustilo-anderson, garden-classification, weber-ankle, schatzker-classification,
// salter-harris, neer-classification). All are Clinical Scoring & Risk (Group G);
// v144 continues Wave 8 of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v100 §2 classification clarification each tile CONSUMES the clinician's
// read of the film and COMPUTES a class; it is not a no-input reference table.
// Per the spec-v50 §3 clinical-posture note, each tile renders that it frames a
// computed class, not a fixation/operative order in Sophie's voice (spec-v11
// §5.3). A blank required finding renders a complete-the-fields fallback.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ortho-v144.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The class is the cited system’s, computed from the findings you entered — the tile takes your read of the imaging, it does not interpret a radiograph. The management decision — fixation, coverage, referral — stays with the care team and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
// Build a checkbox list from [id, label] pairs; return the list of ids.
function checkList(root, items) {
  for (const [id, label] of items) root.appendChild(checkField(label, id));
  return items.map((i) => i[0]);
}
// A "pick one" select with a leading blank placeholder so a required field starts
// empty (drives the complete-the-fields fallback) — mirrors the v142 pattern.
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}

export const renderers = {
  // ----- 2.1 gustilo-anderson -------------------------------------------
  'gustilo-anderson'(root) {
    note(root, 'Gustilo-Anderson open fracture (Gustilo 1976; III subtypes 1984): the Type III subtype is set by coverage and perfusion, not wound size. Arterial repair → IIIC; flap needed → IIIB; high-energy/extensive soft tissue or wound > 10 cm → at least Type III.');
    root.appendChild(pickField('Wound size', 'gust-wound', [
      { value: 'lt1', text: 'Under 1 cm, clean (Type I range)' },
      { value: '1to10', text: '1–10 cm, moderate (Type II range)' },
      { value: 'gt10', text: 'Over 10 cm (Type III range)' },
    ]));
    const ids = ['gust-wound', ...checkList(root, [
      ['gust-severe', 'Extensive soft-tissue injury or high-energy mechanism (segmental, traumatic amputation, gunshot, farm injury)'],
      ['gust-flap', 'Inadequate soft-tissue coverage requiring a flap (→ IIIB)'],
      ['gust-arterial', 'Arterial injury requiring repair (→ IIIC)'],
    ])];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.gustiloAnderson({ wound: selVal('gust-wound'), severeSoftTissue: chk('gust-severe'), flapCoverage: chk('gust-flap'), arterial: chk('gust-arterial') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: `Type ${r.classification}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 garden-classification --------------------------------------
  'garden-classification'(root) {
    note(root, 'Garden classification (Garden 1961): femoral-neck fracture displacement on the AP film. Grades I–II are stable/nondisplaced; III–IV are unstable/displaced.');
    root.appendChild(pickField('Femoral-neck displacement pattern', 'garden-pat', [
      { value: 'incomplete', text: 'Incomplete, valgus-impacted — nondisplaced (I)' },
      { value: 'complete', text: 'Complete, nondisplaced (II)' },
      { value: 'partial', text: 'Complete, partially displaced (III)' },
      { value: 'full', text: 'Complete, fully displaced (IV)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['garden-pat'], () => safe(o, () => {
      const r = M.gardenClassification({ pattern: selVal('garden-pat') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.classification },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 weber-ankle ------------------------------------------------
  'weber-ankle'(root) {
    note(root, 'Danis-Weber ankle (Weber 1972, AO-adopted): the distal-fibula fracture level relative to the syndesmosis. A below (stable), B at the level (assess the medial side), C above (unstable).');
    root.appendChild(pickField('Distal-fibula fracture level vs the syndesmosis', 'weber-lvl', [
      { value: 'below', text: 'Below the syndesmosis — infrasyndesmotic (A)' },
      { value: 'at', text: 'At the level of the syndesmosis — transsyndesmotic (B)' },
      { value: 'above', text: 'Above the syndesmosis — suprasyndesmotic (C)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['weber-lvl'], () => safe(o, () => {
      const r = M.weberAnkle({ level: selVal('weber-lvl') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.classification },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 schatzker-classification -----------------------------------
  'schatzker-classification'(root) {
    note(root, 'Schatzker classification (Schatzker 1979): tibial-plateau fracture pattern. Types I–III are typically low-energy; IV–VI are high-energy with the worst prognosis.');
    root.appendChild(pickField('Tibial-plateau fracture pattern', 'schatz-pat', [
      { value: 'lateralSplit', text: 'Lateral split (wedge), no depression (I)' },
      { value: 'lateralSplitDepression', text: 'Lateral split-depression (II)' },
      { value: 'lateralDepression', text: 'Lateral pure (central) depression (III)' },
      { value: 'medial', text: 'Medial plateau (IV)' },
      { value: 'bicondylar', text: 'Bicondylar — both plateaus (V)' },
      { value: 'dissociation', text: 'Plateau with metaphyseal-diaphyseal dissociation (VI)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['schatz-pat'], () => safe(o, () => {
      const r = M.schatzkerClassification({ pattern: selVal('schatz-pat') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.classification },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 salter-harris ----------------------------------------------
  'salter-harris'(root) {
    note(root, 'Salter-Harris (Salter & Harris 1963): physeal (growth-plate) fracture pattern — the SALTR mnemonic. Growth-disturbance risk rises ascending I → V; III and IV are intra-articular.');
    root.appendChild(pickField('Physeal-fracture pattern', 'salter-pat', [
      { value: 'physis', text: 'Through the physis only — Slipped (I)' },
      { value: 'metaphysis', text: 'Physis + metaphysis — Above (II, most common)' },
      { value: 'epiphysis', text: 'Physis + epiphysis — Lower (III)' },
      { value: 'both', text: 'Metaphysis + physis + epiphysis — Through (IV)' },
      { value: 'crush', text: 'Crush/compression of the physis — cRush (V)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['salter-pat'], () => safe(o, () => {
      const r = M.salterHarris({ pattern: selVal('salter-pat') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.classification },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 neer-classification ----------------------------------------
  'neer-classification'(root) {
    note(root, 'Neer classification (Neer 1970): proximal-humerus fracture. Check each of the four segments that is displaced (> 1 cm separation OR > 45° angulation). The part count is 1 + the number of displaced segments — an undisplaced fracture is one-part however many fracture lines it has.');
    const ids = checkList(root, [
      ['neer-art', 'Articular surface (anatomic neck) displaced'],
      ['neer-gt', 'Greater tuberosity displaced'],
      ['neer-lt', 'Lesser tuberosity displaced'],
      ['neer-shaft', 'Surgical neck / shaft displaced'],
      ['neer-disloc', 'Fracture-dislocation present'],
    ]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.neerClassification({ articular: chk('neer-art'), greaterTuberosity: chk('neer-gt'), lesserTuberosity: chk('neer-lt'), shaft: chk('neer-shaft'), dislocation: chk('neer-disloc') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: r.classification },
        { label: 'Displaced parts', value: `${r.displaced.length}/4` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
