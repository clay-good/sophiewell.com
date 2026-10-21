# spec-v1679 — The v908 to v932 laboratory and ventilator tools: values printed across their line

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1678](spec-v1678.md).

The rest of the v900-v1299 review. Each tool decided correctly and printed a rounded value on the other side of the
line, or took an impossible entry.

| Tool | Input | Was | Now |
|---|---|---|---|
| `sigma-metric` | sigma 2.996 | "3.00 sigma - unacceptable" | 2.996 |
| `hepatic-iron-index` | 1.898 | "1.9 - below 1.9" | 1.898 |
| `auto-peep` | 0.04 cmH2O; plateau below total PEEP; negative PEEP | "Auto-PEEP 0"; a negative driving pressure; accepted | 0.04; refused; refused |
| `reference-change-value` | change 13.86% against an RCV of 13.859% | "13.9% exceeds 13.86%" | both printed to the digits that separate them |
| `hys-law`, `udca-response`, `cohens-kappa`, `airway-resistance` | ratios, months and kappa at their cuts | printed rounded across the cut | printed on their judged side; UDCA refuses negative labs |
| `biological-variation-goals` | between-subject CV -3 | silently skipped the bias goal | refused |

## Proof

`test/unit/review-fixes-v908-v932.test.js`.
