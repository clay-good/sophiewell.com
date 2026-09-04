# spec-v1033 — All-zero examples, wave 2: the bedside scales

Continues `docs/spec-v1031.md`. Nine more tiles opened on their most reassuring band because their
worked example was every field at zero — this time the scales a bedside nurse scores by observation.

| Tile | Opening line, before anyone had observed anything |
| --- | --- |
| `cam-icu` | CAM-ICU negative |
| `icdsc` | ICDSC 0 of 8: below the delirium cutoff |
| `4at` | 4AT 0 of 12: delirium or significant cognitive impairment unlikely |
| `cpot` | CPOT 0 of 8: acceptable pain |
| `flacc` | FLACC 0: relaxed |
| `painad` | PAINAD 0: no pain |
| `nips` | NIPS 0 of 7: no / mild pain |
| `cries` | CRIES 0 of 10: no significant pain |
| `sos` | SOS 0 of 15: no significant withdrawal |

Six of the nine are pain scales for patients who cannot report pain themselves — an infant, a
ventilated adult, someone with advanced dementia. "No pain" is the answer that withholds analgesia,
and it was on screen before anyone looked at the patient.

Each example now describes an observation: a grimacing intubated patient fighting the ventilator
(CPOT 5), an infant with a vigorous cry and flexed limbs (NIPS 6), a child with tachycardia,
sweating, tremor and inconsolable crying (SOS 6). Every `expected` string came from the library's own
output, and `example-correctness` checks all nine end to end.

**Remaining:** 29 all-zero examples, listed in the spec-v1031 commit message. The bleeding and VTE
risk scores are the next cluster.
