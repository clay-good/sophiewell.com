// spec-v546 MCP wave: adapter for the revised ASRM endometriosis stage in lib/rasrm-stage-v546.js. The dom
// key mirrors the browser renderer (views/group-v546.js) and META['rasrm-stage'].example: rasrm-total maps
// to the lib arg `total`.
//
// **THIS TOOL TAKES A TOTAL AND RETURNS A STAGE. IT DOES NOT SCORE A LAPAROSCOPY, AND THE SUMMARY SAYS SO
// TWICE.** That is a deliberate scope limit, not an omission. The revised ASRM point grid could not be
// verified against two independent sources: the scoring form is a single copyrighted figure, and the
// reproductions reachable are images or single transcriptions. An agent asked to "calculate the ASRM score"
// from a set of operative findings must decline and ask for the total from the completed form, because a
// grid assembled from one unverified transcription would produce authoritative-looking numbers nobody can
// check.
//
// **THE ONLY THING THIS TOOL COMPUTES IS THE BOUNDARY, SO THE BOUNDARY IS STATED EXACTLY.** A total of 40 is
// stage III; 41 is the first stage IV. This matters because one secondary account, paraphrasing a
// well-known criticism of the system, loosely calls a lone finding of complete cul-de-sac obliteration -
// which scores 40 - "severe disease". Under the published ranges that finding sits at the TOP of stage III.
// An agent that repeated the loose phrasing would upgrade a stage.
//
// THE 1979 AFS RANGES ARE NAMED, because they differ (stage III 16-30, stage IV 31-54) and an agent handed a
// bare "stage III" from an older record cannot interpret it without knowing the edition.
//
// A TOTAL OF 0 RETURNS NO STAGE, not stage I. Stage I begins at 1, and an agent should not round a zero up.
//
// The summary leads with the instrument's own weakness rather than burying it: the stage correlates POORLY
// with pain and with fertility outcome. "Stage IV endometriosis" is exactly the phrase an agent would
// otherwise convert into a prognosis about pain or conception, and the classification does not support that.

import * as R from '../../lib/rasrm-stage-v546.js';

export default [
  {
    id: 'rasrm-stage',
    summary: `The revised American Society for Reproductive Medicine stage of endometriosis, interpreted FROM a total score. IMPORTANT SCOPE: this tool takes the point total from a completed ASRM scoring form and returns the stage. IT DOES NOT SCORE A LAPAROSCOPY and cannot compute a total from operative findings. That is deliberate: the per-site, per-size and per-depth point grid could not be verified against two independent sources, because the scoring form is a single copyrighted figure and the available reproductions are images or single transcriptions, so a calculator built on one of them would produce authoritative-looking numbers that cannot be checked. If asked to calculate an ASRM score from findings, decline and ask for the total from the completed form. The stages are: 1 to 5 stage I, minimal; 6 to 15 stage II, mild; 16 to 40 stage III, moderate; and above 40 stage IV, severe. The maximum is ${R.RASRM_MAX}. THE III/IV BOUNDARY SITS AT EXACTLY 40: a total of 40 is stage III and 41 is the first stage IV. That is worth stating because one secondary account, paraphrasing a well-known criticism of the system, loosely calls a lone finding of complete cul-de-sac obliteration - which scores 40 - severe disease; under the published ranges it sits at the top of stage III. A total of 0 returns NO stage rather than stage I, since stage I begins at 1. These are the REVISED ranges, not the 1979 American Fertility Society ones, which placed stage III at 16 to 30 and stage IV at 31 to 54, so a stage taken from an older record without knowing its edition is not interpretable. A few individual values are confirmed and can be used to sanity-check a keyed total: complete posterior cul-de-sac obliteration scores 40, deep ovarian endometriosis larger than 3 cm scores 20, a dense ovarian or tubal adhesion tops out at 16, and if the fimbriated end of the tube is completely enclosed the point assignment is changed to 16. THE INSTRUMENT'S OWN WEAKNESS IS THE HEADLINE: the stage CORRELATES POORLY WITH PAIN AND WITH FERTILITY OUTCOME. A woman with stage I disease can have severe pain and a woman with stage IV can have none, and the stage does not predict whether she will conceive, so do not convert a stage into a prognosis. It is a surgical description of what was seen, so it cannot be assigned without a laparoscopy, it depends on the completeness of the surgical survey, and it says nothing about disease that was not visualised: deep infiltrating disease of the bowel, ureter or bladder is poorly captured, which is why the separate ENZIAN classification exists. It does not diagnose endometriosis, does not measure pain, does not predict fertility, and is not an indication for surgery, hormonal therapy, or assisted reproduction.`,
    compute: R.rasrmStage,
    fields: [
      {
        dom: 'rasrm-total',
        arg: 'total',
        kind: 'number',
        required: true,
        unit: 'points',
        label: `The revised ASRM point total from the COMPLETED scoring form, a whole number from 0 to ${R.RASRM_MAX}. This tool does not compute the total from operative findings.`,
      },
    ],
  },
];
