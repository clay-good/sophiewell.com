// spec-v48: per-tile derivation block ("where does this come from?").
//
// Reads META[id].derivation (see spec-v48.md §3) and emits a closed-by-default
// <details> block summarizing the formula, original population, validity, and
// the verbatim source quote. When `components` is present, exposes an
// updateDerivationSteps(detailsEl, meta, inputs) helper that re-fills the
// per-input contribution list whenever inputs change.
//
// Pure DOM — no innerHTML, no third-party deps. Safe in browsers that support
// <details>; the no-script fallback shows nothing (the block is collapsed
// content, not load-blocking).

import { el, clear } from './dom.js';

const STEPS_DATA_ATTR = 'data-derivation-steps';

export function renderDerivation(meta) {
  if (!meta || !meta.derivation) return null;
  const d = meta.derivation;
  validate(d);

  const details = el('details', { class: 'tile-derivation' });
  details.appendChild(el('summary', { text: 'Where does this come from?' }));

  const body = el('section');
  body.appendChild(el('h4', { text: 'Formula' }));
  body.appendChild(el('pre', { class: 'tile-derivation-formula', text: d.formula }));
  body.appendChild(el('h4', { text: 'Original population' }));
  body.appendChild(el('p', { text: d.population }));
  body.appendChild(el('h4', { text: 'Limits of validity' }));
  body.appendChild(el('p', { text: d.validity }));
  body.appendChild(el('h4', { text: 'Source' }));
  body.appendChild(el('blockquote', { text: d.source }));
  details.appendChild(body);

  if (Array.isArray(d.components) && d.components.length > 0) {
    const steps = el('section', {
      class: 'tile-derivation-steps',
      'aria-live': 'polite',
    });
    steps.setAttribute(STEPS_DATA_ATTR, '1');
    details.appendChild(steps);
  }

  return details;
}

export function updateDerivationSteps(detailsEl, meta, inputs) {
  if (!detailsEl || !meta || !meta.derivation) return;
  const d = meta.derivation;
  if (!Array.isArray(d.components) || d.components.length === 0) return;
  const steps = detailsEl.querySelector(`[${STEPS_DATA_ATTR}]`);
  if (!steps) return;

  clear(steps);
  steps.appendChild(el('h4', { text: 'Your inputs' }));
  const ol = el('ol');
  let total = 0;
  for (const c of d.components) {
    const value = inputs ? inputs[c.inputKey] : undefined;
    const pts = scoreComponent(c, value);
    total += pts;
    const sign = pts > 0 ? '+' : '';
    const inputLabel = formatInput(value);
    ol.appendChild(el('li', { text: `${sign}${pts} — ${c.label} (input: ${inputLabel})` }));
  }
  const bandText = d.bands ? bandFor(d.bands, total) : '';
  const totalLi = el('li');
  totalLi.appendChild(el('strong', { text: `Total: ${formatTotal(total)}${bandText ? ` → ${bandText}` : ''}` }));
  ol.appendChild(totalLi);
  steps.appendChild(ol);
}

function scoreComponent(c, value) {
  if (typeof c.points === 'function') return Number(c.points(value)) || 0;
  if (typeof c.points !== 'number') return 0;
  if (typeof value === 'boolean') return value ? c.points : 0;
  if (typeof value === 'number') return value !== 0 ? c.points : 0;
  if (value === undefined || value === null || value === '') return 0;
  return c.points;
}

function bandFor(bands, total) {
  for (const b of bands) {
    if (Array.isArray(b.range)) {
      const [lo, hi] = b.range;
      if (total >= lo && total <= hi) return b.label;
    } else if (b.range && typeof b.range === 'object') {
      const { op, value } = b.range;
      if (op === '>=' && total >= value) return b.label;
      if (op === '<=' && total <= value) return b.label;
      if (op === '>' && total > value) return b.label;
      if (op === '<' && total < value) return b.label;
    }
  }
  return '';
}

function formatInput(v) {
  if (v === true) return 'yes';
  if (v === false) return 'no';
  if (v === undefined || v === null || v === '') return '—';
  return String(v);
}

function formatTotal(n) {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 10) / 10);
}

function validate(d) {
  const required = ['formula', 'population', 'units', 'validity', 'source'];
  for (const k of required) {
    if (d[k] === undefined || d[k] === null) {
      throw new Error(`derivation: missing required field "${k}"`);
    }
  }
  if (typeof d.formula !== 'string') throw new Error('derivation.formula must be a string');
  if (typeof d.population !== 'string') throw new Error('derivation.population must be a string');
  if (typeof d.validity !== 'string') throw new Error('derivation.validity must be a string');
  if (typeof d.source !== 'string') throw new Error('derivation.source must be a string');
  if (typeof d.units !== 'object') throw new Error('derivation.units must be an object');
}
