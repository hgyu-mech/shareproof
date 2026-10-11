---
status: draft
---
# Implementation specification

## Stack
Static HTML/CSS/ES modules and Canvas APIs; Tesseract.js 6.0.1 with bundled English trained data. A small Node server serves development assets. No external image submission or paid model API. Public hosting can serve dist/ as a static site.

## Modules
- core.js: strict PNG chunk parsing/allowlisting, integer clipped rectangles, solid pixel verification, candidate extraction from OCR blocks. Pure functions have Node tests.
- sample.js: original synthetic Canvas fixture using example.com and fictional details, generated at runtime.
- app.js: in-memory image/mask/review state, worker lifecycle, pointer rectangles, Canvas output, Blob decode, crypto hash, UI and downloads.
- scripts/prepare-assets.mjs: copies pinned npm OCR distributions, wasm cores, model and licenses into dist/assets/ocr/; no runtime CDN requests.

## State and invalidation
Image version and review edits invalidate verified Blob/object URL. Downloads use only the Blob whose decoded pixels and final PNG bytes were checked. Source image never appears in the review note. The mask color is RGB(36,43,42), alpha255. Solid fills use integer pixel boundaries with no soft edges. Suggestions get padding then clip to source dimensions.

## Verification scope
Selected regions only. Exact equality over every RGBA pixel in those regions; ancillary PNG chunks outside the image decode requirements are removed. Re-decode happens after stripping and hashes are computed on those exact bytes. Unsupported PNG layout, decode errors or mismatched dimensions fail closed. This is not an all-image privacy guarantee or PDF redaction.

## Threats / limits
OCR can miss email/phone text, particularly small or non-English text; the UI requires manual review. A kept candidate is an intentional decision and recorded as a count. Browser memory is not persistent storage, but browser implementation may cache assets. App code makes no image upload request. Third-party hosting still receives ordinary page requests. JPEG/WebP metadata is not copied to the PNG. Detect file signature and decoded dimensions rather than trusting filename. Prevent stale verified output and avoid private strings in logs or notes.

## Build slices
1. Canvas source → manual masks → final PNG round trip, tests and working UI.
2. Bundled OCR → reviewed candidates → failure states and note, responsive visual QA.

## Provenance
Fresh project created October 11, 2026, during the contest submission period. Official Devpost Learn Skill Pack guides used for profile, scope, PRD, spec, build and ship checks. Open-source OCR dependency and its pretrained language model are disclosed; model training is not claimed. Prior FitCheck exploration is separate and is not copied into this app.
