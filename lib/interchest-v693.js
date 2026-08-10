// spec-v693: INTERCHEST clinical prediction rule for chest pain in primary care.
//
// Estimates the probability of coronary artery disease (CAD) as the cause of chest pain in a
// primary-care patient, to help decide who needs expedited cardiac testing. Source:
//   Aerts M, Minalu G, Bosner S, et al. Pooled individual patient data from five countries
//   were used to derive a clinical prediction rule for coronary artery disease in primary
//   care. J Clin Epidemiol. 2017;81:120-128. (PMID 27773828.)
//
// Six items summed (range -1 to +5):
//   Age/sex: female >= 65 or male >= 55 ........................ +1
//   History of coronary artery disease ........................ +1
//   Pain brought on by exertion ............................... +1
//   Pain feels like "pressure" ................................ +1
//   Physician initially suspected a serious/cardiac cause ..... +1
//   Pain reproducible by palpation ............................ -1
//
// A score < 2 makes CAD unlikely (probability ~2.1%, NPV ~98%); a score >= 2 raises the
// probability to ~43% and should prompt expedited testing.
//
// Pure: no DOM, no clock, no network.

export const INTERCHEST_NOTE = 'INTERCHEST clinical prediction rule for chest pain in primary care (Aerts M, Minalu G, Bosner S, et al, J Clin Epidemiol 2017;81:120-128). It estimates the chance that chest pain is due to coronary artery disease. Six items are summed, from -1 to +5: age and sex with a woman 65 or older or a man 55 or older adding 1, a history of coronary artery disease adding 1, pain brought on by exertion adding 1, pain that feels like pressure adding 1, the physician initially suspecting a serious or cardiac cause adding 1, and pain that is reproducible by palpation subtracting 1. A score below 2 makes coronary disease unlikely, with a probability of about 2 percent and a negative predictive value near 98 percent; a score of 2 or more raises the probability to about 43 percent and should prompt expedited cardiac testing. It was derived in primary care and is not for acute coronary syndrome triage in the emergency department, and it supports rather than replaces clinical judgment.';

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function interchest(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const age = num(o.age);
  if (!Number.isFinite(age) || age < 0 || age > 130) {
    return { valid: false, code: 'MISSING_INPUT', field: 'age', message: 'Enter age in years.', note: INTERCHEST_NOTE };
  }
  if (!(o.sex === 'female' || o.sex === 'male')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'sex', message: 'Select sex.', note: INTERCHEST_NOTE };
  }

  let total = 0;
  const factors = [];
  const ageSexMet = (o.sex === 'female' && age >= 65) || (o.sex === 'male' && age >= 55);
  if (ageSexMet) { total += 1; factors.push('age/sex threshold (1)'); }
  if (truthy(o.historyCad)) { total += 1; factors.push('history of CAD (1)'); }
  if (truthy(o.exertion)) { total += 1; factors.push('pain on exertion (1)'); }
  if (truthy(o.pressure)) { total += 1; factors.push('pressure-like pain (1)'); }
  if (truthy(o.physicianSuspicion)) { total += 1; factors.push('physician suspected cardiac (1)'); }
  if (truthy(o.reproduciblePalpation)) { total -= 1; factors.push('reproducible by palpation (-1)'); }

  const high = total >= 2;
  return {
    valid: true,
    score: total,
    tier: high ? 'not-excluded' : 'unlikely',
    abnormal: high,
    factors,
    probability: high ? 'about 43%' : 'about 2.1%',
    bandLabel: `INTERCHEST ${total}`,
    band: `INTERCHEST ${total} — CAD ${high ? 'not excluded (probability about 43%); expedite cardiac testing' : 'unlikely (probability about 2.1%)'}.`,
    detail: high
      ? 'Score 2 or more: coronary disease is not excluded (~43% probability); arrange expedited cardiac assessment.'
      : 'Score under 2: coronary disease is unlikely (~2.1% probability, NPV ~98%).',
    note: INTERCHEST_NOTE,
  };
}
