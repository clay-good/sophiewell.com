// spec-v610: the Edinburgh CT criteria for CAA-associated lobar intracerebral hemorrhage. A
// COMPANION-ON-A-DIFFERENT-MODALITY gap: `boston-caa` is in the catalog and needs MRI; this reads the
// non-contrast CT that has already been done. Every slug spelling and filename search returned 0.
//
// **TWO VERSIONS SHIP TOGETHER BECAUSE THE APOE RESULT IS ALMOST NEVER BACK WHEN THE CT IS READ.** The
// original criteria use subarachnoid extension, finger-like projections AND the APOE e4 genotype; the
// simplified criteria use the two CT findings only. This lib computes BOTH and reports both.
//
// **THE SIMPLIFIED VERSION CAN ONLY EVER READ LOWER THAN THE ORIGINAL, NEVER HIGHER.** Over all eight
// combinations of the three findings the two versions disagree in exactly THREE, and in every one of them
// the original is the higher category. The whole gap is APOE e4: dropping the genotype can only lose
// probability, never add it. A test enumerates all eight and pins this.
//
// **A WIDELY-REPEATED RESTATEMENT DESCRIBES THE ORIGINAL AS A COUNT OF ANY TWO OF THREE FINDINGS. IT IS NOT
// A COUNT.** The derivation paper defines high risk as "the presence of subarachnoid haemorrhage AND at
// least one other predictor" - subarachnoid extension is a GATE, not one of three interchangeable tokens.
// Under the count reading, finger-like projections plus APOE e4 WITHOUT subarachnoid extension would be
// high risk; under the criteria as published it is not, because there is no subarachnoid extension. This
// lib implements the derivation paper.
//
// **FINGER-LIKE PROJECTIONS NEVER COUNT ON THEIR OWN, IN EITHER VERSION.** They raise the category only once
// subarachnoid extension is already present. That asymmetry is easy to miss because the two findings are
// usually named in one breath.
//
// **THE SOURCE HAS A HOLE AT ONE REACHABLE COMBINATION.** The derivation paper describes low risk as "when
// no predictors were present", yet its own rule-out criterion is the absence of subarachnoid haemorrhage and
// APOE e4 - which would place finger-like projections ALONE in the low group even though a predictor is
// present. The simplified criteria settle it explicitly as low probability. This lib returns low and
// DISCLOSES the ambiguity at that one combination rather than silently picking a side (spec-v97).
//
// HIGH-STAKES: this estimates the PROBABILITY THAT CEREBRAL AMYLOID ANGIOPATHY CAUSED a lobar hemorrhage
// that has already been diagnosed on CT. It does NOT diagnose the hemorrhage, does NOT apply to deep or
// infratentorial hemorrhage, does NOT establish CAA - only pathology does that - does NOT replace the
// MRI-based Boston criteria, and does NOT decide anticoagulation (spec-v11 section 5.3).
//
// CATEGORIES AND RULES RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED (spec-v97). Where the derivation
// paper and a secondary restatement conflict, the derivation paper is followed and the conflict is stated:
//   - Rodrigues MA, Samarasekera N, Lerpiniere C, et al. The Edinburgh CT and genetic diagnostic criteria
//     for lobar intracerebral haemorrhage associated with cerebral amyloid angiopathy: model development and
//     diagnostic test accuracy study. Lancet Neurol. 2018;17(3):232-240.

export const FINDINGS = [
  { key: 'subarachnoidExtension', text: 'Subarachnoid extension of the lobar hemorrhage on CT' },
  { key: 'fingerLikeProjections', text: 'Finger-like projections from the hematoma on CT' },
];

export const LOW = 'Low probability';
export const MEDIUM = 'Medium probability';
export const HIGH = 'High probability';
export const ORDER = [LOW, MEDIUM, HIGH];

export const RULE_OUT = 'RULE OUT: neither subarachnoid extension nor APOE e4 - reported with 100% sensitivity for moderate or severe cerebral amyloid angiopathy in the derivation study.';
export const RULE_IN = 'RULE IN: subarachnoid extension AND either APOE e4 or finger-like projections - reported with 96% specificity in the derivation study.';

export const APOE_NOTE = 'THE APOE RESULT IS ALMOST NEVER BACK WHEN THE CT IS READ, which is why a simplified CT-only version exists and why both are computed here.';
export const DIRECTION_NOTE = 'THE SIMPLIFIED VERSION CAN ONLY EVER READ LOWER THAN THE ORIGINAL, NEVER HIGHER. Across all eight combinations of the three findings the two disagree in exactly three, and in every one of them the original is the higher category. The entire gap is APOE e4: dropping the genotype can only lose probability, never add it.';
export const NOT_A_COUNT_NOTE = 'A WIDELY-REPEATED RESTATEMENT DESCRIBES THE ORIGINAL AS A COUNT OF ANY TWO OF THREE FINDINGS. IT IS NOT A COUNT. The derivation paper defines high risk as subarachnoid extension AND at least one other predictor, so subarachnoid extension is a GATE rather than one of three interchangeable tokens. Under the count reading, finger-like projections plus APOE e4 without subarachnoid extension would be high risk; under the criteria as published it is not.';
export const FLP_NOTE = 'FINGER-LIKE PROJECTIONS NEVER COUNT ON THEIR OWN, IN EITHER VERSION. They raise the category only once subarachnoid extension is already present.';
export const HOLE_NOTE = 'DISCLOSURE AT THIS COMBINATION ONLY: the derivation paper describes low risk as "when no predictors were present", yet its own rule-out criterion is the absence of subarachnoid extension and APOE e4 - which places finger-like projections ALONE in the low group even though a predictor is present. The simplified criteria settle it explicitly as low probability, and that is what is returned here.';

