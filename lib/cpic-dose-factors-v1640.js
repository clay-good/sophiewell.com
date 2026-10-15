// spec-v1640 tool 4, the dose side table: the arithmetic a CPIC recommendation states, applied to a
// dose the reader enters (owner decision 12, October 15, 2026).
//
// CPIC's recommendation text is prose. A number is never parsed out of it by code. Instead a person read
// each sentence once and wrote the arithmetic below beside the SHA-256 of that exact sentence, as the
// sentence stands in the shipped CPIC tables (`data/cpic`). At run time the tool hashes the matched row's
// text again: if the hash still matches, the arithmetic is offered; if CPIC has reworded the sentence,
// the hash does not match, no arithmetic is shown, and the weekly refresh lists the row for a person to
// read again. So a reworded recommendation can only lose the arithmetic, never silently change it. The
// hashing itself is the builder's (`scripts/data/builders/cpic.mjs` stores each row's `sha`), so nothing
// here hashes anything at run time.
//
// The dose is the reader's own, named in each row ("the lowest recommended starting dose", "the standard
// maintenance dose"); this file supplies no dose of its own, and the result always shows CPIC's sentence
// above the arithmetic. Nothing here decides whether to prescribe.
//
// Pure: no DOM, no network, no clock.

import { inputFault } from './num.js';

