// spec-v699: Frontal Assessment Battery (FAB).
//
// A brief bedside battery of executive (frontal-lobe) function. Source:
//   Dubois B, Slachevsky A, Litvan I, Pillon B. The FAB: a Frontal Assessment Battery at
//   bedside. Neurology. 2000;55(11):1621-1626. (PMID 11113214.)
//
// Six subtests, each scored 0-3, summed to a total of 0-18 (higher = better executive
// function):
//   1. Conceptualization (similarities)
//   2. Mental flexibility (phonemic / lexical verbal fluency)
//   3. Motor programming (Luria motor series: fist-edge-palm)
//   4. Sensitivity to interference (conflicting instructions)
//   5. Inhibitory control (go / no-go task)
//   6. Environmental autonomy (prehension behavior)
//
// A total < 12 (of 18) suggests frontal / dysexecutive dysfunction and helps separate a
// frontal-dementia pattern from an Alzheimer-type pattern.
//
// Pure: no DOM, no clock, no network. Neutral task labels only; no proprietary item wording.

export const FAB_NOTE = 'Frontal Assessment Battery (FAB) (Dubois B, Slachevsky A, Litvan I, Pillon B, Neurology 2000;55(11):1621-1626). A brief bedside battery of executive (frontal-lobe) function with six subtests, each scored 0 to 3 and summed to a total of 0 to 18, where higher is better: conceptualization (similarities), mental flexibility (verbal fluency), motor programming (the Luria fist-edge-palm series), sensitivity to interference (conflicting instructions), inhibitory control (a go/no-go task), and environmental autonomy (prehension behavior). A total below 12 of 18 suggests frontal or dysexecutive dysfunction and can help separate a frontal-dementia pattern from an Alzheimer-type one, though the cut-point depends on age and education. It is a screening battery administered by an examiner, not a diagnosis, and it supports rather than replaces formal neuropsychological assessment and clinical judgment.';

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 3) return null;
  return n;
}

const SUBTESTS = ['conceptualization', 'flexibility', 'motorProgramming', 'interference', 'inhibitory', 'autonomy'];

export function fab(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const s of SUBTESTS) {
    const v = optIn(o[s]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: s, message: `Score ${s} from 0 to 3.`, note: FAB_NOTE };
    }
    total += v;
  }

  const low = total < 12;
  return {
    valid: true,
    score: total,
    tier: low ? 'impaired' : 'normal',
    abnormal: low,
    bandLabel: `FAB ${total} of 18`,
    band: `FAB ${total} of 18 — ${low ? 'suggests frontal / executive dysfunction' : 'within the normal range'} (cut-point < 12).`,
    detail: low
      ? 'Total below 12: suggests frontal / dysexecutive dysfunction. The cut-point depends on age and education.'
      : 'Total 12 or above: within the normal range for this screen. Higher is better executive function.',
    note: FAB_NOTE,
  };
}
