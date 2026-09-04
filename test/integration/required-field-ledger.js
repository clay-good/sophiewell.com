// spec-v1037: the tiles that answer without a field the agent surface requires.
//
// A debt ledger, not a list of approvals -- the same shape as
// empty-form-ledger.js, and seeded the same way: from the sweep that found them.
// spec-v1037 fixed the ten whose answer was a decision (a PE excluded on a blank
// D-dimer, "Severe ARDS" on a blank blood gas, a creatinine clearance with no
// age, a BMI of 0 reported as "Underweight"). These 65 are what is left.
//
// Each line is one of three things, and telling them apart is the work:
//
//   1. The browser should ask, and does not yet. Most of these. Fix the tile and
//      delete the line.
//   2. The field is not really required, and mcp/fields.js is wrong. Fix the
//      declaration and delete the line -- the agent surface is refusing inputs it
//      could answer.
//   3. A genuine exception: the tile answers about what IS entered, and says so.
//      A partial score that states its own footing ("Scored from 9 of 10 items")
//      is the honest case, not a defect.
//
// The gate's job while this drains is to stop NEW ones. Adding a line needs a
// sentence in the pull request saying which of the three it is.
export const ANSWERS_WITHOUT_A_REQUIRED_FIELD = new Set([
  "abc-scale",
  "abcd2",
  "anticholinergic-burden",
  "anticholinergic-risk-scale",
  "apap-24h-max",
  "arc-hbr",
  "ascvd",
  "bard-score",
  "bess-balance-error",
  "bhutani-bilirubin",
  "big",
  "bland-altman",
  "carb-insulin-bolus",
  "cci-platelet",
  "ciwa",
  "cob-calc",
  "cohens-kappa",
  "conc-rate",
  "corrected-ca-na",
  "cows",
  "delta-check",
  "digoxin",
  "drip-rate",
  "em-time",
  "esas-symptom-assessment",
  "glasgow-imrie",
  "groningen-frailty-indicator",
  "hacor",
  "harris-hip-score",
  "harvey-bradshaw",
  "hscore-hlh",
  "hys-law",
  "ihs4",
  "insulin-correction",
  "intubation-difficulty-scale",
  "iv-osmolarity",
  "lis-murray",
  "lrinec",
  "magnesium-replacement",
  "midas",
  "mmt8-myositis",
  "modifier-order",
  "mtp-tracker",
  "must-nutrition",
  "niss",
  "norepi-equiv",
  "oxytocin-titration",
  "pelod2",
  "popq-staging",
  "posas-observer-scar",
  "posas-patient-scar",
  "prevent",
  "psofa",
  "qbl-pph",
  "restraint-timer",
  "rivermead-mobility-index",
  "roland-morris-disability",
  "rudas",
  "rvu-payment",
  "salt-score",
  "stewart-sid-sig",
  "vent-sbt-peep",
  "vis",
  "wat-1",
]);
