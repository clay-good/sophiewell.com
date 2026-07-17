// spec-v359: NPIAP pressure injury staging (Stage 1-4, Unstageable, Deep Tissue Pressure Injury) — the
// standard classification of a pressure injury by the depth of tissue loss, once an injury has
// developed. The catalog carries the Braden Scale (pressure-injury RISK) and the Bates-Jensen wound
// assessment, but not the NPIAP staging itself. "pressure injury stage" / "pressure ulcer stage" /
// "npiap stage" routed to nothing.
//
// HIGH-STAKES: this reports the NPIAP STAGE the clinician/nurse has determined from the wound, NOT a
// diagnosis, a treatment decision, or a prognosis (spec-v11 §5.3). Staging describes tissue loss, not
// healing (a healing Stage 4 is not "reverse-staged"); the care decision stays with the wound-care
// team.
//
// DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Edsberg LE, Black JM, Goldberg M, McNichol L, Moore L, Sieggreen M. Revised National Pressure
//     Ulcer Advisory Panel Pressure Injury Staging System. J Wound Ostomy Continence Nurs.
//     2016;43(6):585-597 (the 2016 revision: "injury" not "ulcer", Arabic numerals).
//   - NPIAP and wound-care references reproducing the same Stage 1-4 / Unstageable / DTPI definitions.
//
// Stages (depth of tissue loss):
//   1           : non-blanchable erythema of intact skin.
//   2           : partial-thickness skin loss with exposed dermis.
//   3           : full-thickness skin loss (subcutaneous fat may be visible). Flagged.
//   4           : full-thickness skin and tissue loss (fascia, muscle, tendon, or bone exposed).
//                 Flagged.
//   unstageable : obscured full-thickness skin and tissue loss (slough or eschar obscures the base).
//                 Flagged.
//   dtpi        : deep tissue pressure injury - persistent non-blanchable deep red, maroon, or purple
//                 discoloration. Flagged.

const STAGES = {
  1: { stage: 'Stage 1', severe: false, text: 'NPIAP Stage 1 pressure injury - non-blanchable erythema of intact skin.' },
  2: { stage: 'Stage 2', severe: false, text: 'NPIAP Stage 2 pressure injury - partial-thickness skin loss with exposed dermis.' },
  3: { stage: 'Stage 3', severe: true, text: 'NPIAP Stage 3 pressure injury - full-thickness skin loss; subcutaneous fat may be visible, but fascia, muscle, tendon, and bone are not exposed.' },
  4: { stage: 'Stage 4', severe: true, text: 'NPIAP Stage 4 pressure injury - full-thickness skin and tissue loss with exposed or palpable fascia, muscle, tendon, ligament, cartilage, or bone.' },
  UNSTAGEABLE: { stage: 'Unstageable', severe: true, text: 'NPIAP Unstageable pressure injury - obscured full-thickness skin and tissue loss; the base is covered by slough or eschar, so the true depth (Stage 3 or 4) cannot be confirmed.' },
  DTPI: { stage: 'Deep Tissue Pressure Injury', severe: true, text: 'NPIAP Deep Tissue Pressure Injury - persistent non-blanchable deep red, maroon, or purple discoloration of intact or non-intact skin (or a blood-filled blister) from pressure and/or shear.' },
};

const NOTE = 'NPIAP pressure injury staging (2016 revision) classifies a pressure injury by depth of tissue loss. 1: non-blanchable erythema, intact skin. 2: partial-thickness loss, exposed dermis. 3: full-thickness loss (fat may be visible). 4: full-thickness loss with exposed fascia / muscle / tendon / bone. Unstageable: full-thickness loss obscured by slough or eschar. Deep Tissue Pressure Injury: persistent non-blanchable deep discoloration. Stages 3-4, Unstageable, and DTPI are full-thickness or serious injuries. Staging describes tissue loss, not healing (a healing wound is not reverse-staged). This reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  1: '1', 2: '2', 3: '3', 4: '4',
  I: '1', II: '2', III: '3', IV: '4',
  U: 'UNSTAGEABLE', UNSTAGEABLE: 'UNSTAGEABLE', UNSTAGABLE: 'UNSTAGEABLE',
  DTI: 'DTPI', DTPI: 'DTPI', 'DEEP TISSUE': 'DTPI', 'DEEP TISSUE INJURY': 'DTPI',
};

// input:
//   stage: '1'-'4', 'unstageable', or 'dtpi' (case-insensitive; also accepts roman I-IV, 'u', 'dti')
export function pressureInjuryStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the pressure injury stage (1-4, Unstageable, or Deep Tissue Pressure Injury).' };
  }
  return {
    valid: true,
    stage: s.stage,
    severe: s.severe,
    abnormal: s.severe,
    bandLabel: `NPIAP ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
