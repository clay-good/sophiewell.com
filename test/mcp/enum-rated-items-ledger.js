// spec-v1108: instruments built entirely of GRADED SELECTS that still answer a
// call carrying no inputs at all.
//
// EMPTY, and that is the point. It was a DEBT ledger, seeded with eleven
// readings by the sweep that found them, and drained across spec-v1109 to
// spec-v1112. It is kept rather than deleted because the gate reads it, and
// because the header is the record of what the debt was and how it went:
//
//   spec-v1108  ces-d      "CES-D 12/60: below the 16-point screening threshold"
//               mchat-rf   "A total of 0 is low risk. No further action is
//                           called for on this screen", screen: "negative"
//   spec-v1109  ssign-score, sepsis-obstetrics-score, essdai
//   spec-v1110  aims-tardive, bars-akathisia (and bfcrs, which was never listed
//               because it disclosed in words while having the same defect)
//   spec-v1111  ses-cd, gvhd-grade, peritoneal-cancer-index, arvc-tfc
//   spec-v1112  hfa-peff, mdq
//
// Ten of the thirteen were ONE defect: a lookup whose miss-value is the table's
// most favourable level, so an unstaged, unmeasured or unrated factor scored as
// the best finding the instrument can record. The other three were not, and
// each needed the instrument read rather than the pattern applied -- which is
// the reason spec-v1109 warned against assuming the remainder would match.
//
// A line here means: this tile answers an empty call with a band, a grade or a
// verdict, and has not been fixed yet. Adding one needs the reading it produced
// and which of the three things it is that required-field-ledger.js sets out.
// The gate's job is to stop new ones.
export const ENUM_RATED_ANSWERS_EMPTY = new Map([]);
