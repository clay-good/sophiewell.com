// spec-v361: Tanner staging / Sexual Maturity Rating (SMR), stages 1-5, for the three Marshall-Tanner
// development scales (female breast, male genitalia, and pubic hair). The clinician picks the scale and
// the stage; the tile reports the standard description. The catalog has pediatric growth tiles but no
// Tanner (pubertal) staging reference. "tanner stage" / "sexual maturity rating" / "smr" routed to
// nothing.
//
// HIGH-STAKES: this reports the Tanner STAGE description the clinician has determined on examination,
// NOT a diagnosis (precocious or delayed puberty), an age assessment, or a treatment decision
// (spec-v11 §5.3). Whether a stage is early or late for age is an age-in-context judgment the clinician
// makes; the assessment stays with the treating clinician.
//
// DESCRIPTIONS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Marshall WA, Tanner JM. Variations in pattern of pubertal changes in girls. Arch Dis Child.
//     1969;44(235):291-303, and Variations in the pattern of pubertal changes in boys. Arch Dis Child.
//     1970;45(239):13-23.
//   - StatPearls (Tanner Stages) and standard pediatric references reproducing the same stage 1-5
//     breast / genital / pubic-hair descriptions.

const SCALES = {
  BREAST: {
    label: 'breast (female)',
    stages: {
      1: 'prepubertal; elevation of the papilla only.',
      2: 'breast bud stage - elevation of the breast and papilla as a small mound, with enlargement of the areolar diameter.',
      3: 'further enlargement of the breast and areola, without separation of their contours.',
      4: 'the areola and papilla form a secondary mound projecting above the level of the breast.',
      5: 'mature stage - projection of the papilla only, the areola having recessed to the general contour of the breast.',
    },
  },
  GENITAL: {
    label: 'genital (male)',
    stages: {
      1: 'prepubertal; testes, scrotum, and penis are of about the same size and proportion as in early childhood.',
      2: 'enlargement of the scrotum and testes, with reddening and change in texture of the scrotal skin; little or no penile enlargement.',
      3: 'enlargement of the penis (length first), with further growth of the testes and scrotum.',
      4: 'increased penis size in length and breadth with development of the glans; testes and scrotum larger, scrotal skin darker.',
      5: 'adult genitalia in size and shape.',
    },
  },
  PUBIC: {
    label: 'pubic hair',
    stages: {
      1: 'prepubertal; no pubic hair (only vellus hair as over the abdomen).',
      2: 'sparse growth of long, slightly pigmented, downy, straight or slightly curled hair, mainly at the base of the penis or along the labia.',
      3: 'hair becomes darker, coarser, and more curled, spreading sparsely over the pubic junction.',
      4: 'adult-type hair covering a smaller area than in the adult, not yet spread to the medial thighs.',
      5: 'adult in quantity and type, distributed as an inverse triangle and spread to the medial thighs.',
    },
  },
};

const SCALE_ALIAS = {
  BREAST: 'BREAST', B: 'BREAST', FEMALE: 'BREAST',
  GENITAL: 'GENITAL', GENITALIA: 'GENITAL', G: 'GENITAL', MALE: 'GENITAL',
  PUBIC: 'PUBIC', 'PUBIC HAIR': 'PUBIC', PH: 'PUBIC', P: 'PUBIC', HAIR: 'PUBIC',
};

const NOTE = 'Tanner staging (Sexual Maturity Rating, Marshall & Tanner 1969/1970) grades pubertal development on three scales - female breast, male genitalia, and pubic hair - each from stage 1 (prepubertal) to stage 5 (adult). Whether a stage is early or late is an age-in-context judgment (precocious vs delayed puberty) the clinician makes; the stages themselves are descriptive. This reports the stage description the clinician has determined, not a diagnosis, an age assessment, or a treatment decision.';

// input:
//   scale: 'breast' / 'genital' / 'pubic' (case-insensitive; aliases b/g/ph, female/male, etc.)
//   stage: 1-5 (string or number)
export function tannerStaging(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rawScale = String(o.scale == null ? '' : o.scale).trim().toUpperCase();
  const scaleKey = Object.prototype.hasOwnProperty.call(SCALE_ALIAS, rawScale) ? SCALE_ALIAS[rawScale] : rawScale;
  const scale = SCALES[scaleKey];
  if (!scale) {
    return { valid: false, message: 'Select the Tanner scale (breast, genital, or pubic hair).' };
  }
  const rawStage = String(o.stage == null ? '' : o.stage).trim();
  const desc = Object.prototype.hasOwnProperty.call(scale.stages, rawStage) ? scale.stages[rawStage] : null;
  if (!desc) {
    return { valid: false, message: 'Select the Tanner stage (1 to 5).' };
  }
  const label = `Tanner ${scale.label} stage ${rawStage}`;
  return {
    valid: true,
    scale: scale.label,
    stage: Number(rawStage),
    abnormal: false,
    bandLabel: label,
    band: `${label} - ${desc}`,
    note: NOTE,
  };
}
