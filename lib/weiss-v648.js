// spec-v648: Weiss system (Weiss criteria) for adrenocortical carcinoma.
//
// A histopathologic count that distinguishes malignant adrenocortical carcinoma
// from a benign adrenocortical adenoma. Sources:
//   Weiss LM. Comparative histologic study of 43 metastasizing and nonmetastasizing
//   adrenocortical tumors. Am J Surg Pathol. 1984;8(3):163-169 (PMID 6703192; original
//   9 criteria, ≥ 4 cutoff). Weiss LM, Medeiros LJ, Vickery AL Jr. Pathologic features
//   of prognostic significance in adrenocortical carcinoma. Am J Surg Pathol.
//   1989;13(3):202-206 (PMID 2646997; MODIFIED, lowered the cutoff to ≥ 3).
//
// Nine criteria, each present = 1 point (0-9). A total >= 3 indicates adrenocortical
// CARCINOMA; 0-2 indicates a benign adenoma. Two definitional hazards, encoded
// carefully: the mitotic-rate criterion is present only when mitoses are STRICTLY
// GREATER THAN 5 per 50 HPF (exactly 5 does not score), and the clear-cell criterion
// is present when clear (lipid-rich) cells are <= 25% of the tumor (some secondary
// sources invert this to >= 25% -- that is wrong).
//
// Pure: no DOM, no clock, no network.

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

export const WEISS_CRITERIA = [
  { key: 'nuclearGrade', label: 'high nuclear grade (Fuhrman III-IV)' },
  { key: 'mitoticRate', label: 'mitotic rate > 5 per 50 HPF' },
  { key: 'atypicalMitoses', label: 'atypical mitotic figures' },
  { key: 'clearCells', label: 'clear (lipid-rich) cells <= 25% of the tumor' },
  { key: 'diffuseArchitecture', label: 'diffuse architecture (> 33% of the tumor)' },
  { key: 'necrosis', label: 'necrosis' },
  { key: 'venousInvasion', label: 'venous invasion' },
  { key: 'sinusoidalInvasion', label: 'sinusoidal invasion' },
  { key: 'capsularInvasion', label: 'capsular invasion' },
];

export const WEISS_MAX = 9;

export const WEISS_NOTE = 'Weiss system for adrenocortical carcinoma (Weiss LM, Am J Surg Pathol 1984;8(3):163-169; modified Weiss LM, Medeiros LJ, Vickery AL, Am J Surg Pathol 1989;13(3):202-206). Nine histopathologic criteria, each scoring 1 point when present: high nuclear grade (Fuhrman III-IV); mitotic rate greater than 5 per 50 high-power fields; atypical mitotic figures; clear (lipid-rich) cells making up 25% or less of the tumor; diffuse architecture in more than a third of the tumor; necrosis; venous invasion; sinusoidal invasion; and capsular invasion. A total of 3 or more indicates adrenocortical carcinoma (malignant); 0 to 2 indicates a benign adenoma. The threshold is the 1989 modified cutoff (the original 1984 paper used 4); older sources sometimes still cite 4. Two definitions are easy to get wrong: mitoses count only when STRICTLY more than 5 per 50 HPF, and the clear-cell criterion is present when clear cells are 25% OR LESS (not 25% or more). It is a pathologist’s diagnostic aid applied to a resected specimen, not a substitute for full pathologic review.';

export function weissAdrenal(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const present = [];
  for (const c of WEISS_CRITERIA) {
    if (onFlag(o[c.key])) { total += 1; present.push(c.label); }
  }
  const malignant = total >= 3;
  return {
    valid: true,
    total,
    max: WEISS_MAX,
    malignant,
    abnormal: malignant,
    bandLabel: malignant
      ? `Weiss ${total} of ${WEISS_MAX} — >= 3: adrenocortical carcinoma (malignant).`
      : `Weiss ${total} of ${WEISS_MAX} — <= 2: adrenocortical adenoma (benign).`,
    detail: present.length ? `Present: ${present.join('; ')}.` : 'no criteria present.',
    note: WEISS_NOTE,
  };
}