const NOTE = `The Edinburgh criteria (Rodrigues and colleagues 2018) estimate the probability that cerebral amyloid angiopathy caused a lobar intracerebral hemorrhage already seen on CT. The original criteria use subarachnoid extension, finger-like projections and the APOE e4 genotype; the simplified criteria use the two CT findings alone. ${APOE_NOTE} ${DIRECTION_NOTE} ${NOT_A_COUNT_NOTE} ${FLP_NOTE} ${RULE_OUT} ${RULE_IN} This estimates a cause. It does not diagnose the hemorrhage, does not apply to deep or infratentorial hemorrhage, does not establish cerebral amyloid angiopathy, which only pathology does, does not replace the MRI-based Boston criteria, and does not decide anticoagulation.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// The derivation paper's own wording: low = neither gate finding; high = subarachnoid extension AND at
// least one other predictor; medium = everything else.
export function originalCategory(sah, flp, apoe) {
  if (sah && (apoe || flp)) return HIGH;
  if (!sah && !apoe) return LOW;
  return MEDIUM;
}

// The simplified, CT-only criteria.
export function simplifiedCategory(sah, flp) {
  if (!sah) return LOW;
  return flp ? HIGH : MEDIUM;
}

// All eight combinations, computed rather than transcribed.
export function enumerateCombinations() {
  const rows = [];
  for (const sah of [false, true]) {
    for (const flp of [false, true]) {
      for (const apoe of [false, true]) {
        const original = originalCategory(sah, flp, apoe);
        const simplified = simplifiedCategory(sah, flp);
        rows.push({
          sah, flp, apoe, original, simplified,
          agree: original === simplified,
          originalHigher: ORDER.indexOf(original) > ORDER.indexOf(simplified),
        });
      }
    }
  }
  return rows;
}

// input: subarachnoidExtension, fingerLikeProjections (yes/no) and apoe ('positive'|'negative'|'unknown').
export function edinburghCaa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let sah, flp, apoeRaw;
  try {
    sah = readBool(o.subarachnoidExtension, 'Subarachnoid extension');
    flp = readBool(o.fingerLikeProjections, 'Finger-like projections');
    apoeRaw = o.apoe === '' || o.apoe === undefined || o.apoe === null ? null : String(o.apoe).trim().toLowerCase();
    if (apoeRaw && !['positive', 'negative', 'unknown'].includes(apoeRaw)) {
      throw new Error('APOE e4 must be positive, negative or unknown.');
    }
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (sah === null || flp === null || !apoeRaw) {
    return { valid: false, message: `Answer both CT findings and give the APOE e4 status, using "unknown" if it is not back. ${APOE_NOTE}` };
  }

  const apoeKnown = apoeRaw !== 'unknown';
  const apoe = apoeRaw === 'positive';
  const simplified = simplifiedCategory(sah, flp);
  const original = apoeKnown ? originalCategory(sah, flp, apoe) : null;
  const disagree = original !== null && original !== simplified;
  const flpOnlyHole = flp && !sah && apoeKnown && !apoe;

  const parts = [];
  if (original) {
    parts.push(`Original Edinburgh criteria: ${original}. Simplified CT-only criteria: ${simplified}.`);
  } else {
    parts.push(`Simplified CT-only criteria: ${simplified}. The original criteria are NOT computed because the APOE e4 status is unknown. ${APOE_NOTE}`);
  }
  if (disagree) {
    parts.push(`THE TWO VERSIONS DISAGREE HERE, and the difference is APOE e4 alone. ${DIRECTION_NOTE}`);
  } else if (original) {
    parts.push(`The two versions agree here. ${DIRECTION_NOTE}`);
  }
  if (flpOnlyHole) parts.push(HOLE_NOTE);
  parts.push(NOT_A_COUNT_NOTE);
  parts.push(FLP_NOTE);
  parts.push(RULE_OUT);
  parts.push(RULE_IN);
  parts.push('This estimates a cause for a hemorrhage already seen on CT. It does not diagnose the hemorrhage, does not apply to deep or infratentorial hemorrhage, does not establish cerebral amyloid angiopathy, does not replace the MRI-based Boston criteria, and does not decide anticoagulation.');

  return {
    valid: true,
    original,
    simplified,
    disagree,
    apoeKnown,
    ruleOutMet: !sah && apoeKnown && !apoe,
    ruleInMet: sah && (flp || (apoeKnown && apoe)),
    band: simplified,
    bandLabel: original ? `Original ${original.toLowerCase()}; simplified ${simplified.toLowerCase()}` : `Simplified ${simplified.toLowerCase()} (APOE unknown)`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
