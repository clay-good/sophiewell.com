# v12 audit - rmi-ovarian

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Jacobs I, Oram D, Fairbanks J, Turner J, Frost C, Grudzinskas JG. A risk of malignancy index incorporating CA 125, ultrasound and menopausal status for the accurate preoperative diagnosis of ovarian cancer. Br J Obstet Gynaecol. 1990;97(10):922-929; with the Tingulstad 1996/1999 II/III variants (re-fetched; the U and M scaling for each variant cross-read across the primary record, the NICE CG122 RMI I appendix, and an independent RMI reproduction).

`lib/gyn-v139.js rmiOvarian()` computes RMI = U x M x CA-125 over the five
ultrasound features (multilocular cyst, solid areas, bilateral lesions, ascites,
intra-abdominal metastases). The U/M scaling switches with the variant: RMI I
U {0->0, 1->1, 2-5->3} M {pre 1, post 3}; RMI II U {0-1->1, 2-5->4} M {pre 1, post
4}; RMI III U {0-1->1, 2-5->3} M {pre 1, post 3}. RMI > 200 is the conventional
high-risk threshold. Class A.

## Source-governance notes
- The U=0 case is unique to RMI I (a zero feature count gives U=0, hence RMI=0);
  RMI II/III floor U at 1, so they never return 0. This is faithfully reproduced.
- The > 200 cut is the conventional gyn-oncology-referral threshold, framed as
  such, not as a diagnosis.

## Boundary worked examples added
- RMI I, 3 features, postmenopausal, CA-125 80 -> U3 x M3 x 80 = 720, high risk.
- RMI I, 1 feature, premenopausal, CA-125 30 -> U1 x M1 x 30 = 30, lower risk.
- RMI II, 2 features, postmenopausal, CA-125 20 -> U4 x M4 x 20 = 320, high risk.
- RMI III, 1 feature, postmenopausal, CA-125 50 -> U1 x M3 x 50 = 150, lower risk.
- a zero or missing CA-125 -> valid:false.

## Edge-input handling notes
- One variant select, five feature checkboxes, a menopausal checkbox, and a
  positive CA-125; a non-positive or blank CA-125 surfaces a complete-the-fields
  fallback.

## A11y / keyboard notes
- One labeled select, six labeled checkboxes, one labeled number input; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
