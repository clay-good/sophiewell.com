// spec-v560 MCP wave: adapter for the al Naqeeb aEEG amplitude classification in
// lib/anaqeeb-aeeg-v560.js. The dom keys mirror the browser renderer (views/group-v560.js) and
// META['anaqeeb-aeeg'].example.
//
// **THE CLASSIFICATION IS NOT EXHAUSTIVE, AND AN AGENT WILL FILL THE HOLES IF NOT TOLD.** Two regions of
// the input space fall in NO published category: an upper margin of EXACTLY 10 microV (every category
// requires strictly above or strictly below 10), and an upper margin below 10 with a lower margin above 5.
// Both are reachable from a real measurement. A three-way classifier presented with two thresholds looks
// like it should partition the plane; it does not. The tool returns `classified: false` with the reason
// rather than rounding to the nearest category, because the holes sit exactly where a reader most needs to
// know the instrument is silent.
//
// **SEIZURE ACTIVITY IS A SEPARATE FLAG AND IS NEVER FOLDED INTO THE AMPLITUDE CATEGORY.** The original
// scheme defines seizures ALONGSIDE the amplitude classification, not within it. An infant with a normal
// amplitude and recorded seizures is NOT thereby "moderately abnormal". Collapsing the two would destroy
// the distinction the scheme is built on.
//
// **SLEEP-WAKE CYCLING IS NOT ASSESSED HERE AT ALL** - it belongs to the later pattern-based schemes - so
// its absence must not be read as normal.
//
// THE MIDDLE BAND'S LOWER BOUNDARY DIFFERS BY ONE GLYPH between the original ("5 microV or below") and an
// independent review ("less than 5"). The NUMBERS are identical, so this is a convention rather than a
// value disagreement; the original is followed, and the result discloses it only at a lower margin of
// exactly 5.
//
// **THIS IS NOT A THERAPEUTIC HYPOTHERMIA ELIGIBILITY CRITERION**, which is the decision it would most
// damagingly be misused to settle. Cooling is decided on published clinical and biochemical criteria within
// a time window.

import * as A from '../../lib/anaqeeb-aeeg-v560.js';

export default [
  {
    id: 'anaqeeb-aeeg',
    summary: `The al Naqeeb amplitude-integrated EEG (aEEG) amplitude classification for neonatal encephalopathy (al Naqeeb and colleagues, Pediatrics 1999). It sorts the aEEG into THREE categories from two continuous inputs, the UPPER and LOWER margins of the trace in microvolts. It is a DECISION TABLE, NOT A SCORE - nothing is summed. NORMAL AMPLITUDE: upper margin above ${A.UPPER_THRESHOLD} microV AND lower margin above ${A.LOWER_THRESHOLD} microV. MODERATELY ABNORMAL: upper margin above ${A.UPPER_THRESHOLD} microV AND lower margin ${A.LOWER_THRESHOLD} microV OR BELOW. SUPPRESSED: upper margin below ${A.UPPER_THRESHOLD} microV AND lower margin below ${A.LOWER_THRESHOLD} microV. THE CLASSIFICATION IS NOT EXHAUSTIVE AND THE HOLES MUST NOT BE FILLED IN. Two regions of the input space fall in NO published category: an upper margin of EXACTLY ${A.UPPER_THRESHOLD} microV, because every category requires the upper margin to be strictly above or strictly below ${A.UPPER_THRESHOLD}; and an upper margin below ${A.UPPER_THRESHOLD} together with a lower margin above ${A.LOWER_THRESHOLD}, which no category describes. Both are reachable from real measurements. Two thresholds in a three-way classifier look as though they should partition the plane, and they do not, so this tool returns classified false with the reason rather than rounding to the nearest category. SEIZURE ACTIVITY IS A SEPARATE FINDING AND IS NEVER FOLDED INTO THE AMPLITUDE CATEGORY: the original scheme defines seizures alongside the classification, not within it, so an infant with a NORMAL amplitude and recorded seizures is NOT thereby moderately abnormal, and the two are reported side by side. SLEEP-WAKE CYCLING IS NOT ASSESSED BY THIS CLASSIFICATION AT ALL - it belongs to the later pattern-based schemes - so its absence here must not be read as it being normal. The moderately abnormal band's lower boundary differs by ONE GLYPH between sources, the original printing "${A.LOWER_THRESHOLD} microV or below" and an independent review restating it as "less than ${A.LOWER_THRESHOLD}"; the numbers are identical, so the original is followed and the divergence is disclosed only at a lower margin of exactly ${A.LOWER_THRESHOLD}. For orientation: ${A.HEALTHY_CONTROL_REFERENCE} THE READING IS DEVICE AND MONTAGE DEPENDENT. Voltage is affected by interelectrode distance, scalp edema and extracerebral signals including the ECG, so the same brain produces different margins on different setups and the numbers are NOT transferable between them. aEEG is a filtered, compressed, TWO-CHANNEL summary rather than a conventional EEG, and it CANNOT EXCLUDE SEIZURES, which it is well known to miss. This does not diagnose hypoxic-ischemic encephalopathy, which is a clinical diagnosis, and it does not grade it, since Sarnat staging is a different instrument on a different axis. IT IS NOT A THERAPEUTIC HYPOTHERMIA ELIGIBILITY CRITERION: cooling is decided on published clinical and biochemical criteria within a time window, and this classification neither establishes nor excludes eligibility, which is the decision it would most damagingly be misused to settle. It does not predict outcome for an individual infant.`,
    compute: A.anaqeebAeeg,
    fields: [
      {
        dom: 'anaqeeb-upper', arg: 'upperMargin', kind: 'number', unit: 'microV', required: true,
        label: `Upper margin of the aEEG trace. Compared with ${A.UPPER_THRESHOLD} microV STRICTLY: exactly ${A.UPPER_THRESHOLD} falls in no published category.`,
      },
      {
        dom: 'anaqeeb-lower', arg: 'lowerMargin', kind: 'number', unit: 'microV', required: true,
        label: `Lower margin of the aEEG trace. Compared with ${A.LOWER_THRESHOLD} microV. Cannot exceed the upper margin.`,
      },
      {
        dom: 'anaqeeb-seizures', arg: 'seizures', kind: 'enum', values: ['no', 'yes'], required: false,
        label: 'Whether seizure activity was recorded. Optional, and reported SEPARATELY: it is never folded into the amplitude category, so a normal amplitude with seizures is not moderately abnormal.',
      },
    ],
  },
];
