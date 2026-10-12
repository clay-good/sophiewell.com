// spec-v1637 tool 23: does this package need child-resistant (special) packaging?
//
// Source: 16 CFR 1700.14(a), read on eCFR as current October 8, 2026 (re-read October 12, 2026), and
// 15 U.S.C. 1473(b) (United States Code, 2024 edition, govinfo.gov). Each row below carries its
// paragraph and its own operator, because the section does not use one: "more than one gram"
// (acetaminophen), "one gram (1,000 mg) or more" (ibuprofen), "250 mg or more" (naproxen), "more
// than 50 mg" (ketoprofen), "more than the equivalent of 66 mg diphenhydramine base", "more than
// 0.045 mg" (loperamide), "more than 5.0 mg" (lidocaine), "more than 0.5 mg" (dibucaine), "more
// than 14 mg" (minoxidil), "0.08 milligrams or more" (imidazolines), "3 g or more of ethanol"
// (mouthwash), "more than 5 percent by weight" (methyl salicylate).
//   (a)(12), (13) iron: "250 mg or more elemental iron" in a single package, at "0.025 percent or
//     more on a weight to volume basis for liquids" and "0.05 percent or more on a weight-to-weight
//     basis for nonliquids". eCFR prints the liquid clause of (12) twice; the figures are the same.
//   (a)(27) fluoride (household substances): "more than the equivalent of 50 milligrams of
//     elemental fluoride per package AND more than the equivalent of 0.5 percent".
//   (a)(10) prescription drugs, oral: always, "except for the following" (the exemption rows).
//     Several add "and containing no other substance(s) subject to" the section.
//   (a)(30) an oral over-the-counter product with an ingredient formerly prescription-only: always,
//     unless every active ingredient was approved for over-the-counter sale on an application
//     submitted to FDA before January 29, 2002.
//   15 U.S.C. 1473(b): a substance dispensed on a practitioner's order "may be dispensed in
//     noncomplying packages only when directed in such order or when requested by the purchaser."
// Household chemicals in the same section are out of scope. The aspirin, acetaminophen and
// mouthwash exemptions turn on properties the tool cannot compute (an LD-50, a flavoring share);
// they are listed and the reader answers.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// kind: 'always' | 'over' (required when amount > limit) | 'at-least' (required when amount >= limit)
//     | 'exempt' (an (a)(10) exemption with no number) | 'exempt-up-to' (exempt when amount <= limit)
const row = (value, text, para, kind, limit, unit, extra = {}) => ({ value, text, para, kind, limit, unit, ...extra });
export const SUBSTANCES = [
  row('oral-prescription-drug', 'Oral prescription drug (no listed exemption)', '(a)(10)', 'always'),
  row('oral-dea-scheduled-drug', 'Oral controlled drug', '(a)(4)', 'always'),
  row('aspirin-oral', 'Aspirin, oral', '(a)(1)', 'always', null, null, { exemptions: 'effervescent tablets with not more than 15 percent aspirin and an oral LD-50 in rats of 5 g/kg or more, and unflavored powders in unit doses of not more than 15.4 grains with no other substance subject to the section, neither intended for pediatric use ((a)(1)(i)-(ii))' }),
  row('acetaminophen-oral', 'Acetaminophen, oral', '(a)(16)', 'over', 1000, 'mg', { say: 'more than one gram', exemptions: 'effervescent tablets or granules with less than 15 percent acetaminophen and an oral LD-50 of 5 g/kg or greater, and unflavored powders in unit doses of not more than 13 grains, each with no other substance subject to the section ((a)(16)(i)-(ii))' }),
  row('ibuprofen-oral', 'Ibuprofen, oral', '(a)(20)', 'at-least', 1000, 'mg', { say: 'one gram (1,000 mg) or more' }),
  row('naproxen', 'Naproxen', '(a)(25)', 'at-least', 250, 'mg', { say: 'the equivalent of 250 mg or more' }),
  row('ketoprofen', 'Ketoprofen', '(a)(26)', 'over', 50, 'mg', { say: 'more than 50 mg' }),
  row('diphenhydramine-oral', 'Diphenhydramine, oral (as base)', '(a)(17)', 'over', 66, 'mg', { say: 'more than the equivalent of 66 mg diphenhydramine base' }),
  row('loperamide-oral', 'Loperamide, oral', '(a)(21)', 'over', 0.045, 'mg', { say: 'more than 0.045 mg' }),
  row('lidocaine', 'Lidocaine', '(a)(23)', 'over', 5, 'mg', { say: 'more than 5.0 mg' }),
  row('dibucaine', 'Dibucaine', '(a)(24)', 'over', 0.5, 'mg', { say: 'more than 0.5 mg' }),
  row('minoxidil', 'Minoxidil', '(a)(28)', 'over', 14, 'mg', { say: 'more than 14 mg' }),
  row('imidazoline', 'Imidazoline (tetrahydrozoline, naphazoline, oxymetazoline, xylometazoline)', '(a)(33)', 'at-least', 0.08, 'mg', { say: 'the equivalent of 0.08 milligrams or more' }),
  row('mouthwash-ethanol', 'Mouthwash (grams of ethanol in the package)', '(a)(22)', 'at-least', 3, 'g', { say: '3 g or more of ethanol', exemptions: 'a nonremovable pump dispenser with at least 7% mint or cinnamon flavoring oils, no more than 0.03 g of ethanol per actuation, and less than 15 g of ethanol in the unit ((a)(22))' }),
  row('methyl-salicylate-liquid', 'Methyl salicylate, liquid, not a pressurized spray (percent by weight)', '(a)(3)', 'over', 5, '%', { say: 'more than 5 percent by weight' }),
  row('iron-drug-or-supplement', 'Iron-containing drug or dietary supplement (mg elemental iron)', '(a)(12), (13)', 'iron', 250, 'mg'),
  row('fluoride-household-product', 'Fluoride, household substance (mg elemental fluoride)', '(a)(27)', 'fluoride', 50, 'mg'),
  row('otc-switched-oral-ingredient', 'Oral over-the-counter product with an ingredient that was once prescription-only', '(a)(30)', 'switch'),
  row('rx-nitroglycerin-sublingual', 'Rx: nitroglycerin, sublingual', '(a)(10)(i)', 'exempt'),
  row('rx-isosorbide-dinitrate-sublingual-chewable', 'Rx: isosorbide dinitrate, sublingual or chewable (mg strength)', '(a)(10)(ii)', 'exempt-up-to', 10, 'mg', { say: 'dosage strengths of 10 milligrams or less' }),
  row('rx-erythromycin-ethylsuccinate-suspension', 'Rx: erythromycin ethylsuccinate granules or suspension (mg erythromycin)', '(a)(10)(iii)', 'exempt-up-to', 8000, 'mg', { say: 'not more than 8 grams of the equivalent of erythromycin' }),
  row('rx-erythromycin-ethylsuccinate-tablets', 'Rx: erythromycin ethylsuccinate tablets (mg erythromycin)', '(a)(10)(xvi)', 'exempt-up-to', 16000, 'mg', { say: 'no more than the equivalent of 16 grams erythromycin' }),
  row('rx-cyclic-oral-contraceptive-mnemonic-pack', 'Rx: cyclic oral contraceptive in a manufacturer\'s mnemonic pack, progestogen or estrogen only', '(a)(10)(iv)', 'exempt'),
  row('rx-cholestyramine-powder', 'Rx: anhydrous cholestyramine powder', '(a)(10)(v)', 'exempt'),
  row('rx-potassium-unit-dose', 'Rx: potassium supplement in unit dose (mEq per unit dose)', '(a)(10)(vi)', 'exempt-up-to', 50, 'mEq', { say: 'not more than 50 milliequivalents of potassium per unit dose' }),
  row('rx-sodium-fluoride', 'Rx: sodium fluoride preparation (mg sodium fluoride)', '(a)(10)(vii)', 'rx-fluoride', 110, 'mg', { noOther: true }),
  row('rx-betamethasone-dispenser-pack', 'Rx: betamethasone tablets in a manufacturer\'s dispenser package', '(a)(10)(viii)', 'exempt-up-to', 12.6, 'mg', { say: 'no more than 12.6 milligrams betamethasone' }),
  row('rx-pancrelipase', 'Rx: pancrelipase tablets, capsules or powder', '(a)(10)(ix)', 'exempt', null, null, { noOther: true }),
  row('rx-prednisone-tablets', 'Rx: prednisone tablets', '(a)(10)(x)', 'exempt-up-to', 105, 'mg', { say: 'no more than 105 mg', noOther: true }),
  row('rx-mebendazole-tablets', 'Rx: mebendazole tablets', '(a)(10)(xiii)', 'exempt-up-to', 600, 'mg', { say: 'not more than 600 mg', noOther: true }),
  row('rx-methylprednisolone-tablets', 'Rx: methylprednisolone tablets', '(a)(10)(xiv)', 'exempt-up-to', 84, 'mg', { say: 'not more than 84 mg', noOther: true }),
  row('rx-colestipol-powder', 'Rx: colestipol powder', '(a)(10)(xv)', 'exempt-up-to', 5000, 'mg', { say: 'not more than 5 grams', noOther: true }),
  row('rx-conjugated-estrogens-mnemonic-pack', 'Rx: conjugated estrogens tablets in a mnemonic package', '(a)(10)(xvii)', 'exempt-up-to', 32, 'mg', { say: 'not more than 32.0 mg', noOther: true }),
  row('rx-norethindrone-acetate-mnemonic-pack', 'Rx: norethindrone acetate tablets in a mnemonic package', '(a)(10)(xviii)', 'exempt-up-to', 50, 'mg', { say: 'not more than 50 mg', noOther: true }),
  row('rx-medroxyprogesterone-tablets', 'Rx: medroxyprogesterone acetate tablets', '(a)(10)(xix)', 'exempt'),
  row('rx-sacrosidase-solution', 'Rx: sacrosidase in a solution of glycerol and water', '(a)(10)(xx)', 'exempt'),
  row('rx-hormone-replacement', 'Rx: hormone replacement product, progestogen or estrogen only', '(a)(10)(xxi)', 'exempt'),
  row('rx-colesevelam-powder', 'Rx: colesevelam hydrochloride powder', '(a)(10)(xxii)', 'exempt-up-to', 3750, 'mg', { say: 'not more than 3.75 grams' }),
  row('rx-sevelamer-carbonate-powder', 'Rx: sevelamer carbonate powder', '(a)(10)(xxiii)', 'exempt-up-to', 2400, 'mg', { say: 'not more than 2.4 grams' }),
  row('rx-baloxavir-tablets', 'Rx: baloxavir marboxil tablets', '(a)(10)(xxiv)', 'exempt-up-to', 80, 'mg', { say: 'not more than 80 mg' }),
];
export const FORMS = [{ value: 'liquid-form', text: 'Liquid' }, { value: 'non-liquid-form', text: 'Non-liquid (tablets, capsules, powders, gels, pastes)' }];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const REQUESTS = [
  { value: 'order-directs-noncomplying', text: 'The prescriber\'s order directs a non-child-resistant package' },
  { value: 'purchaser-requests-noncomplying', text: 'The purchaser asks for one' },
  { value: 'no-request', text: 'Neither' },
];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 4 });
const yn = (v) => (String(v ?? '').trim() === 'yes' ? true : String(v ?? '').trim() === 'no' ? false : null);

