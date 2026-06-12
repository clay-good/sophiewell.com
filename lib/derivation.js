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
import { fmt } from './num.js';

const STEPS_DATA_ATTR = 'data-derivation-steps';

export function renderDerivation(meta) {
  if (!meta || !meta.derivation) return null;
  const d = meta.derivation;
  validate(d);

  const details = el('details', { class: 'tile-derivation' });
  details.appendChild(el('summary', { text: 'Where does this come from?' }));

  // The labels are term->definition pairs, not document sections, so they are a
  // <dl> rather than headings. Emitting them as <h4> under the page <h1> (with
  // no h2/h3 between) was a heading-level skip (WCAG 1.3.1 / 2.4.10); a
  // description list keeps the same visual structure while staying out of the
  // heading outline entirely, regardless of what heading precedes the block.
  const body = el('section');
  const dl = el('dl', { class: 'tile-derivation-dl' });
  dl.appendChild(el('dt', { text: 'Formula' }));
  dl.appendChild(el('dd', null, [el('pre', { class: 'tile-derivation-formula', text: d.formula })]));
  dl.appendChild(el('dt', { text: 'Original population' }));
  dl.appendChild(el('dd', { text: d.population }));
  dl.appendChild(el('dt', { text: 'Limits of validity' }));
  dl.appendChild(el('dd', { text: d.validity }));
  dl.appendChild(el('dt', { text: 'Source' }));
  dl.appendChild(el('dd', null, [el('blockquote', { text: d.source })]));
  body.appendChild(dl);
  details.appendChild(body);

  // spec-v48: additive-score component breakdown. spec-v62 §2 A5: OR a
  // substituted-formula line for non-additive formula tiles. Either populates
  // the live "your inputs" section.
  const hasComponents = Array.isArray(d.components) && d.components.length > 0;
  const hasSubstituted = typeof d.substituted === 'function';
  if (hasComponents || hasSubstituted) {
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
  const hasComponents = Array.isArray(d.components) && d.components.length > 0;
  const hasSubstituted = typeof d.substituted === 'function';
  if (!hasComponents && !hasSubstituted) return;
  const steps = detailsEl.querySelector(`[${STEPS_DATA_ATTR}]`);
  if (!steps) return;

  clear(steps);

  // Same heading-skip avoidance as the static block: the step labels are <dt>s
  // in a <dl>, not <h4> headings, so the live "show your work" panel adds
  // nothing to the page heading outline.
  const dl = el('dl', { class: 'tile-derivation-dl' });

  if (hasComponents) {
    dl.appendChild(el('dt', { text: 'Your inputs' }));
    const dd = el('dd');
    const ol = el('ol');
    let total = 0;
    for (const c of d.components) {
      const value = inputs ? inputs[c.inputKey] : undefined;
      const pts = scoreComponent(c, value, inputs);
      total += pts;
      const sign = pts > 0 ? '+' : '';
      const inputLabel = formatInput(value);
      ol.appendChild(el('li', { text: `${sign}${pts} — ${c.label} (input: ${inputLabel})` }));
    }
    const bandText = d.bands ? bandFor(d.bands, total) : '';
    const totalLi = el('li');
    totalLi.appendChild(el('strong', { text: `Total: ${formatTotal(total)}${bandText ? ` → ${bandText}` : ''}` }));
    ol.appendChild(totalLi);
    dd.appendChild(ol);
    dl.appendChild(dd);
  }

  // spec-v62 §2 A5: substituted-formula line — the published formula with the
  // user's current inputs plugged in and the arithmetic carried through. The
  // substituted() author guards bad inputs (returns null/empty); this layer
  // additionally refuses any string carrying a banned token, so a non-finite
  // value can never reach the panel (spec-v59 §2.7 discipline).
  if (hasSubstituted) {
    dl.appendChild(el('dt', { text: 'With your inputs' }));
    let line = null;
    try { line = d.substituted(inputs); } catch { line = null; }
    const safeLine = (typeof line === 'string' && line.length > 0 && !/(NaN|Infinity|undefined)/.test(line))
      ? line
      : 'Enter all inputs to see the formula with your values plugged in.';
    dl.appendChild(el('dd', null, [el('pre', { class: 'tile-derivation-substituted', text: safeLine })]));
  }

  if (dl.children.length > 0) steps.appendChild(dl);
}

function scoreComponent(c, value, inputs) {
  if (typeof c.points === 'function') return Number(c.points(value, inputs)) || 0;
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
  // spec-v59 §2.7: a non-finite numeric input must not leak "NaN"/"Infinity"
  // into the show-your-work panel; fmt() renders an em-dash fallback instead.
  if (typeof v === 'number') return fmt(v, { fallback: '—' });
  return String(v);
}

function formatTotal(n) {
  if (!Number.isFinite(n)) return '—';
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
