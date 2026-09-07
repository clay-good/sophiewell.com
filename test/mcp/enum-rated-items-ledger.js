// spec-v1108: instruments built entirely of GRADED SELECTS that still answer a
// call carrying no inputs at all.
//
// A DEBT LEDGER, not a list of approvals -- the same shape as
// test/integration/required-field-ledger.js, and seeded the same way: by running
// the sweep that found them and writing down what each one said.
//
// spec-v1073 fixed this for instruments whose items are `kind: 'number'` and
// declared them `required`. Its gate filtered on that kind, so the 263 tiles
// whose items are `kind: 'enum'` -- the same graded controls, described a
// different way in the registry -- were never asked the question. Widening it
// found 21. Two were fixed in the wave that widened it, because they are
// screening instruments and what they said was a result:
//
//   ces-d     "CES-D 12/60: below the 16-point screening threshold" -- twelve
//             points invented by four reverse-scored blanks.
//   mchat-rf  "A total of 0 is low risk. No further action is called for on
//             this screen", screen: "negative".
//
// Eight more were already refusing or disclosing in words and are not listed.
// Three more were drained in spec-v1109 -- ssign-score, sepsis-obstetrics-score
// and essdai, all the same shape: a lookup whose miss-value is the table's most
// FAVOURABLE level, so an unstaged, unmeasured or unrated factor was scored as
// the best finding there is. Two more in spec-v1110 (aims-tardive,
// bars-akathisia), along with `bfcrs`, which was not on this list because it
// discloses in words but had the identical defect and shares their controls.
// These six are what is left. Each line carries the reading it produced, so
// the next pass starts from evidence rather than from a bare id -- but they have
// NOT been read one at a time yet, and that is stated rather than implied. Each
// is one of the three things required-field-ledger.js sets out: the tile should
// ask and does not; or its items are counts rather than grades, in which case it
// belongs in COUNTS_NOT_GRADES with the reason; or it answers about what IS
// entered and should say so.
//
// The gate's job while this drains is to stop NEW ones. Removing a line is a fix.
export const ENUM_RATED_ANSWERS_EMPTY = new Map([
  ['ses-cd', 'SES-CD 0/56: endoscopic remission -- a Crohn\'s endoscopic score from an endoscopy nobody reported'],
  ['hfa-peff', 'total 0, verdict "unlikely" -- heart failure with preserved ejection fraction ruled unlikely from three unrated domains'],
  ['mdq', 'positive: false, yesCount 0, impairmentLevel "not rated" -- a bipolar screener returning negative, though it does say the impairment was not rated'],
  ['gvhd-grade', 'grade 0, skin/liver/GI stages all 0, severe: false -- three unstaged organs'],
  ['peritoneal-cancer-index', 'PCI 0 of 39, regionsInvolved 0 -- thirteen abdominal regions nobody looked at'],
  ['arvc-tfc', 'points 0, tier "not-met", majors 0, minors 0 -- task-force criteria not met, from six unassessed categories'],
]);
