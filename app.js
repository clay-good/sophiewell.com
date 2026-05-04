// sophiewell.com - vanilla ES module application.
// All DOM updates use textContent or createElement. Raw HTML insertion is forbidden.

import { renderers as RA } from './views/group-a.js';
import { renderers as RB } from './views/group-b.js';
import { renderers as RC } from './views/group-c.js';
import { renderers as RD } from './views/group-d.js';
import { renderers as RE } from './views/group-e.js';
import { renderers as RF } from './views/group-f.js';
import { renderers as RG } from './views/group-g.js';
import { renderers as RH } from './views/group-h.js';
import { renderers as RI } from './views/group-i.js';
import { META } from './lib/meta.js';
import { fetchJson } from './lib/data.js';
import { copyButton } from './lib/clipboard.js';
import { installKeyboard } from './lib/keyboard.js';
import { parseHash, buildHash, patchHash } from './lib/hash.js';

const RENDERERS = { ...RA, ...RB, ...RC, ...RD, ...RE, ...RF, ...RG, ...RH, ...RI };

// ----- Utility registry ----------------------------------------------------
// Source of truth for routes, names, group, audiences, and clinical flag.
// Group letters: A Codes, B Pricing, C Patient Tools, D Provider Lookup,
// E Clinical Math, F Medication, G Scoring, H Workflow.