// Each row: the CPIC sentence's hash, the drugs that carry it, and the arithmetic read from it.
//   multiply  lo/hi factors on `dose` (equal when the sentence gives one figure)
//   ceiling   a starting-dose ceiling the reader's planned dose is set against
//   fixed     the dose the sentence itself names, so nothing is multiplied
//   range     a starting range the sentence names
export const FACTORS = [
  // Increase starting dose 1.5 to 2 times recommended starting dose. Total starting dose should not exceed 0.3 mg/kg/day. Use therapeutic drug monitoring 
  { id: 'tacrolimus-increase', drugs: ['tacrolimus'], sha256: '414f1ef55d8bc67d1b3802449216b6d8245a5e71412a05c699c795d8ebd593ce', kind: 'multiply', lo: 1.5, hi: 2, dose: 'the recommended starting dose', capPerKg: 0.3, capUnit: 'mg/kg/day' },
  // Initiate therapy with 25-50% of the lowest recommended starting dose. Titrate dose upward to clinical effect or 25-50% of the maximum recommended dose
  { id: 'nsaid-quarter-half', drugs: ['celecoxib', 'flurbiprofen', 'ibuprofen', 'lornoxicam'], sha256: '929f57cce9276a42610891ca0c310eaf9da34133cb48352dab5842294583e3a3', kind: 'multiply', lo: 0.25, hi: 0.5, dose: 'the lowest recommended starting dose', alsoMax: true },
  // Initiate therapy with 50% of the lowest recommended starting dose. Titrate dose upward to clinical effect or 50% of the maximum recommended dose with 
  { id: 'meloxicam-half', drugs: ['meloxicam'], sha256: '51e21d0ab162d48e7d990b2a4163aa0e8cf14cd2d83f5d682ef129bf568b4c49', kind: 'multiply', lo: 0.5, hi: 0.5, dose: 'the lowest recommended starting dose', alsoMax: true },
  // Increase starting daily dose by 100%. Daily dose may be given in divided doses. Monitor for efficacy.
  { id: 'ppi-double', drugs: ['dexlansoprazole', 'lansoprazole', 'omeprazole', 'pantoprazole'], sha256: '21b03453c59b66cae5d4caa6358eb717f74d13e9498e3439ab1d214d53678e76', kind: 'multiply', lo: 2, hi: 2, dose: 'the standard starting daily dose' },
  // Initiate standard starting daily dose. Consider increasing dose by 50-100% for the treatment of H. pylori infection and erosive esophagitis. Daily dos
  { id: 'ppi-raise-two-indications', drugs: ['dexlansoprazole', 'lansoprazole', 'omeprazole', 'pantoprazole'], sha256: '032c5d7b6482c0a2d367b87f1c9015248b1b96bff447bf6918359c2546e301fe', kind: 'multiply', lo: 1.5, hi: 2, dose: 'the standard starting daily dose', only: 'for the treatment of H. pylori infection and erosive esophagitis' },
  // Initiate standard starting daily dose. For chronic therapy (>12 weeks) and efficacy achieved, consider 50% reduction in daily dose and monitor for con
  { id: 'ppi-halve-chronic', drugs: ['dexlansoprazole', 'lansoprazole', 'omeprazole', 'pantoprazole'], sha256: 'e04033016e4dbb47d28563717ccccfeb169c6829c0bcca29948e5a26f153dbe8', kind: 'multiply', lo: 0.5, hi: 0.5, dose: 'the daily dose', only: 'for chronic therapy longer than 12 weeks once efficacy is achieved' },
  // For first dose, use typical initial or loading dose. For subsequent doses, use approximately 25% less than typical maintenance dose. Subsequent doses 
  { id: 'phenytoin-25-less', drugs: ['fosphenytoin', 'phenytoin'], sha256: '421106a837b474a84c9db1de80e137051325ccefa83623af715dd92f8cd268a8', kind: 'multiply', lo: 0.75, hi: 0.75, dose: 'the typical maintenance dose', firstDose: 'the first dose is the typical initial or loading dose' },
  // For first dose, use typical initial or loading dose. For subsequent doses use approximately 50% less than typical maintenance dose. Subsequent doses s
  { id: 'phenytoin-50-less', drugs: ['fosphenytoin', 'phenytoin'], sha256: 'd2a806ab369a613ace428e756c55756601e4cc5a55c72881768d71e240b56dd9', kind: 'multiply', lo: 0.5, hi: 0.5, dose: 'the typical maintenance dose', firstDose: 'the first dose is the typical initial or loading dose' },
  // Consider a clinically appropriate antidepressant not predominantly metabolized by CYP2C19. If citalopram or escitalopram are clinically appropriate, c
  { id: 'citalopram-half', drugs: ['citalopram', 'escitalopram'], sha256: '12535831835a9c9b7318c205967025c58fe8c2122047272bd056eec27a5c5b4a', kind: 'multiply', lo: 0.5, hi: 0.5, dose: 'the standard maintenance dose' },
  // Consider a lower starting dose, slower titration schedule and 50% reduction of standard maintenance dose as compared to CYP2C19 normal metabolizers or
  { id: 'sertraline-half-2c19', drugs: ['sertraline'], sha256: '79aafd1b99e9726b94b736966d1e227a523be7a5ee858af597dabe765e5ea0c7', kind: 'multiply', lo: 0.5, hi: 0.5, dose: 'the standard maintenance dose' },
  // Consider a lower starting dose, slower titration schedule and 50% reduction of standard maintenance dose as compared to CYP2B6 normal metabolizers
  { id: 'sertraline-half-2b6', drugs: ['sertraline'], sha256: '49dfb1d385da53019dce55608208591993a3911f7bbe97c749efab7c52d93d85', kind: 'multiply', lo: 0.5, hi: 0.5, dose: 'the standard maintenance dose' },
  // Consider a lower starting dose, slower titration schedule and 25% reduction of standard maintenance dose as compared to CYP2B6 normal metabolizers or 
  { id: 'sertraline-quarter-2b6', drugs: ['sertraline'], sha256: '9d8ae581548eae2a7c4b95131358a0cc153e3d0bcda18ad869ef61f2d51791df', kind: 'multiply', lo: 0.75, hi: 0.75, dose: 'the standard maintenance dose' },
  // Consider a 50% reduction in recommended starting dose, slower titration schedule, and a 50% lower maintenance dose as compared to normal metabolizers.
  { id: 'paroxetine-half', drugs: ['paroxetine'], sha256: 'c4409478e5e9aa847e3092bf46a63d6f7e7a4490571a8c5aacbb488ecf4809c1', kind: 'multiply', lo: 0.5, hi: 0.5, dose: 'the recommended starting dose', note: 'CPIC also names a 50% lower maintenance dose, so the same halving applies to a maintenance dose entered here.' },
  // Initiate 50% of starting dose (e.g., 5 mg) and titrate to the maximum recommended dose of 10 mg or consider a clinically appropriate alternative antid
  { id: 'vortioxetine-half', drugs: ['vortioxetine'], sha256: '054ebe361c633f9a7badb41347c8eda2cb06c944d0b00c4dac7f439ed5b77193', kind: 'multiply', lo: 0.5, hi: 0.5, dose: 'the standard starting dose', ceiling: 10, ceilingUnit: 'mg' },
  // Consider initiating efavirenz with decreased dose of 400 mg/day
  { id: 'efavirenz-400', drugs: ['efavirenz'], sha256: '099fd0a06771c1c94d0a3eefcc4ce475dce2fe4c8d7ab4dae3f21d24045d884f', kind: 'fixed', doses: [400], unit: 'mg/day' },
  // Consider initiating efavirenz with decreased dose of 400 or 200 mg/day
  { id: 'efavirenz-400-200', drugs: ['efavirenz'], sha256: 'a405825b93c0e44a01b9404cdf9b12ba6f771438a08e650cb439d2f372c719ef', kind: 'fixed', doses: [400, 200], unit: 'mg/day' },
  // Initiate efavirenz with standard dosing (600 mg/day)
  { id: 'efavirenz-600', drugs: ['efavirenz'], sha256: '820065b5791e58811ee06cc45531b2ccdeb4986d324160829d1c354b05edfea5', kind: 'fixed', doses: [600], unit: 'mg/day' },
  // Initiate therapy at a total daily dose of 40 to 75 mg. Carefully titrate dose upward to clinical effect or guideline-recommended dose; use caution wit
  { id: 'hydralazine-40-75', drugs: ['hydralazine'], sha256: '4015baa4691aab4ac1618e56664d492740b0c1c1f3152dba12237203e3399204', kind: 'range', lo: 40, hi: 75, unit: 'mg/day', cautionAt: 200 },
  // Consider a starting total daily dose of at least 75 mg. Titrate up to 300 mg total daily hydralazine dose as tolerated. NAT2 intermediate metabolizers
  { id: 'hydralazine-75-300-1', drugs: ['hydralazine'], sha256: '99f41793a8f1e2afb429b34ed209941232883bce3c39b0a17de6a44d862de26c', kind: 'range', lo: 75, hi: 300, unit: 'mg/day' },
  // Consider a starting total daily dose of at least 75 mg. Titrate up to 300 mg total daily hydralazine dose as tolerated. NAT2 rapid metabolizers typica
  { id: 'hydralazine-75-300-2', drugs: ['hydralazine'], sha256: '909445fb6e8152fa4f1714cd779c85d6f29a571dc116b4233253dc9e31a62ea3', kind: 'range', lo: 75, hi: 300, unit: 'mg/day' },
  // Prescribe ≤40mg as a starting dose and adjust doses of atorvastatin based on disease-specific guidelines. Prescriber should be aware of possible incre
  { id: 'atorvastatin-40', drugs: ['atorvastatin'], sha256: 'f45edad3b28342b0c1e2a6771e7f508d1b4344849ddfd323c1702425a5867e10', kind: 'ceiling', unit: 'mg', max: 40, strict: false },
  // Prescribe ≤20mg as a starting dose and adjust doses of atorvastatin based on disease-specific guidelines. If dose >20mg is needed for desired efficacy
  { id: 'atorvastatin-20', drugs: ['atorvastatin'], sha256: 'd8b73a4bc854292e938681c1bf954554fb1c60c3ba38252963b82356f5158de8', kind: 'ceiling', unit: 'mg', max: 20, strict: false },
  // Prescribe ≤ 2mg as a starting dose and adjust doses of pitavastatin based on disease-specific guidelines. Prescriber should be aware of possible incre
  { id: 'pitavastatin-2', drugs: ['pitavastatin'], sha256: '86505e29c29225c71f6768723c6bac3fb883a5db629fd728ecc688451eb1f866', kind: 'ceiling', unit: 'mg', max: 2, strict: false },
  // Prescribe ≤1mg as a starting dose and adjust doses of pitavastatin based on disease-specific guidelines. If dose >1mg needed for desired efficacy, con
  { id: 'pitavastatin-1', drugs: ['pitavastatin'], sha256: '4f0ae30fe52511b0eff8e6f42c432486d9d86a645cc74ebd225b2542c03172e4', kind: 'ceiling', unit: 'mg', max: 1, strict: false },
  // Prescribe ≤40mg as a starting dose and adjust doses of pravastatin based on disease-specific guidelines. If patient is tolerating 40mg dose but higher
  { id: 'pravastatin-40', drugs: ['pravastatin'], sha256: 'd270ef7910ab992cf3c2ed1429ed51122de2ae8c423cef352ce104aae6703b31', kind: 'ceiling', unit: 'mg', max: 40, strict: false },
  // Prescribe an alternative statin depending on the desired potency (see Figure 1 of PMID: 35152405 for recommendations for alternative statins). If simv
  { id: 'simvastatin-20-strict', drugs: ['simvastatin'], sha256: '30bb9d64e032d9022865450fa31ce37bac5924b04d2fb7795b6ab8831bf88a4c', kind: 'ceiling', unit: 'mg', max: 20, strict: true },
  // Prescribe an alternative statin depending on the desired potency (see Figure 1 of PMID: 35152405 for recommendations for alternative statins). If lova
  { id: 'lovastatin-20', drugs: ['lovastatin'], sha256: 'f9cf73e7828907185e66442b9d3c0bc510c3b35d66f1c47142621553dc680946', kind: 'ceiling', unit: 'mg', max: 20, strict: false },
  // Prescribe ≤10mg as a starting dose and adjust doses of rosuvastatin based on disease-specific and specific population guidelines. If dose >10mg needed
  { id: 'rosuvastatin-10-1', drugs: ['rosuvastatin'], sha256: 'd77e88e730d555fb0f7ba90485b9bb2e53e1746bd9573114f782b914853e373f', kind: 'ceiling', unit: 'mg', max: 10, strict: false },
  // Prescribe ≤10mg as a starting dose and adjust doses of rosuvastatin based on disease-specific and specific population guidelines. If dose >10mg needed
  { id: 'rosuvastatin-10-2', drugs: ['rosuvastatin'], sha256: '0d7edc8a316536f68d853f872b942a8b92fd4c24cb1648231ebb8a672c674e31', kind: 'ceiling', unit: 'mg', max: 10, strict: false },
  // Based on ABCG2 status, prescribe ≤20mg as a starting dose and adjust doses of rosuvastatin based on disease-specific and specific population guideline
  { id: 'rosuvastatin-20-1', drugs: ['rosuvastatin'], sha256: 'e898c6571a5dae8660a915e7935a66f670270043503f3594ca097d3bfa61f858', kind: 'ceiling', unit: 'mg', max: 20, strict: false },
  // Based on ABCG2 status, prescribe ≤20mg as a starting dose and adjust doses of rosuvastatin based on disease-specific and specific population guideline
  { id: 'rosuvastatin-20-2', drugs: ['rosuvastatin'], sha256: '4404225c44dacce9969d8d3e3edffef031f2d1ed5c4e5e78e90ec583851ed60f', kind: 'ceiling', unit: 'mg', max: 20, strict: false },
  // Based on SLCO1B1 status, prescribe ≤20mg as a starting dose and adjust doses of rosuvastatin based on disease-specific and specific population guideli
  { id: 'rosuvastatin-20-3', drugs: ['rosuvastatin'], sha256: 'e196490a66bc8341b082d43fcb1382c7867dc3455ecd392149e667f3925ea41b', kind: 'ceiling', unit: 'mg', max: 20, strict: false },
  // Prescribe ≤20mg as a starting dose and adjust doses of rosuvastatin based on disease-specific and specific population guidelines. If dose > 20mg neede
  { id: 'rosuvastatin-20-4', drugs: ['rosuvastatin'], sha256: '2ba5427a1fe73a5b8a616962b9aab28fd3a67a8179499b0e563237e86ddf4bec', kind: 'ceiling', unit: 'mg', max: 20, strict: false },
  // Prescribe ≤20mg as a starting dose and adjust doses of rosuvastatin based on disease-specific and specific population guidelines. If dose >20mg needed
  { id: 'rosuvastatin-20-5', drugs: ['rosuvastatin'], sha256: '324039aede4e07476561826b465d080771c14f1f79eac25640b6eea8de255923', kind: 'ceiling', unit: 'mg', max: 20, strict: false },
  // Prescribe ≤20mg as a starting dose and adjust doses of rosuvastatin based on disease-specific and specific population guidelines. If dose >20mg needed
  { id: 'rosuvastatin-20-6', drugs: ['rosuvastatin'], sha256: '461e3e318093bedbaba829c41c828a1da1f4874bc4cfdc463c3d15a1f61e524f', kind: 'ceiling', unit: 'mg', max: 20, strict: false },
  // Based on CYP2C9 status, prescribe ≤20mg per day as a starting dose and adjust doses of fluvastatin based on disease-specific guidelines. If dose >20mg
  { id: 'fluvastatin-20-1', drugs: ['fluvastatin'], sha256: '897ff2be2ba4ab7763306bd9050860c22799c7448bd1f40bdecff69e333f475c', kind: 'ceiling', unit: 'mg', max: 20, strict: false },
  // Based on CYP2C9 status, prescribe ≤20mg per day as a starting dose and adjust doses of fluvastatin based on disease-specific guidelines. If dose >20mg
  { id: 'fluvastatin-20-2', drugs: ['fluvastatin'], sha256: 'adf35724229c9e98a8961df67df25b67e9db7efdb9103324d1173141958b5666', kind: 'ceiling', unit: 'mg', max: 20, strict: false },
  // Prescribe ≤20mg per day as a starting dose and adjust doses of fluvastatin based on disease-specific guidelines. If dose >20mg needed for desired effi
  { id: 'fluvastatin-20-3', drugs: ['fluvastatin'], sha256: 'c35e0f53c9d41730d23442e40a8242eefcdc7f5af48b19589b6013b68fe1803e', kind: 'ceiling', unit: 'mg', max: 20, strict: false },
  // Based on CYP2C9 status, prescribe ≤40mg per day as a starting dose and adjust doses of fluvastatin based on disease-specific guidelines. If dose >40mg
  { id: 'fluvastatin-40-1', drugs: ['fluvastatin'], sha256: '0f9fffbc9bd041e08dd2fcb8ff4a3a92f2126d6a0a7d4c560dc9d26dc19a4cff', kind: 'ceiling', unit: 'mg', max: 40, strict: false },
  // Based on CYP2C9 status, prescribe ≤40mg per day as a starting dose and adjust doses of fluvastatin based on disease-specific guidelines. If dose >40mg
  { id: 'fluvastatin-40-2', drugs: ['fluvastatin'], sha256: 'b09eee87e25dd161600853200cce9ba99114589aa673dc62ae3ac1fcb501fb35', kind: 'ceiling', unit: 'mg', max: 40, strict: false },
  // Based on SLCO1B1 status, prescribe ≤40mg per day as a starting dose and adjust doses of fluvastatin based on disease-specific guidelines. If patient i
  { id: 'fluvastatin-40-3', drugs: ['fluvastatin'], sha256: 'a723cb1f5a16eb1eeec091dada3ad7a7647df7085362d359f3ca2c95c250b262', kind: 'ceiling', unit: 'mg', max: 40, strict: false },
  // Based on SLCO1B1 status, prescribe ≤40mg per day as a starting dose and adjust doses of fluvastatin based on disease-specific guidelines. If patient i
  { id: 'fluvastatin-40-4', drugs: ['fluvastatin'], sha256: '9a2679e306061ae377b6647c147733b8e69df167d1caecc908a764f36e67f71a', kind: 'ceiling', unit: 'mg', max: 40, strict: false },
  // Prescribe ≤40mg per day as a starting dose and adjust doses of fluvastatin based on disease-specific guidelines. If dose >40mg needed for desired effi
  { id: 'fluvastatin-40-5', drugs: ['fluvastatin'], sha256: '69711c03512ad44e040dd21111cb6e3fbc288747e326d6f15f5ee8f7e65faac4', kind: 'ceiling', unit: 'mg', max: 40, strict: false },
  // Prescribe ≤40mg per day as a starting dose and adjust doses of fluvastatin based on disease-specific guidelines. If patient is tolerating 40mg per day
  { id: 'fluvastatin-40-6', drugs: ['fluvastatin'], sha256: '512d5244eb1eef0abbf7e9ae348d08a5871e20ec8d4c34b4090aa79f61e05c27', kind: 'ceiling', unit: 'mg', max: 40, strict: false },
];

