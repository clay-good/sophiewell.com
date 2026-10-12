// spec-v1637 tool 11: pseudoephedrine, ephedrine and phenylpropanolamine retail sales limits.
//
// Sources, re-read October 12, 2026:
//   21 CFR 1314.20(a) (eCFR as current October 8, 2026): a regulated seller, including a mobile
//     retail vendor, "may not in a single calendar day sell any purchaser more than 3.6 grams of
//     ephedrine base, 3.6 grams of pseudoephedrine base, or 3.6 grams of phenylpropanolamine base"
//     "[w]ithout regard to the number of transactions". (b): a mobile retail vendor, not more than
//     7.5 grams "in any 30-day period". 1314.100(a), (b): the same two limits for mail-order sales.
//   21 CFR 1314.30(a): the logbook, "[e]xcept for purchase by an individual of a single sales
//     package containing not more than 60 milligrams of pseudoephedrine".
//   21 U.S.C. 844(a) (as the spec read it October 10, 2026; not re-read at build): unlawful to
//     knowingly purchase at retail more than 9 grams in a 30-day period, of which not more than
//     7.5 grams by mail or carrier. That limit is on the buyer, not the store.
//   DEA, General Information Regarding the Combat Methamphetamine Epidemic Act of 2005 (May
//     2006), equivalency charts. DEA: "The following is not found within DEA law or regulations;
//     DEA provides this for informational purposes only". Every tablet cell of the 3.6, 7.5 and
//     9 gram charts is a unit test here (25 mg ephedrine HCl 175 / 366 / 439; 30 mg
//     pseudoephedrine HCl 146 / 305 / 366; 30 mg pseudoephedrine sulfate 155 / 324 / 389; ...).
//
// Base grams = labeled salt mg x (base weight / salt weight). Pseudoephedrine and ephedrine are
// isomers and share weights (PubChem: base 165.23, hydrochloride 201.69, sulfate 428.5 with two
// base molecules per sulfate). The unrounded ratios are kept: they reproduce the chart, and the
// four-decimal factors do not. Counts are rounded DOWN, as DEA's chart does.
// Phenylpropanolamine hydrochloride: 151.21 / 187.66, which the DEA chart has no row to check.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const INGREDIENTS = [
  { value: 'pseudoephedrine', text: 'Pseudoephedrine' },
  { value: 'ephedrine', text: 'Ephedrine' },
  { value: 'phenylpropanolamine', text: 'Phenylpropanolamine' },
];
export const SALTS = [
  { value: 'hydrochloride-salt', text: 'Hydrochloride' },
  { value: 'sulfate-salt', text: 'Sulfate' },
  { value: 'free-base', text: 'Base' },
];
export const FORMS = [
  { value: 'tablets-or-capsules', text: 'Tablets or capsules (strength per unit)' },
  { value: 'liquid-product', text: 'Liquid (strength per stated mL)' },
];
export const SELLERS = [
  { value: 'retail-store', text: 'Retail store' },
  { value: 'mobile-retail-vendor', text: 'Mobile retail vendor' },
  { value: 'mail-order-seller', text: 'Mail-order seller' },
];
const EPH = { 'hydrochloride-salt': 165.23 / 201.69, 'sulfate-salt': (2 * 165.23) / 428.5, 'free-base': 1 };
const PPA = { 'hydrochloride-salt': 151.21 / 187.66, 'free-base': 1 };
const DAILY = 3.6; const THIRTY = 7.5; const BUYER = 9;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const g3 = (n) => Math.round(n * 1000) / 1000;
// Round down, as the DEA chart does; the epsilon keeps 3.6 / 0.0246 from landing on 145.999...
const down = (n) => Math.floor(n + 1e-9);

// baseFactor(ingredient, salt) -> base weight over salt weight, or null where no figure exists.
export function baseFactor(ingredient, salt) {
  const t = ingredient === 'phenylpropanolamine' ? PPA : EPH;
  return Object.prototype.hasOwnProperty.call(t, salt) ? t[salt] : null;
}