export function pppaSpecialPackagingCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const r = SUBSTANCES.find((s) => s.value === String(o.substance ?? '').trim());
  if (!r) return { valid: false, message: 'Choose the substance or the kind of product. Each row of 16 CFR 1700.14(a) has its own threshold.' };
  const isRx = r.value.startsWith('rx-') || r.value === 'oral-prescription-drug';
  const cite = `16 CFR 1700.14${r.para}`;
  const notes = []; const out = { valid: true, paragraph: cite };
  const needAmount = ['over', 'at-least', 'exempt-up-to', 'iron', 'fluoride', 'rx-fluoride'].includes(r.kind);
  let amount = null;
  if (needAmount) {
    const f = inputFault([[`the total amount in the package (${r.unit})`, o.amount, 0, 1e7, r.unit === '%' ? 'percent' : r.unit]]);
    if (f) return { valid: false, message: f };
    amount = Number(o.amount); out.amount = amount;
  }
  let percent = null;
  if (['iron', 'fluoride'].includes(r.kind) || (r.kind === 'rx-fluoride' && !blank(o.percent))) {
    const f = inputFault([['the concentration of the element', o.percent, 0, 100, 'percent']]);
    if (f) return { valid: false, message: f };
    percent = Number(o.percent);
  }
  let required; // true | false
  if (r.kind === 'always') {
    required = true;
    notes.push(`${r.text}: special packaging is required whatever the amount (${cite}).`);
    if (r.exemptions) notes.push(`The paragraph exempts ${r.exemptions}. The tool cannot test those properties; if the product is one of them, it is exempt.`);
    if (r.value === 'oral-prescription-drug') notes.push('Paragraph (a)(10) lists exemptions by drug, dosage form and package content; each is its own row in the list above.');
  } else if (r.kind === 'over' || r.kind === 'at-least') {
    required = r.kind === 'over' ? amount > r.limit : amount >= r.limit;
    const margin = Math.abs(amount - r.limit);
    out.margin = margin;
    notes.push(`${r.text}: special packaging is required when the package holds ${r.say}. This package holds ${fmt(amount)} ${r.unit}: ${required ? 'required' : 'not required on this row'}${amount === r.limit ? `, exactly at the figure, where the wording ("${r.kind === 'over' ? 'more than' : 'or more'}") decides` : `, ${fmt(margin)} ${r.unit} ${amount > r.limit ? 'above' : 'below'} the figure`} (${cite}).`);
    if (r.exemptions) notes.push(`The paragraph exempts ${r.exemptions}. The tool cannot test those properties.`);
  } else if (r.kind === 'iron') {
    const form = FORMS.find((x) => x.value === String(o.form ?? '').trim());
    if (!form) return { valid: false, message: 'Choose liquid or non-liquid: the iron concentration test is 0.025% weight to volume for liquids and 0.05% weight to weight for non-liquids.' };
    const floor = form.value === 'liquid-form' ? 0.025 : 0.05;
    required = amount >= 250 && percent >= floor;
    notes.push(`Iron: special packaging is required when a single package holds the equivalent of 250 mg or more of elemental iron at ${floor}% or more (${form.value === 'liquid-form' ? 'weight to volume, liquids' : 'weight to weight, non-liquids'}). This package: ${fmt(amount)} mg at ${fmt(percent)}%: ${required ? 'required' : 'not required'} (${cite}).`);
    notes.push('Exempt: preparations in which iron is present solely as a colorant, animal feeds used as drug vehicles, and powdered dietary supplements with no more than the equivalent of 0.12% weight-to-weight elemental iron ((a)(12)(i)-(ii), (a)(13)(i)-(ii)).');
  } else if (r.kind === 'fluoride') {
    required = amount > 50 && percent > 0.5;
    notes.push(`Fluoride, household substances: special packaging is required when the package holds more than the equivalent of 50 mg of elemental fluoride AND more than 0.5% elemental fluoride. This package: ${fmt(amount)} mg at ${fmt(percent)}%: ${required ? 'required' : 'not required'} (${cite}). Both tests must be met.`);
  } else if (r.kind === 'switch') {
    const before = yn(o.approvedBefore2002);
    if (before === null) return { valid: false, message: 'Choose yes or no: was every active ingredient approved for over-the-counter sale on an application submitted to FDA before January 29, 2002?' };
    required = !before;
    notes.push(before ? `Every active ingredient was approved for over-the-counter sale on an application submitted to FDA before January 29, 2002, so paragraph (a)(30) does not apply. Any other row of the section that fits the product still does (${cite}).` : `An oral over-the-counter product with an active ingredient that was once available only by prescription must be in special packaging, whatever the amount of that ingredient (${cite}).`);
  } else {
    // An (a)(10) exemption row.
    let exempt = true; const why = [];
    if (r.kind === 'exempt-up-to') {
      exempt = amount <= r.limit; out.margin = Math.abs(amount - r.limit);
      why.push(`the exemption covers ${r.say}; this package holds ${fmt(amount)} ${r.unit}${amount === r.limit ? ', exactly at the figure, which is inside it' : `, ${fmt(out.margin)} ${r.unit} ${amount > r.limit ? 'over' : 'under'}`}`);
    } else if (r.kind === 'rx-fluoride') {
      const byAmount = amount <= 110; const byPercent = percent !== null && percent <= 0.5;
      exempt = byAmount || byPercent;
      why.push(`the exemption covers not more than 110 mg of sodium fluoride (50 mg of elemental fluoride) per package, or not more than 0.5% elemental fluoride; this package holds ${fmt(amount)} mg${percent === null ? ' and no concentration was entered' : ` at ${fmt(percent)}%`}`);
    } else why.push('the paragraph exempts this product by name and dosage form');
    if (r.noOther) {
      const none = yn(o.noOtherSubstance);
      if (none === null) return { valid: false, message: 'Choose yes or no: does the package contain no other substance subject to this section? This exemption requires it.' };
      if (!none) { exempt = false; why.push('the package also holds another substance subject to the section, which takes the exemption away'); }
      else why.push('it holds no other substance subject to the section');
    }
    required = !exempt;
    notes.push(`${r.text.replace(/^Rx: /, '')}: an oral prescription drug needs special packaging unless an exemption in paragraph (a)(10) applies. Here ${why.join('; ')}. ${exempt ? 'Exempt' : 'Not exempt, so special packaging is required'} (${cite}).`);
  }
  out.required = required;
  let dispensed = null;
  if (isRx && required) {
    const req = REQUESTS.find((x) => x.value === String(o.request ?? '').trim());
    if (!req) notes.push('A prescription may go out in a non-complying package only when the prescriber\'s order directs it or the purchaser asks (15 U.S.C. 1473(b)). Whether either happened was not entered.');
    else if (req.value === 'no-request') notes.push('Neither the order nor the purchaser asked for a non-complying package, so the exception in 15 U.S.C. 1473(b) does not apply.');
    else { dispensed = req.value; notes.push(`${req.value === 'order-directs-noncomplying' ? 'The prescriber\'s order directs' : 'The purchaser asked for'} a non-complying package, which 15 U.S.C. 1473(b) permits for a substance dispensed on a practitioner's order. The requirement itself is unchanged; this is the dispensing exception.`); }
  }
  out.noncomplyingAllowedByRequest = dispensed !== null;
  notes.push('One row was tested. A product with more than one listed substance is tested on each, and any row that requires special packaging governs. Household chemicals in the same section are not covered here, and state law can add to it.');
  const band = required ? (dispensed ? 'Special packaging is required; a non-complying package is permitted on this request.' : 'Special packaging is required.') : 'Special packaging is not required on this row.';
  return { ...out, flag: required ? (dispensed ? 'required-with-dispensing-exception' : 'special-packaging-required') : 'not-required-on-this-row', abnormal: false, band, bandLabel: required ? 'Required' : 'Not required', notes, note: notes.join(' ') };
}
