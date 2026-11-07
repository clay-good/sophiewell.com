# spec-v1706 — Beat detection by Pan-Tompkins (biosignal-analysis tool 1)

> Status: **SHIPPED (2026-11-07)** after its ship gate: `qrs-detect-trace`. With it every tool of
> [biosignal-analysis](../openspec/changes/biosignal-analysis/tasks.md) is built (spec-v1704 to v1706).

## What shipped

`lib/qrs-detect-trace-v1706.js`: the windowed-sinc resampler to 200 samples/s, the paper's low-pass, the high-pass
built from the paper's sentence (its printed equation is not a high-pass; the header says why), derivative, squaring,
the 150 ms integral, and the decision rules with search-back, the irregular-rhythm halving, the refractory period and
the T-wave test. Output: R-peak times and indices, RR intervals, mean rate, search-back count, a tachogram, and links
that hand the intervals to `hrv-time-domain` and `hrv-frequency-domain`.

## The ship gate

`node scripts/validate-qrs-mitdb.mjs PATH --markdown` on the MIT-BIH Arrhythmia Database (PhysioNet,
doi:10.13026/C2F305, ODC-By 1.0), first channel, 150 ms window, every reference beat code, nothing excluded (not even
record 207's ventricular flutter, which the AAMI convention would leave out):

| Record | Beats | Se % | +P % | FN | FP |
|---|---|---|---|---|---|
| 100 | 2273 | 99.96 | 100.00 | 1 | 0 |
| 101 | 1865 | 99.95 | 99.79 | 1 | 4 |
| 102 (paced) | 2187 | 100.00 | 100.00 | 0 | 0 |
| 103 | 2084 | 99.95 | 100.00 | 1 | 0 |
| 104 (paced) | 2229 | 100.00 | 99.87 | 0 | 3 |
| 105 | 2572 | 99.65 | 97.23 | 9 | 73 |
| 106 | 2027 | 99.90 | 100.00 | 2 | 0 |
| 107 (paced) | 2137 | 99.53 | 99.95 | 10 | 1 |
| 108 | 1763 | 99.77 | 93.51 | 4 | 122 |
| 109 | 2532 | 99.92 | 100.00 | 2 | 0 |
| 111 | 2124 | 99.95 | 99.91 | 1 | 2 |
| 112 | 2539 | 100.00 | 100.00 | 0 | 0 |
| 113 | 1795 | 99.94 | 100.00 | 1 | 0 |
| 114 | 1879 | 99.10 | 92.91 | 17 | 142 |
| 115 | 1953 | 100.00 | 100.00 | 0 | 0 |
| 116 | 2412 | 99.05 | 99.87 | 23 | 3 |
| 117 | 1535 | 100.00 | 100.00 | 0 | 0 |
| 118 | 2278 | 100.00 | 100.00 | 0 | 0 |
| 119 | 1987 | 100.00 | 100.00 | 0 | 0 |
| 121 | 1863 | 99.89 | 100.00 | 2 | 0 |
| 122 | 2476 | 100.00 | 100.00 | 0 | 0 |
| 123 | 1518 | 100.00 | 100.00 | 0 | 0 |
| 124 | 1619 | 100.00 | 100.00 | 0 | 0 |
| 200 | 2601 | 99.92 | 99.88 | 2 | 3 |
| 201 | 1963 | 99.29 | 100.00 | 14 | 0 |
| 202 | 2136 | 99.91 | 100.00 | 2 | 0 |
| 203 | 2980 | 98.96 | 99.49 | 31 | 15 |
| 205 | 2656 | 99.89 | 100.00 | 3 | 0 |
| 207 | 1860 | 99.95 | 81.14 | 1 | 432 |
| 208 | 2955 | 99.46 | 99.80 | 16 | 6 |
| 209 | 3005 | 100.00 | 99.90 | 0 | 3 |
| 210 | 2650 | 99.21 | 99.70 | 21 | 8 |
| 212 | 2748 | 100.00 | 100.00 | 0 | 0 |
| 213 | 3251 | 99.94 | 100.00 | 2 | 0 |
| 214 | 2262 | 99.87 | 100.00 | 3 | 0 |
| 215 | 3363 | 100.00 | 100.00 | 0 | 0 |
| 217 (paced) | 2208 | 99.77 | 99.95 | 5 | 1 |
| 219 | 2154 | 100.00 | 100.00 | 0 | 0 |
| 220 | 2048 | 100.00 | 100.00 | 0 | 0 |
| 221 | 2427 | 99.92 | 100.00 | 2 | 0 |
| 222 | 2483 | 99.88 | 96.31 | 3 | 95 |
| 223 | 2605 | 99.96 | 100.00 | 1 | 0 |
| 228 | 2053 | 97.91 | 98.92 | 43 | 22 |
| 230 | 2256 | 100.00 | 100.00 | 0 | 0 |
| 231 | 1571 | 100.00 | 100.00 | 0 | 0 |
| 232 | 1780 | 100.00 | 99.83 | 0 | 3 |
| 233 | 3079 | 99.97 | 100.00 | 1 | 0 |
| 234 | 2753 | 100.00 | 100.00 | 0 | 0 |

Non-paced aggregate: sensitivity 99.79%, positive predictivity 99.08% (TP 100524, FN 209, FP 933). Gate: both at least 99%: met.

The first version scored 91.6% and 95.3%. Four changes reached the gate, each labeled in the code as a project
addition: the starting level is removed before filtering (record 232 begins at 975 units, and the filters' ringing
from that step set thresholds no beat could reach: zero detections); the T-wave test also guards search-back (record
119's ventricular bigeminy put each PVC's T wave in as a beat); inside the refractory period a much larger peak
replaces the one just taken; and, reading a whole recording, of two detections under 240 ms apart one with under half
the other's integrated peak is dropped (record 108's large P waves). Record 207 (ventricular flutter) and 108 remain the
weakest.

## Filter checks (design.md)

The high-pass impulse response ends at sample 31; its gain at 50 Hz is 32.0000; its -3 dB point 4.718 Hz; the cascade's
band 4.91 to 11.78 Hz. A synthetic 360 Hz trace with a complex every 1.000 s for 10 s gives 10 R-peaks and nine 1,000 ms
intervals.

## Proof

`test/unit/qrs-detect-trace-v1706.test.js`: the filter checks, the synthetic trace, every beat of the first 20 seconds
of record 100 within 150 ms (`test/fixtures/mitdb/100-first-20s.json`), a trace starting far from zero, and refusals.
