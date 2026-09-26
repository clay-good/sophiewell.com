// spec-v1510 tool 4: Medicaid unit rebate amount (URA), the one computation 340b-ceiling-price also uses.
//
// 42 U.S.C. 1396r-8(c) (uscode.house.gov, 2026-09-26): a brand (single source or innovator multiple source)
// drug's basic rebate is the greater of AMP minus best price or 23.1% of AMP (17.1% for clotting factors and
// drugs approved only for pediatric use); a generic's is 13% of AMP. Both add an inflation rebate: AMP minus
// the baseline AMP raised by the CPI-U change (generics measured from 2014 on). The brand total was capped at
// 100% of AMP for rebate periods before January 1, 2024; the cap no longer applies. Six decimals, as 42 CFR
// 10.10 computes the ceiling price.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const DRUG_CATEGORIES = [
  { value: 'brand', text: 'Single source or innovator multiple source' },
  { value: 'brand-171', text: 'Clotting factor, or approved only for pediatric use' },
  { value: 'generic', text: 'Noninnovator multiple source (generic)' },
];
const d6 = (x) => Math.round(x * 1e6) / 1e6;

// computeUra(o) -> { error } | { amp, basic, extra, ura, notes }
export function computeUra(o) {
  const cat = DRUG_CATEGORIES.some((c) => c.value === o.category) ? o.category : null;
  if (!cat) return { error: 'Choose the drug category.' };
  const f = inputFault([['the average manufacturer price per unit', o.amp, 0, 1e7, 'dollars']]);
  if (f) return { error: f };
  const amp = Number(o.amp);
  const notes = [];
  let basic;
  if (cat === 'generic') basic = 0.13 * amp;
  else {
    const pct = cat === 'brand' ? 0.231 : 0.171;
    if (String(o.bestPrice ?? '').trim()) {
      const bf = inputFault([['the best price per unit', o.bestPrice, 0, 1e7, 'dollars']]);
      if (bf) return { error: bf };
      basic = Math.max(amp - Number(o.bestPrice), pct * amp);
    } else {
      basic = pct * amp;
      notes.push('Best price was not entered, so the basic rebate is the minimum percentage; if AMP minus best price is larger, the rebate is larger.');
    }
  }
  let extra = 0;
  const have = ['baselineAmp', 'baselineCpi', 'currentCpi'].map((k) => String(o[k] ?? '').trim());
  if (have.every(Boolean)) {
    const xf = inputFault([['the baseline AMP', o.baselineAmp, 0, 1e7, 'dollars'], ['the baseline CPI-U', o.baselineCpi, 1, 10000, ''], ['the current CPI-U', o.currentCpi, 1, 10000, '']]);
    if (xf) return { error: xf };
    extra = Math.max(0, amp - Number(o.baselineAmp) * (Number(o.currentCpi) / Number(o.baselineCpi)));
  } else if (have.some(Boolean)) return { error: 'Enter all three inflation figures (baseline AMP, baseline CPI-U and the current CPI-U), or none.' };
  else notes.push('The inflation figures were not entered, so no inflation rebate is included; with one, the rebate is larger.');
  let ura = d6(basic + extra);
  const yr = String(o.year ?? '').trim();
  if (yr && Number(yr) < 2024 && cat !== 'generic' && ura > amp) { ura = d6(amp); notes.push('For rebate periods before January 1, 2024, the rebate was capped at 100% of AMP.'); }
  return { amp, basic: d6(basic), extra: d6(extra), ura, notes };
}

export function medicaidUra(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const r = computeUra(o);
  if (r.error) return { valid: false, message: r.error };
  const $6 = (x) => `$${x.toFixed(6)}`;
  return {
    valid: true,
    ura: r.ura,
    band: `Unit rebate amount ${$6(r.ura)}: basic ${$6(r.basic)} plus inflation ${$6(r.extra)} per unit.`,
    bandLabel: `URA ${$6(r.ura)}`,
    notes: r.notes,
    note: 'The arithmetic of 42 U.S.C. 1396r-8(c) on the figures entered; the rebate the state invoices and CMS\'s published URA control.',
  };
}
