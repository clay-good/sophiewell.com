// spec-v529 MCP wave: adapter for the Thwaites diagnostic index in lib/thwaites-v529.js. The dom keys mirror
// the browser renderer (views/group-v529.js) and META['thwaites'].example: thw-age, thw-bloodWbc,
// thw-duration, thw-csfWbc, thw-csfNeutrophils map to the lib args of the same name.
//
// THE SUMMARY LEADS WITH THE DIRECTION OF THE CUT, AND REPEATS IT, because this is the one score in the
// catalog that reads BACKWARDS: a LOW total favors tuberculous meningitis. An agent that applies the usual
// "higher means more severe / more likely" heuristic to a Thwaites total does not get a vaguer answer, it
// gets the OPPOSITE DIAGNOSIS. The compute result never returns a bare number either: `favors` is a word,
// and the band states the direction in prose.
//
// Each field's label carries its SIGNED weight, including the -5 on duration. An agent told only "duration
// of illness 6 days or more: yes/no" would have no way to know that answering yes moves the score five
// points toward tuberculous - the single largest movement any feature can produce, and the opposite of what
// "more days of illness" suggests to a naive reader.
//
// All five are required. Because one weight is negative, an omitted feature is NOT equivalent to a "no": a
// missing duration answer would leave out the term that most often decides the result.
//
// The summary states the two documented failure modes (partially treated bacterial meningitis, HIV-positive
// adults) and the differential the rule cannot see, because an agent reporting "Thwaites favors tuberculous
// meningitis" in a patient who has already had antibiotics is in exactly the situation where the rule is
// least trustworthy.

import * as T from '../../lib/thwaites-v529.js';

const YES_NO = ['no', 'yes'];

function signed(points) {
  return points > 0 ? `+${points}` : String(points);
}

export default [
  {
    id: 'thwaites',
    summary: `The Thwaites diagnostic index (Thwaites and colleagues 2002) distinguishes tuberculous from bacterial meningitis in adults. IMPORTANT - THIS SCORE READS IN THE OPPOSITE DIRECTION TO MOST: a total of 4 or LESS favors TUBERCULOUS meningitis, and a total ABOVE 4 favors BACTERIAL meningitis. Low is the tuberculous end. Five features are scored: age 36 years or older adds 2, a blood white cell count of 15,000 cells per microliter or more adds 4, a duration of illness of 6 days or more SUBTRACTS 5, a CSF total white cell count of 900 cells per microliter or more adds 3, and CSF neutrophils of 75 percent or more add 4. The total runs from ${T.THWAITES_RANGE.min} to ${T.THWAITES_RANGE.max}. The duration weight is the only negative one and the largest in magnitude, which encodes the clinical pattern that bacterial meningitis presents over hours to a couple of days while tuberculous meningitis presents over a week or more; a long history alone can flip an otherwise bacterial-looking picture to tuberculous. Its failure modes are specific and known: specificity collapses in partially treated bacterial meningitis, around 24 percent in one validation, which is exactly the patient who has already received antibiotics and whose CSF now looks lymphocytic; and it performs poorly in HIV-positive adults, having been derived in HIV-negative Vietnamese adults. It discriminates between two diagnoses only, so it says nothing about viral, fungal including cryptococcal, autoimmune, or malignant causes of a lymphocytic CSF. It does not diagnose either disease, does not replace CSF microscopy, culture, or nucleic-acid testing, and is not an indication to start or withhold antituberculous therapy or antibiotics; treating empirically for both while testing is pending is often correct.`,
    compute: T.thwaites,
    fields: T.THWAITES_FEATURES.map((f) => ({
      dom: `thw-${f.key}`,
      arg: f.key,
      kind: 'enum',
      values: YES_NO,
      required: true,
      label: `${f.text}? [yes = ${signed(f.points)}; no = 0] ${f.detail}`,
    })),
  },
];