const UTILITIES = [
  // Group A: Code Lookup
  { id: 'icd10', name: 'ICD-10-CM Code Lookup', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'hcpcs', name: 'HCPCS Level II Code Lookup', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'cpt', name: 'CPT Code Reference', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'ndc', name: 'NDC Drug Code Lookup', group: 'A', audiences: ['patients', 'billers', 'clinicians', 'educators'], clinical: false },
  { id: 'pos-codes', name: 'Place of Service Code Lookup', group: 'A', audiences: ['billers'], clinical: false },
  { id: 'modifier-codes', name: 'Modifier Code Lookup', group: 'A', audiences: ['billers'], clinical: false },
  { id: 'revenue-codes', name: 'Revenue Code Lookup', group: 'A', audiences: ['billers'], clinical: false },
  { id: 'carc', name: 'Claim Adjustment Reason Code Lookup', group: 'A', audiences: ['patients', 'billers'], clinical: false },
  { id: 'rarc', name: 'Remittance Advice Remark Code Lookup', group: 'A', audiences: ['patients', 'billers'], clinical: false },
  { id: 'ncci', name: 'NCCI Procedure-to-Procedure Edit Lookup', group: 'A', audiences: ['billers'], clinical: false },
  { id: 'mue', name: 'Medically Unlikely Edits Lookup', group: 'A', audiences: ['billers'], clinical: false },
  { id: 'lcd', name: 'LCD and NCD Coverage Lookup', group: 'A', audiences: ['billers'], clinical: false },
  // Group B: Pricing and Cost Reference
  { id: 'mpfs', name: 'Medicare Physician Fee Schedule Lookup', group: 'B', audiences: ['patients', 'billers'], clinical: false },
  { id: 'nadac', name: 'NADAC Drug Pricing Lookup', group: 'B', audiences: ['patients', 'clinicians'], clinical: false },
  { id: 'ratio', name: 'Charge-to-Medicare Ratio Calculator', group: 'B', audiences: ['patients', 'billers'], clinical: false },
  { id: 'hospital-prices', name: 'Hospital Price Transparency Lookup', group: 'B', audiences: ['patients', 'billers'], clinical: false },
  { id: 'oop', name: 'Out-of-Pocket Cost Estimator', group: 'B', audiences: ['patients'], clinical: false },
  // Group C: Patient Bill and Insurance Tools
  { id: 'decoder', name: 'Medical Bill Decoder', group: 'C', audiences: ['patients', 'billers'], clinical: false },
  { id: 'insurance', name: 'Insurance Card Decoder', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'eob-decoder', name: 'Explanation of Benefits Decoder', group: 'C', audiences: ['patients', 'billers'], clinical: false },
  { id: 'no-surprises', name: 'No Surprises Act Eligibility Checker', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'gfe', name: 'Good Faith Estimate Dispute Threshold Checker', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'state-rights', name: 'State Patient Rights Reference', group: 'C', audiences: ['patients', 'educators'], clinical: false },
  // Group D: Provider and Plan Lookup
  { id: 'npi', name: 'NPI Provider Lookup', group: 'D', audiences: ['patients', 'billers'], clinical: false },
  { id: 'oig', name: 'OIG Exclusions Lookup', group: 'D', audiences: ['billers'], clinical: false },
  { id: 'opt-out', name: 'Medicare Opt-Out List Lookup', group: 'D', audiences: ['patients', 'billers'], clinical: false },
  // Group E: Clinical Math and Conversions
  { id: 'unit-converter', name: 'Unit Converter', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bmi', name: 'BMI Calculator', group: 'E', audiences: ['patients', 'clinicians', 'educators'], clinical: true },
  { id: 'bsa', name: 'Body Surface Area', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'map', name: 'Mean Arterial Pressure', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'anion-gap', name: 'Anion Gap', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'corrected-calcium', name: 'Corrected Calcium for Albumin', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'corrected-sodium', name: 'Corrected Sodium for Hyperglycemia', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'aa-gradient', name: 'A-a Gradient', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'egfr', name: 'Estimated GFR (CKD-EPI 2021)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cockcroft-gault', name: 'Cockcroft-Gault Creatinine Clearance', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pack-years', name: 'Pack-Years', group: 'E', audiences: ['patients', 'clinicians', 'educators'], clinical: true },
  { id: 'due-date', name: 'Naegele Pregnancy Due Date', group: 'E', audiences: ['patients', 'clinicians', 'educators'], clinical: true },
  { id: 'qtc', name: 'QTc Correction', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pf-ratio', name: 'P/F Ratio', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // Group F: Medication and Infusion
  { id: 'drip-rate', name: 'Drip Rate Calculator', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'weight-dose', name: 'Weight-Based Dose', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'conc-rate', name: 'Concentration-to-Rate', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'peds-dose', name: 'Pediatric Dose Safety Bounds', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'insulin-drip', name: 'Insulin Drip Math', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'anticoag-reversal', name: 'Anticoagulation Reversal Reference', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'high-alert', name: 'High-Alert Medication Reference', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // Group G: Clinical Scoring and Reference
  { id: 'gcs', name: 'Glasgow Coma Scale', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'apgar', name: 'APGAR', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'peds-vitals', name: 'Pediatric Vital Signs by Age', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'lab-ranges', name: 'Common Lab Reference Ranges', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'abg', name: 'ABG Interpretation Walkthrough', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'wells-pe', name: 'Wells Score for PE', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'wells-dvt', name: 'Wells Score for DVT', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'chads', name: 'CHA2DS2-VASc', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hasbled', name: 'HAS-BLED', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nihss', name: 'NIH Stroke Scale', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'asa', name: 'ASA Physical Status Reference', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mallampati', name: 'Mallampati Class Reference', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'beers', name: 'Beers Criteria Drug-Condition Lookup', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // Group H: Preparation and Workflow
  { id: 'prep', name: 'Appointment Prep Question Generator', group: 'H', audiences: ['patients'], clinical: false },
  { id: 'prior-auth', name: 'Prior Authorization Checklist Generator', group: 'H', audiences: ['billers'], clinical: false },
  // Group I: Field Medicine
  { id: 'peds-weight-dose', name: 'Pediatric Weight-to-Dose Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'adult-arrest-ref', name: 'Adult Cardiac Arrest Drug Reference', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'peds-arrest-ref',  name: 'Pediatric Cardiac Arrest Drug Reference', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'defib',            name: 'Defibrillation Energy Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'cincinnati',       name: 'Cincinnati Prehospital Stroke Scale', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'fast',             name: 'FAST and BE-FAST Stroke Assessment', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'field-triage',     name: 'Trauma Triage Decision Tool (CDC)', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'start-triage',     name: 'START Adult MCI Triage', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'jumpstart-triage', name: 'JumpSTART Pediatric MCI Triage', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'bsa_burn',         name: 'Burn Surface Area Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'burn-fluid',       name: 'Burn Fluid Resuscitation Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'hypothermia',      name: 'Hypothermia Staging Reference', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'heat-illness',     name: 'Heat Illness Staging Reference', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'peds-ett',         name: 'Pediatric ETT Size Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'toxidromes',       name: 'Toxidrome Reference', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'naloxone',         name: 'Naloxone Dosing Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field', 'patients'], clinical: true },
  { id: 'ems-doc',          name: 'EMS Documentation Helper', group: 'I', audiences: ['clinicians', 'field'], clinical: false },
];

const UTIL_BY_ID = new Map(UTILITIES.map((u) => [u.id, u]));

const CLINICAL_NOTICE_TEXT =
  'This is a math aid for verification. Institutional protocols and clinician judgment govern any clinical decision.';

// ----- DOM helpers ---------------------------------------------------------

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const key of Object.keys(attrs)) {
      const value = attrs[key];
      if (value === false || value === null || value === undefined) continue;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key.startsWith('data-')) node.setAttribute(key, value);
      else if (key.startsWith('aria-')) node.setAttribute(key, value);
      else if (key === 'href' || key === 'type' || key === 'role' || key === 'id' || key === 'for') node.setAttribute(key, value);
      else node.setAttribute(key, value);
    }
  }
  if (children) {
    for (const child of children) {
      if (child === null || child === undefined) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
  }
  return node;
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

// ----- Filter state --------------------------------------------------------

const filterState = {
  audience: 'all',
  group: 'all',
  query: '',
};

function tileMatches(tile) {
  const group = tile.getAttribute('data-group') || '';
  const audiences = (tile.getAttribute('data-audiences') || '').split(/\s+/).filter(Boolean);
  if (filterState.group !== 'all' && group !== filterState.group) return false;
  if (filterState.audience !== 'all' && !audiences.includes(filterState.audience)) return false;
  if (filterState.query) {
    const q = filterState.query.toLowerCase();
    const text = (tile.textContent || '').toLowerCase();
    if (!text.includes(q)) return false;
  }
  return true;
}

function applyFilters() {
  const tiles = document.querySelectorAll('#tile-grid .tool-card');
  let visible = 0;
  const sectionVisible = new Map();
  tiles.forEach((tile) => {
    const show = tileMatches(tile);
    tile.hidden = !show;
    if (show) visible += 1;
    const section = tile.closest('.home-section');
    if (section) {
      sectionVisible.set(section, (sectionVisible.get(section) || 0) + (show ? 1 : 0));
    }
  });
  // Hide entire section if no cards match.
  sectionVisible.forEach((count, section) => {
    section.hidden = count === 0;
  });
  const empty = document.getElementById('empty-state');
  if (empty) empty.hidden = visible !== 0;
}

// Delegated tile click. Targets `document` so it survives the
// captureHomeSnapshot / restoreHome cloneNode cycle (which would otherwise
// strip per-element listeners). Setting location.hash triggers route().
// Guarded so this module can still be imported under Node for unit tests.
if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    if (!event.target || typeof event.target.closest !== 'function') return;
    // Don't swallow clicks on nested action buttons (e.g., the Pin button
    // inside a tool-card). Their own handlers call stopPropagation, but if
    // any child carries data-no-route, skip.
    const ignore = event.target.closest('[data-no-route]');
    if (ignore) return;
    const card = event.target.closest('.tool-card');
    if (!card) return;
    const id = card.getAttribute('data-tool');
    if (!id) return;
    event.preventDefault();
    // Force a route refresh even if the user clicks the card matching the
    // currently-active route (e.g., from the Pinned section).
    if (location.hash === '#' + id) {
      currentRouteId = null;
      route();
    } else {
      location.hash = '#' + id;
    }
  });
}

// Group letter → breadcrumb label.
const GROUP_LABELS = {
  A: 'A · Code Lookup',
  B: 'B · Pricing & Cost Reference',
  C: 'C · Patient Bill & Insurance',
  D: 'D · Provider & Plan Lookup',
  E: 'E · Clinical Math & Conversions',
  F: 'F · Medication & Infusion',
  G: 'G · Clinical Scoring & Reference',
  H: 'H · Preparation & Workflow',
  I: 'I · Field Medicine',
};

function wireFilters() {
  const groups = document.querySelectorAll('.toggle-group');
  groups.forEach((group) => {
    const filterName = group.getAttribute('data-filter');
    const buttons = group.querySelectorAll('.toggle');
    group.addEventListener('click', (event) => {
      const btn = event.target.closest('.toggle');
      if (!btn) return;
      const value = btn.getAttribute('data-value');
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      filterState[filterName] = value;
      applyFilters();
    });
  });

  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', () => {
      filterState.query = search.value.trim();
      applyFilters();
    });
  }
}

