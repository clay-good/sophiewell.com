// spec-v1638 tool 26: markup, gross margin and cash price.
//
// Source: stated arithmetic (identities; no primary source).
//   markup % = (price - cost) / cost          gross margin % = (price - cost) / price
//   margin = markup / (1 + markup)            markup = margin / (1 - margin)
//   price for a target margin = cost / (1 - margin) + fee
// A margin of 100% or more is impossible on a positive cost and is refused, not clamped. Exactly
// two of the four figures are taken; a third that disagrees is not silently dropped.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const r2 = (n) => Math.round(n * 100) / 100;
const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function rxPricingMath(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const given = ['cost', 'price', 'markupPercent', 'marginPercent'].filter((k) => !blank(o[k]));
  if (given.length < 2) return { valid: false, message: 'Enter any two of: acquisition cost, selling price, markup percent, gross margin percent.' };
  if (given.length > 2) return { valid: false, message: 'Enter exactly two of the four figures. With three or four, one could disagree with the others, and the tool will not choose which to believe.' };
  const spec = { cost: ['the acquisition cost', 0, 1e9, 'dollars'], price: ['the selling price', 0, 1e9, 'dollars'], markupPercent: ['the markup', -100, 100000, 'percent'], marginPercent: ['the gross margin', -100000, 100, 'percent'] };
  for (const k of given) { const f = inputFault([[spec[k][0], o[k], spec[k][1], spec[k][2], spec[k][3]]]); if (f) return { valid: false, message: f }; }
  let cost = given.includes('cost') ? Number(o.cost) : null;
  let price = given.includes('price') ? Number(o.price) : null;
  let markup = given.includes('markupPercent') ? Number(o.markupPercent) / 100 : null;
  let margin = given.includes('marginPercent') ? Number(o.marginPercent) / 100 : null;
  if (margin !== null && margin >= 1) return { valid: false, message: 'Enter a gross margin below 100%: a margin of 100% or more is impossible when the cost is above zero.' };
  if (markup !== null && markup <= -1) return { valid: false, message: 'Enter a markup above -100%: at -100% the price is zero.' };
  if (cost !== null && cost <= 0 && !(price !== null)) return { valid: false, message: 'Enter an acquisition cost above zero.' };
  const how = [];
  if (markup !== null && margin !== null) {
    if (Math.abs(markup / (1 + markup) - margin) > 0.0005) return { valid: false, message: `Enter a markup and a margin that agree, or only one of them: a markup of ${r2(markup * 100)}% is a margin of ${r2((markup / (1 + markup)) * 100)}%, not ${r2(margin * 100)}%.` };
    return { valid: false, message: 'Enter a cost or a price with the percent: a markup and a margin describe the same thing, so no dollar figure follows from the two alone.' };
  }
  if (cost !== null && price !== null) { if (cost <= 0 || price <= 0) return { valid: false, message: 'Enter a cost and a price that are both above zero.' }; markup = (price - cost) / cost; margin = (price - cost) / price; how.push('markup = (price - cost) / cost; margin = (price - cost) / price'); }
  else if (cost !== null && markup !== null) { if (cost <= 0) return { valid: false, message: 'Enter an acquisition cost above zero.' }; price = cost * (1 + markup); margin = markup / (1 + markup); how.push('price = cost x (1 + markup); margin = markup / (1 + markup)'); }
  else if (cost !== null && margin !== null) { if (cost <= 0) return { valid: false, message: 'Enter an acquisition cost above zero.' }; price = cost / (1 - margin); markup = margin / (1 - margin); how.push('price = cost / (1 - margin); markup = margin / (1 - margin)'); }
  else if (price !== null && markup !== null) { if (price <= 0) return { valid: false, message: 'Enter a selling price above zero.' }; cost = price / (1 + markup); margin = markup / (1 + markup); how.push('cost = price / (1 + markup); margin = markup / (1 + markup)'); }
  else { if (price <= 0) return { valid: false, message: 'Enter a selling price above zero.' }; cost = price * (1 - margin); markup = margin / (1 - margin); how.push('cost = price x (1 - margin); markup = margin / (1 - margin)'); }
  const notes = [`Cost ${money(cost)}, price ${money(price)}: markup ${r2(markup * 100)}% of cost, gross margin ${r2(margin * 100)}% of price, gross profit ${money(price - cost)}.`, `How: ${how[0]}.`];
  const out = { valid: true, cost: r2(cost), price: r2(price), markupPercent: r2(markup * 100), marginPercent: r2(margin * 100), grossProfit: r2(price - cost) };
  for (const [k, label, lo, hi, unit] of [['fee', 'the dispensing fee', 0, 1e6, 'dollars'], ['targetMarginPercent', 'the target margin', -1000, 100, 'percent']]) {
    if (!blank(o[k])) { const f = inputFault([[label, o[k], lo, hi, unit]]); if (f) return { valid: false, message: f }; }
  }
  if (!blank(o.targetMarginPercent)) {
    const t = Number(o.targetMarginPercent) / 100;
    if (t >= 1) return { valid: false, message: 'Enter a target margin below 100%.' };
    const fee = blank(o.fee) ? 0 : Number(o.fee);
    out.priceForTarget = r2(cost / (1 - t) + fee);
    notes.push(`Price for a ${r2(t * 100)}% margin on this cost: ${money(cost / (1 - t))}${blank(o.fee) ? '; no dispensing fee was entered' : `, plus the ${money(fee)} fee, ${money(out.priceForTarget)}`}. The margin is on the ingredient price; the fee is added after it.`);
  } else if (!blank(o.fee)) notes.push('A dispensing fee was entered without a target margin, so it was not used.');
  notes.push('Markup is measured on cost and margin on price, so the same sale has two different percentages; a contract or a price list quotes one of them, and it matters which. These are identities, not a pricing recommendation.');
  return { ...out, flag: price < cost ? 'price-below-cost' : 'figures', abnormal: price < cost, band: `Markup ${out.markupPercent}%, gross margin ${out.marginPercent}%.`, bandLabel: price < cost ? 'Price is below cost' : `Gross profit ${money(price - cost)}`, notes, note: notes.join(' ') };
}
