// spec-v546: the revised ASRM stage of endometriosis, interpreted FROM a total score.
//
// WHOLE-CONCEPT GAP: "rasrm", "endometriosis", "enzian", and "cul-de-sac" were all zero-hit across
// corpus.json, app.js, and lib/meta.js. (The `asrm` hits belong to the Rotterdam PCOS criteria, which ESHRE
// and ASRM co-sponsored — an unrelated instrument.) The catalog had no endometriosis content of any kind.
//
// **THIS TILE DELIBERATELY DOES NOT COMPUTE THE SCORE. IT INTERPRETS ONE.** That is the whole design, and
// the reason for it is worth stating plainly: the revised ASRM point grid — the per-site, per-size, per-depth
// weights for peritoneal and ovarian implants and the filmy-versus-dense adhesion weights — could not be
// double-confirmed. The scoring form is a single copyrighted figure, and every reproduction reachable is an
// image or a single translated transcription. A calculator built on one unverified transcription would
// produce numbers that look authoritative and are not checkable, so this tile takes the total the clinician
// has already computed from the ASRM form in front of them and does the part that IS fully confirmed:
// converting a total into a stage.
//
// THE FOUR STAGES, CONFIRMED ACROSS FOUR INDEPENDENT SOURCES:
//   Stage I    minimal    1 to 5
//   Stage II   mild       6 to 15
//   Stage III  moderate   16 to 40
//   Stage IV   severe     above 40
// Maximum 150.
//
// **THE III/IV BOUNDARY SITS AT EXACTLY 40, AND THE TILE SAYS SO.** A total of 40 is stage III, and 41 is
// the first stage IV. This matters because the boundary is the only thing this tile computes: one secondary
// account, describing a well-known criticism of the system, loosely calls a lone finding of complete
// cul-de-sac obliteration — which scores 40 — "severe disease". Under the published ranges that finding is
// at the TOP of stage III, not in stage IV. The four-source ranges are used and the boundary behaviour is
// pinned by its own test.
//
// DO NOT CONFUSE THESE WITH THE 1979 AFS STAGES, which used different cut points (stage III 16 to 30, stage
// IV 31 to 54). A stage copied from an older record without knowing which edition produced it is not
// interpretable, and this tile states which edition it implements.
//
// A FEW ANCHOR VALUES ARE CONFIRMED AND ARE OFFERED AS SANITY CHECKS RATHER THAN AS A CALCULATOR: complete
// posterior cul-de-sac obliteration scores 40; deep ovarian endometriosis larger than 3 cm scores 20; a
// dense ovarian or tubal adhesion tops out at 16; and if the fimbriated end of the fallopian tube is
// completely enclosed, the point assignment is changed to 16 regardless of the adhesion extent otherwise
// scored. These help a user notice a mis-keyed total; they are not a substitute for the form.
//
// HIGH-STAKES, AND THE INSTRUMENT'S OWN WEAKNESS IS THE HEADLINE: the revised ASRM stage CORRELATES POORLY
// WITH PAIN AND WITH FERTILITY OUTCOME. A woman with stage I disease can have severe pain and a woman with
// stage IV can have none, and the stage does not predict whether she will conceive. It is a surgical
// description of what was seen at laparoscopy, so it cannot be assigned without one, it depends on the
// completeness of the surgical survey, and it says nothing about disease that was not visualised — deep
// infiltrating disease of the bowel, ureter or bladder is poorly captured, which is why the separate ENZIAN
// classification exists. It does not diagnose endometriosis, does not measure pain, does not predict
// fertility, and is not an indication for surgery, hormonal therapy, or assisted reproduction
// (spec-v11 section 5.3). The clinical decision stays with the clinician.
//
// STAGES, RANGES, AND THE ANCHOR VALUES RE-FETCHED, NEVER RECALLED (spec-v97). The stage ranges, the four
// stage names, the 150 maximum, and each anchor below were confirmed across multiple independent sources;
// the full point grid was NOT, and is therefore not implemented:
//   - Revised American Society for Reproductive Medicine classification of endometriosis: 1996.
//     Fertil Steril. 1997;67(5):817-821.

export const RASRM_STAGES = [
  { stage: 'I', name: 'minimal', min: 1, max: 5 },
  { stage: 'II', name: 'mild', min: 6, max: 15 },
  { stage: 'III', name: 'moderate', min: 16, max: 40 },
  { stage: 'IV', name: 'severe', min: 41, max: 150 },
];