// ----- Routing -------------------------------------------------------------

const HOME_VIEW_HTML_ID = 'home-view-marker';

function getMain() {
  return document.getElementById('main');
}

let homeViewSnapshot = null;

function captureHomeSnapshot() {
  const main = getMain();
  if (!main || homeViewSnapshot) return;
  homeViewSnapshot = main.cloneNode(true);
  homeViewSnapshot.id = HOME_VIEW_HTML_ID;
}

function restoreHome() {
  const main = getMain();
  if (!main || !homeViewSnapshot) return;
  clear(main);
  const fresh = homeViewSnapshot.cloneNode(true);
  while (fresh.firstChild) main.appendChild(fresh.firstChild);
  // Re-wire filters and re-apply state to the restored DOM.
  wireFilters();
  // Restore filter UI state.
  document.querySelectorAll('.toggle-group').forEach((group) => {
    const filterName = group.getAttribute('data-filter');
    const value = filterState[filterName];
    group.querySelectorAll('.toggle').forEach((b) => {
      const active = b.getAttribute('data-value') === value;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  });
  const search = document.getElementById('search');
  if (search) search.value = filterState.query;
  applyFilters();
  document.title = 'Sophie Well';
}

// spec-v2 section 4.1: hash-based pinning. Render the Pinned section above
// the tile grid on the home view, with Unpin affordances. Tiles in the main
// grid get a Pin affordance.
function renderPinnedSection() {
  const grid = document.getElementById('tile-grid');
  if (!grid) return;
  // Wire Pin button on every tool-card (idempotent).
  grid.querySelectorAll('.tool-card').forEach((tile) => {
    if (tile.querySelector('.pin-btn')) return;
    const id = tile.getAttribute('data-tool');
    if (!id) return;
    const btn = el('button', { type: 'button', class: 'pin-btn', text: 'Pin', 'aria-label': `Pin ${id}` });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePin(id);
    });
    tile.appendChild(btn);
  });

  const { pinned } = parseHash(window.location.hash);
  let section = document.getElementById('pinned-section');
  const homeView = document.getElementById('home-view');
  if (!section && homeView) {
    section = el('section', { id: 'pinned-section', 'aria-labelledby': 'pinned-heading' });
    section.appendChild(el('h2', { id: 'pinned-heading', text: 'Pinned' }));
    section.appendChild(el('div', { id: 'pinned-grid', class: 'home-grid' }));
    homeView.insertBefore(section, homeView.firstChild);
  }
  if (!section) return;
  const pinnedGrid = section.querySelector('#pinned-grid');
  clear(pinnedGrid);
  if (!pinned.length) { section.hidden = true; return; }
  section.hidden = false;
  for (const id of pinned) {
    const original = grid.querySelector(`.tool-card[data-tool="${id}"]`);
    if (!original) continue;
    const tile = original.cloneNode(true);
    const oldPin = tile.querySelector('.pin-btn');
    if (oldPin) oldPin.remove();
    const unpin = el('button', { type: 'button', class: 'pin-btn', text: 'Unpin', 'aria-label': `Unpin ${id}` });
    unpin.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePin(id);
    });
    tile.appendChild(unpin);
    pinnedGrid.appendChild(tile);
  }
}

