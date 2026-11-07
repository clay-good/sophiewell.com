# spec-v1715 — Review fixes to the biosignal tools

> Status: **SHIPPED (2026-11-07)**: fixes to `hrv-frequency-domain`, `eeg-band-power` (spec-v1705),
> `spo2-arms-accuracy`, `pwv-carotid-femoral`, `ectopy-burden` (spec-v1704) and `qrs-detect-trace` (spec-v1706).
> The catalog stays 2,386.

An independent review found these correct:

- HRV time domain;
- dsp.js (Welch's Parseval check, Hann, detrend, spline);
- the short-term frequency bands and length gates;
- the EEG band edges;
- the Bland and Altman components;
- the FDA constants;
- the PWV 80% factor and the 10 m/s reference;
- QRS detection and its speed.

It found these defects:

| # | Tool | Input | Was | Now |
|---|---|---|---|---|
| 1 | hrv-frequency-domain | 110 s, type 24-hour | ULF and VLF printed; choosing "24-hour" switched off the length rule | VLF only when longer than 5 minutes, whichever type is chosen |
| 2 | hrv-frequency-domain | 2 h with a 0.006 Hz (VLF) rhythm, 24-hour | ULF 440 ms², VLF 359.5 ms². The 64 s window resolves 0.0156 Hz, so "ULF" was the 0 Hz bin plus leakage. | ULF is not computed, and the page says why. VLF spans 0 to 0.04 Hz and includes any ULF power. |
| 3 | pwv-carotid-femoral | distance 60 (cm), or transit 0.06 (s) | 0.8 m/s, "below the reference"; 8,000 m/s | path outside 100 to 1,500 mm, or transit outside 10 to 500 ms, is refused with the unit |
| 4a | spo2-arms-accuracy | readings typed as fractions | Arms 0.03%, "within" 3.0% | refused: enter percentages |
| 4b | spo2-arms-accuracy | pairs below 70% | compared with Table 3 over all pairs | Table 3 is stated "under normal conditions ranging from 70% to 100% SpO2" (2013 guidance, read again November 7, 2026). The comparison uses those pairs only and says how many were left out. The all-pairs Arms is still shown. |
| 5 | eeg-band-power | window 0.001 s; 0.01 s | an uncaught RangeError; "gamma 100%" for a 10 Hz sine | the window must be 2 to 60 s (0.5 Hz resolution or finer) |
| 6 | qrs-detect-trace | one sample at 1e308 | NaN spread through the recursive filters and detection stopped, yet it still reported "3 beats in 10 s" | a sample beyond ±1,000,000 is refused |
| 7 | ectopy-burden | 1,440 "hours" (minutes); 1e-300 h | 3.472 per hour (60 times too low); "5e+303 per hour" | hours must be 0.1 to 2,000, and total beats over the time must be 20 to 300 per minute |

Left as is: with the 2 s default EEG window, a 0.3 Hz drift still lands in delta. At 0.5 Hz resolution nothing can
separate it, and the method line on the page states the resolution.

The `spo2-arms-accuracy` example's expected text now reads "over all pairs". Regression tests are in
`biosignal-v1704`, `biosignal-v1705` and `qrs-detect-trace-v1706`.