export function cmeaSalesLimit(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pick = (list, v, msg) => list.find((x) => x.value === String(v ?? '').trim()) || { fault: msg };
  const ingredient = pick(INGREDIENTS, o.ingredient, 'Choose the ingredient.');
  if (ingredient.fault) return { valid: false, message: ingredient.fault };
  const salt = pick(SALTS, o.salt, 'Choose the salt on the label: the base content differs between the hydrochloride, the sulfate and the base.');
  if (salt.fault) return { valid: false, message: salt.fault };
  const form = pick(FORMS, o.form, 'Choose tablets or capsules, or a liquid.');
  if (form.fault) return { valid: false, message: form.fault };
  const seller = pick(SELLERS, o.seller, 'Choose the kind of seller: a mobile retail vendor and a mail-order seller also have a 30-day limit.');
  if (seller.fault) return { valid: false, message: seller.fault };
  const factor = baseFactor(ingredient.value, salt.value);
  if (factor === null) return { valid: false, message: 'Choose the hydrochloride or the base for phenylpropanolamine: no conversion figure was found for its sulfate.' };
  const liquid = form.value === 'liquid-product';
  const rows = [['the labeled strength', o.strengthMg, null, 5000, 'mg'], [liquid ? 'the mL in each package' : 'the tablets or capsules in each package', o.unitsPerPackage, null, 100000, ''], ['the number of packages', o.packages, null, 10000, ''], ['the base grams already sold to this purchaser today (0 if none)', o.soldToday, 0, 1000, 'g']];
  if (liquid) rows.splice(1, 0, ['the mL the strength is stated in', o.perMl, null, 1000, 'mL']);
  const f = inputFault(rows);
  if (f) return { valid: false, message: f };
  const thirtyApplies = seller.value !== 'retail-store';
  if (thirtyApplies || !blank(o.soldThirtyDays) || !blank(o.stateThirtyDayLimit)) {
    const g = inputFault([['the base grams sold to this purchaser in the past 30 days, today included (0 if none)', o.soldThirtyDays, 0, 1000, 'g']]);
    if (g) return { valid: false, message: g };
  }
  if (!blank(o.stateThirtyDayLimit)) { const g = inputFault([['the state 30-day limit', o.stateThirtyDayLimit, 0, 100, 'g']]); if (g) return { valid: false, message: g }; }
  const mg = Number(o.strengthMg); const per = liquid ? Number(o.perMl) : 1;
  const units = Number(o.unitsPerPackage); const packages = Number(o.packages);
  if (!Number.isInteger(packages)) return { valid: false, message: 'Enter the number of packages as a whole number.' };
  const soldToday = Number(o.soldToday); const sold30 = blank(o.soldThirtyDays) ? null : Number(o.soldThirtyDays);
  if (sold30 !== null && sold30 < soldToday) return { valid: false, message: 'Enter a 30-day total that is at least the amount sold today: today is part of the 30 days.' };
  const stateLimit = blank(o.stateThirtyDayLimit) ? null : Number(o.stateThirtyDayLimit);

  const basePerUnitG = (mg / per) * factor / 1000;       // per tablet, or per mL
  const perPackage = basePerUnitG * units;
  const sale = perPackage * packages;
  const limits = [{ name: 'the 3.6 g daily limit', left: DAILY - soldToday, rule: '21 CFR 1314.20(a)' }];
  if (thirtyApplies) limits.push({ name: 'the 7.5 g 30-day limit', left: THIRTY - sold30, rule: seller.value === 'mail-order-seller' ? '21 CFR 1314.100(b)' : '21 CFR 1314.20(b)' });
  if (stateLimit !== null) limits.push({ name: `the state 30-day limit of ${stateLimit} g`, left: stateLimit - sold30, rule: 'as entered' });
  if (seller.value === 'mail-order-seller') limits[0].rule = '21 CFR 1314.100(a)';
  const binding = limits.reduce((a, b) => (b.left < a.left ? b : a));
  const room = Math.max(0, binding.left);
  const fits = sale <= binding.left + 1e-9;
  const maxPackages = down(room / perPackage);
  const unitWord = liquid ? 'mL' : 'tablets or capsules';
  const notes = [`Base content: ${mg} mg of ${ingredient.text.toLowerCase()} ${salt.value === 'free-base' ? 'base' : salt.text.toLowerCase()}${liquid ? ` per ${per} mL` : ''} is ${g3((mg * factor))} mg of base${salt.value === 'free-base' ? '' : ` (base weight over salt weight, ${factor.toFixed(5)})`}. One package of ${units} ${unitWord} holds ${g3(perPackage)} g of base; ${packages} package${packages === 1 ? '' : 's'}, ${g3(sale)} g.`];
  for (const l of limits) notes.push(`Left under ${l.name}: ${g3(Math.max(0, l.left))} g (${l.rule}), which is ${down(Math.max(0, l.left) / basePerUnitG).toLocaleString('en-US')} ${unitWord} of this product, rounded down.`);
  notes.push(`${fits ? 'This sale fits.' : 'This sale does not fit.'} The largest whole number of packages that fits is ${maxPackages}; ${binding.name} is the one that binds.`);
  if (!thirtyApplies) notes.push('A retail store\'s federal duty is the daily limit; federal law puts no 30-day limit on the store. The 30-day limit of 9 g (of which not more than 7.5 g by mail or carrier) is on the purchaser (21 U.S.C. 844(a)). Many states set their own 30-day seller limit.');
  else notes.push('The purchaser separately may not knowingly buy more than 9 g at retail in 30 days, of which not more than 7.5 g by mail or carrier (21 U.S.C. 844(a)).');
  if (ingredient.value === 'pseudoephedrine' && packages === 1) {
    const labeled = (mg / per) * units;
    const baseMg = perPackage * 1000;
    if (labeled <= 60) notes.push('A single package with not more than 60 mg of pseudoephedrine is outside the logbook requirement (21 CFR 1314.30(a)). The sales limits still apply.');
    else if (baseMg <= 60) notes.push(`This single package holds ${g3(labeled)} mg as labeled and ${g3(baseMg)} mg as base. The logbook exception is for "not more than 60 milligrams of pseudoephedrine" and does not say salt or base; the labeled amount is over 60.`);
  }
  if (ingredient.value === 'phenylpropanolamine') notes.push('DEA\'s chart has no phenylpropanolamine row to check this factor against; it is computed from PubChem weights (151.21 over 187.66 for the hydrochloride).');
  notes.push('DEA says its equivalency chart is not found in law or regulation and is for information only; these counts are rounded down the same way. State law is often stricter.');
  return {
    valid: true, flag: fits ? 'sale-fits' : 'sale-over-the-limit', abnormal: !fits,
    saleBaseGrams: g3(sale), basePerPackageGrams: g3(perPackage), leftGrams: g3(room), maxPackages, bindingLimit: binding.name,
    band: `${g3(sale)} g of base in this sale; ${g3(room)} g left for this purchaser.`,
    bandLabel: fits ? 'Sale fits' : `Over the limit: at most ${maxPackages} package${maxPackages === 1 ? '' : 's'}`, notes, note: notes.join(' '),
  };
}