function togglePin(id) {
  const cur = parseHash(window.location.hash);
  const has = cur.pinned.includes(id);
  const next = has ? cur.pinned.filter((x) => x !== id) : [...cur.pinned, id];
  const newHash = buildHash({ ...cur, pinned: next });
  window.history.replaceState(null, '', newHash);
  renderPinnedSection();
}

// spec-v2 section 4.3: hash-based calculator input state. After a tool body
// is rendered, populate inputs from `q=...` and start writing changes back.
function applyHashState(body) {
  const { state } = parseHash(window.location.hash);
  if (!state || Object.keys(state).length === 0) return;
  for (const [k, v] of Object.entries(state)) {
    const node = body.querySelector(`#${CSS.escape(k)}`) || document.getElementById(k);
    if (!node) continue;
    if (node.tagName === 'SELECT') node.value = v;
    else if (node.type === 'checkbox') node.checked = v === '1' || v === 'true';
    else node.value = v;
    const evt = node.tagName === 'SELECT' ? 'change' : (node.type === 'checkbox' ? 'change' : 'input');
    node.dispatchEvent(new Event(evt, { bubbles: true }));
  }
}

function trackHashState(body) {
  const writeState = () => {
    const state = {};
    body.querySelectorAll('input, select, textarea').forEach((node) => {
      if (!node.id) return;
      // Skip ephemeral pieces (search boxes inside lookup tools, the bill
      // textarea, free-text fields with no semantic meaning).
      if (node.tagName === 'TEXTAREA') return;
      if (node.type === 'checkbox') {
        if (node.checked) state[node.id] = '1';
      } else if (node.value !== '' && node.value != null) {
        state[node.id] = String(node.value);
      }
    });
    window.history.replaceState(null, '', patchHash({ state }));
  };
  body.addEventListener('input', writeState);
  body.addEventListener('change', writeState);
}