export const BY_HASH = new Map(FACTORS.map((f) => [f.sha256, f]));

const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });
const span = (lo, hi) => (lo === hi ? show(lo) : `${show(lo)} to ${show(hi)}`);

// doseArithmetic({ hash, drug, dose, maxDose, weight }) -> { lines, values } | { none: why } | { fault }
// `hash` is the matched row's `sha`, which the builder computed from that recommendation's text. A row whose hash is not in the table has
// no arithmetic by design (most rows name no number, or name one this table does not carry).
export function doseArithmetic({ hash, drug, dose, maxDose, weight } = {}) {
  const row = BY_HASH.get(String(hash || ''));
  if (!row) return { none: 'none-recorded' };
  if (row.drugs.length && drug && !row.drugs.includes(String(drug).toLowerCase())) return { none: 'drug-mismatch' };
  const lines = []; const values = {};
  if (row.kind === 'fixed') {
    lines.push(`CPIC's sentence names the dose itself: ${row.doses.map((d) => show(d)).join(' or ')} ${row.unit}. Nothing is multiplied.`);
    values.fixedDoses = row.doses;
    return { lines, values, row };
  }
  if (row.kind === 'range') {
    lines.push(`CPIC's sentence names a starting range itself: ${span(row.lo, row.hi)} ${row.unit}. Nothing is multiplied.`);
    if (row.cautionAt) lines.push(`It asks for caution at ${show(row.cautionAt)} ${row.unit} or more.`);
    values.rangeLow = row.lo; values.rangeHigh = row.hi;
    return { lines, values, row };
  }
  const blank = (v) => v === null || v === undefined || String(v).trim() === '';
  if (row.kind === 'ceiling') {
    if (blank(dose)) return { none: 'needs-dose', ask: `Enter the starting dose you would otherwise prescribe, in ${row.unit}, to set it against CPIC's ceiling.` };
    const f = inputFault([['the starting dose', dose, null, 100000, row.unit]]);
    if (f) return { fault: f };
    const d = Number(dose);
    const over = row.strict ? d >= row.max : d > row.max;
    values.ceiling = row.max; values.dose = sig(d); values.overCeiling = over;
    lines.push(`CPIC's ceiling is ${row.strict ? 'under' : 'at or under'} ${show(row.max)} ${row.unit} as a starting dose. The ${show(d)} ${row.unit} entered is ${over ? 'above it' : 'within it'}.`);
    return { lines, values, row };
  }
  // multiply
  if (blank(dose)) return { none: 'needs-dose', ask: `Enter ${row.dose} to apply CPIC's arithmetic to it.` };
  const f = inputFault([['the dose', dose, null, 100000, 'mg']]);
  if (f) return { fault: f };
  const d = Number(dose);
  const lo = d * row.lo; const hi = d * row.hi;
  values.dose = sig(d); values.low = sig(lo); values.high = sig(hi); values.factorLow = row.lo; values.factorHigh = row.hi;
  lines.push(`${row.lo === row.hi ? `× ${show(row.lo)}` : `× ${show(row.lo)} to × ${show(row.hi)}`} applied to ${row.dose} you entered (${show(d)} mg): ${span(lo, hi)} mg.`);
  if (row.only) lines.push(`CPIC states this ${row.only}.`);
  if (row.firstDose) lines.push(`CPIC leaves the first dose alone: ${row.firstDose}.`);
  if (row.note) lines.push(row.note);
  if (row.ceiling) {
    values.ceiling = row.ceiling;
    lines.push(`The same sentence names a maximum of ${show(row.ceiling)} ${row.ceilingUnit}.`);
  }
  if (row.capPerKg) {
    if (blank(weight)) lines.push(`CPIC caps the total starting dose at ${show(row.capPerKg)} ${row.capUnit}; enter a weight to work that cap out.`);
    else {
      const wf = inputFault([['the weight', weight, null, 500, 'kg']]);
      if (wf) return { fault: wf };
      const cap = Number(weight) * row.capPerKg;
      values.cap = sig(cap); values.capped = hi > cap;
      lines.push(`CPIC's cap at ${show(row.capPerKg)} ${row.capUnit} is ${show(cap)} mg a day at ${show(Number(weight))} kg; the figures above are ${hi > cap ? 'above it, so the cap governs' : 'within it'}.`);
    }
  }
  if (row.alsoMax) {
    if (blank(maxDose)) lines.push('CPIC applies the same fractions to the maximum recommended dose; enter that maximum to see it.');
    else {
      const mf = inputFault([['the maximum recommended dose', maxDose, null, 100000, 'mg']]);
      if (mf) return { fault: mf };
      const m = Number(maxDose);
      values.maxLow = sig(m * row.lo); values.maxHigh = sig(m * row.hi);
      lines.push(`The same fractions on the maximum recommended dose you entered (${show(m)} mg): ${span(m * row.lo, m * row.hi)} mg, which CPIC says to titrate up to with caution.`);
    }
  }
  return { lines, values, row };
}