export const RASRM_MAX = 150;

// Confirmed individual values, offered as sanity checks on a keyed total, not as a scoring engine.
export const RASRM_ANCHORS = [
  { text: 'Complete posterior cul-de-sac obliteration', points: 40 },
  { text: 'Deep ovarian endometriosis larger than 3 cm', points: 20 },
  { text: 'A dense ovarian or tubal adhesion, at its maximum', points: 16 },
  { text: 'Fimbriated end of the tube completely enclosed — the point assignment is changed to 16', points: 16 },
];

const NOTE = 'The revised American Society for Reproductive Medicine classification stages endometriosis from a total score computed at laparoscopy: stage I minimal for 1 to 5, stage II mild for 6 to 15, stage III moderate for 16 to 40, and stage IV severe above 40, with a maximum of 150. This tile interprets a total; it deliberately does not compute one. The per-site, per-size and per-depth point grid could not be verified against two independent sources, because the scoring form is a single copyrighted figure and the reproductions available are images or single transcriptions, so a calculator built on one of them would produce numbers that look authoritative and cannot be checked. The boundary between stage III and stage IV sits at exactly 40: a total of 40 is stage III and 41 is the first stage IV. That matters because one secondary account, describing a well-known criticism of the system, loosely calls a lone finding of complete cul-de-sac obliteration, which scores 40, severe disease; under the published ranges it sits at the top of stage III. These are the revised ranges and not the 1979 American Fertility Society ones, which placed stage III at 16 to 30 and stage IV at 31 to 54, so a stage copied from an older record without its edition is not interpretable. The instrument’s own weakness is the headline: the stage correlates poorly with pain and with fertility outcome. A woman with stage I disease can have severe pain and a woman with stage IV can have none, and the stage does not predict whether she will conceive. It is a surgical description of what was seen, so it cannot be assigned without a laparoscopy, it depends on the completeness of the surgical survey, and it says nothing about disease that was not visualised: deep infiltrating disease of the bowel, ureter or bladder is poorly captured, which is why the separate ENZIAN classification exists. It does not diagnose endometriosis, does not measure pain, does not predict fertility, and is not an indication for surgery, hormonal therapy, or assisted reproduction.';

// input: total -- the revised ASRM point total from the completed form, 0 to 150.
export function rasrmStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.total;

  if (raw === '' || raw === null || raw === undefined) {
    return { valid: false, message: 'Enter the revised ASRM point total from the completed scoring form. This tile interprets a total; it does not compute one.' };
  }
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0 || n > RASRM_MAX) {
    return { valid: false, message: `The total must be a number from 0 to ${RASRM_MAX}.` };
  }
  if (!Number.isInteger(n)) {
    return { valid: false, message: 'The revised ASRM total is a whole number of points.' };
  }

  if (n === 0) {
    return {
      valid: true,
      total: 0,
      stage: null,
      stageName: null,
      bandLabel: 'No revised ASRM stage (total 0)',
      band: 'A total of 0 falls below stage I, which begins at 1. The staging applies to a laparoscopy at which endometriosis was found; a total of zero means no scored disease rather than a stage. Note that the stage correlates poorly with pain and with fertility outcome either way.',
      note: NOTE,
    };
  }

  const entry = RASRM_STAGES.find((s) => n >= s.min && n <= s.max);
  const atBoundary = n === 40 || n === 41;
  const boundaryNote = atBoundary
    ? ' Note the III/IV boundary sits at exactly 40: a total of 40 is stage III and 41 is the first stage IV.'
    : '';

  return {
    valid: true,
    total: n,
    stage: entry.stage,
    stageName: entry.name,
    bandLabel: `Revised ASRM stage ${entry.stage} (${entry.name})`,
    band: `Total ${n} of ${RASRM_MAX} is stage ${entry.stage}, ${entry.name} (${entry.min}${entry.stage === 'IV' ? ' or above' : ` to ${entry.max}`}).${boundaryNote} These are the revised ranges, not the 1979 American Fertility Society ones. The stage correlates poorly with pain and with fertility outcome: stage I disease can be severely painful and stage IV can be painless, and the stage does not predict conception.`,
    note: NOTE,
  };
}