// spec-v2 sections 5.1, 5.2, 5.3: inline citation, source stamp, and
// "Test with example" button rendered uniformly above every utility body.
function renderMetaBlock(util) {
  const meta = META[util.id];
  if (!meta) return null;
  const block = el('div', { class: 'tool-meta' });

  if (meta.citation) {
    block.appendChild(el('p', { class: 'citation', text: `Citation: ${meta.citation}` }));
  }

  if (meta.source) {
    const stamp = el('p', { class: 'source-stamp', text: `Source: ${meta.source.label} (loading version...)` });
    block.appendChild(stamp);
    fetchJson(`data/${meta.source.dataset}/manifest.json`).then((m) => {
      stamp.textContent = `Source: ${meta.source.label}, fetched ${m.fetchDate}`;
    }).catch(() => {
      stamp.textContent = `Source: ${meta.source.label}`;
    });
  }

  if (meta.example) {
    const btn = el('button', { type: 'button', class: 'example-btn', text: 'Test with example' });
    const note = el('span', { class: 'example-expected muted' });
    btn.addEventListener('click', () => {
      for (const [id, value] of Object.entries(meta.example.fields)) {
        const elInput = document.getElementById(id);
        if (!elInput) continue;
        if (elInput.tagName === 'SELECT') elInput.value = value;
        else elInput.value = value;
        elInput.dispatchEvent(new Event(elInput.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
      }
      note.textContent = ` Expected: ${meta.example.expected}`;
    });
    block.appendChild(el('p', { class: 'example-row' }, [btn, note]));
  }

  // spec-v2 section 3.2: a single "Copy all" button that grabs whatever the
  // results region currently shows. Per-result copy buttons live in the
  // utility renderers; this is the universal fallback.
  const copyLive = el('span', { class: 'copy-live visually-hidden', 'aria-live': 'polite', role: 'status' });
  const copyAllBtn = copyButton(() => {
    const res = document.getElementById('q-results') || document.getElementById('tool-body');
    return res ? (res.innerText || res.textContent || '') : '';
  }, { label: 'Copy all', live: copyLive });
  block.appendChild(el('p', { class: 'copy-row' }, [copyAllBtn, copyLive]));

  return block.children.length ? block : null;
}

function renderToolView(util) {
  const main = getMain();
  if (!main) return;
  clear(main);

  // Breadcrumb (replaces the old "Back to tools" paragraph).
  const breadcrumbBack = el('button', {
    type: 'button',
    class: 'breadcrumb-back',
    'aria-label': 'Back to all tools',
    text: '← All tools',
  });
  breadcrumbBack.addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = '#/';
  });
  const trail = el('span', { class: 'breadcrumb-trail' }, [
    el('span', { class: 'bc-group', text: GROUP_LABELS[util.group] || util.group }),
    el('span', { 'aria-hidden': 'true', text: ' / ' }),
    el('span', { class: 'bc-current', text: util.name }),
  ]);
  main.appendChild(el('div', { class: 'breadcrumb' }, [breadcrumbBack, trail]));

  // Use <section>, not <main>, so we don't nest a <main> inside <main id="main">
  // (HTML disallows multiple main landmarks; some screen readers also get
  // confused). The .content class still gets the encryptalotta panel chrome.
  const content = el('section', { class: 'content', 'aria-label': util.name });
  content.appendChild(el('h1', { text: util.name }));

  if (util.clinical && util.group !== 'I') {
    content.appendChild(
      el('p', { class: 'clinical-notice', role: 'note', text: CLINICAL_NOTICE_TEXT })
    );
  }

  const metaBlock = renderMetaBlock(util);
  if (metaBlock) content.appendChild(metaBlock);

  const body = el('div', { id: 'tool-body', class: 'tool-body' });
  content.appendChild(body);

  // Attach to the live DOM before invoking the renderer. Several renderers
  // call document.getElementById on inputs they just appended, which only
  // works once `body` is part of the document.
  main.appendChild(content);

  const renderer = RENDERERS[util.id];
  if (renderer) {
    try {
      renderer(body);
      Promise.resolve().then(() => { applyHashState(body); trackHashState(body); });
    } catch (err) {
      console.error(`[sophiewell] renderer threw for tool "${util.id}":`, err);
      body.appendChild(el('p', { class: 'muted', text: `Error rendering tool: ${err.message}` }));
    }
  } else {
    console.warn(`[sophiewell] no renderer registered for tool "${util.id}"  -  showing coming-soon placeholder`);
    body.appendChild(
      el('p', {
        class: 'tool-description',
        text: 'This tool is coming soon. The data and renderer for this calculator are still being prepared.',
      })
    );
  }

  content.appendChild(
    el('section', { class: 'tool-sources', 'aria-labelledby': 'sources-heading' }, [
      el('h2', { id: 'sources-heading', text: 'Data sources' }),
      el('p', { class: 'muted', text: 'See docs/data-sources.md and docs/clinical-citations.md for the full source catalog and citations.' }),
    ])
  );
  document.title = util.name + ' | Sophie Well';

  // Always reset scroll so the new view is visible.
  window.scrollTo({ top: 0, behavior: 'auto' });

  // Move focus to the heading for screen reader users.
  const h1 = content.querySelector('h1');
  if (h1) {
    h1.setAttribute('tabindex', '-1');
    h1.focus({ preventScroll: true });
  }
}

let currentRouteId = null;

function route() {
  const parsed = parseHash(window.location.hash);
  const id = parsed.route;
  if (!id) {
    currentRouteId = null;
    restoreHome();
    renderPinnedSection();
    return;
  }
  if (id === 'changelog' || id === 'stability') {
    if (currentRouteId !== id) {
      currentRouteId = id;
      renderDocView(id);
    }
    return;
  }
  const util = UTIL_BY_ID.get(id);
  if (util) {
    if (currentRouteId !== id) {
      currentRouteId = id;
      renderToolView(util);
    }
  } else {
    currentRouteId = null;
    restoreHome();
  }
}

function renderDocView(id) {
  const main = getMain();
  if (!main) return;
  const path = id === 'changelog' ? 'CHANGELOG.md' : 'docs/stability.md';
  const title = id === 'changelog' ? 'Changelog' : 'Stability commitments';
  clear(main);
  const back = el('button', { type: 'button', class: 'breadcrumb-back', 'aria-label': 'Back to all tools', text: '← All tools' });
  back.addEventListener('click', (e) => { e.preventDefault(); location.hash = '#/'; });
  main.appendChild(el('div', { class: 'breadcrumb' }, [
    back,
    el('span', { class: 'breadcrumb-trail' }, [
      el('span', { class: 'bc-current', text: title }),
    ]),
  ]));
  const content = el('section', { class: 'content', 'aria-label': title });
  content.appendChild(el('h1', { text: title }));
  const body = el('article', { class: 'doc-body' });
  content.appendChild(body);
  main.appendChild(content);
  document.title = `${title} | Sophie Well`;
  window.scrollTo({ top: 0, behavior: 'auto' });

  fetch(path).then((r) => r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))).then((md) => {
    // Minimal markdown rendering: split paragraphs on blank lines; render
    // headings (# / ## / ###) as h2 / h3 / h4; bullet lines as <ul><li>.
    const blocks = md.replace(/\r\n/g, '\n').split(/\n\n+/);
    for (const blk of blocks) {
      const trimmed = blk.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('### ')) body.appendChild(el('h4', { text: trimmed.slice(4) }));
      else if (trimmed.startsWith('## ')) body.appendChild(el('h3', { text: trimmed.slice(3) }));
      else if (trimmed.startsWith('# ')) body.appendChild(el('h2', { text: trimmed.slice(2) }));
      else if (/^[-*] /.test(trimmed)) {
        const ul = el('ul');
        for (const line of trimmed.split('\n')) {
          if (/^[-*] /.test(line.trim())) ul.appendChild(el('li', { text: line.trim().slice(2) }));
        }
        body.appendChild(ul);
      } else {
        body.appendChild(el('p', { text: trimmed }));
      }
    }
  }).catch((err) => {
    body.appendChild(el('p', { class: 'muted', text: `Could not load: ${err.message}` }));
  });
}

// ----- Service worker registration ----------------------------------------

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const isHttps = window.location.protocol === 'https:';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isHttps && !isLocal) return;
  // The service worker file is added in step 6.
  navigator.serviceWorker.register('sw.js').catch(() => {
    // Silent: offline support is best-effort.
  });
}

// ----- Boot ----------------------------------------------------------------

function boot() {
  captureHomeSnapshot();
  wireFilters();
  applyFilters();
  renderPinnedSection();
  installKeyboard();
  window.addEventListener('hashchange', route);
  route();
  registerServiceWorker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

export { UTILITIES, UTIL_BY_ID };
