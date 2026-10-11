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

## Data handling and limits
OCR can miss email/phone text, particularly small or non-English text; the UI requires manual review. A kept candidate is an intentional decision and recorded as a count. Browser memory is not persistent storage, but browser implementation may cache assets. App code makes no image upload request. Third-party hosting still receives ordinary page requests. JPEG/WebP metadata is not copied to the PNG. Detect file signature and decoded dimensions rather than trusting filename. Prevent stale verified output and avoid private strings in logs or notes.

## Verification
Core tests cover candidate extraction, clipped rectangles, opaque pixel equality and PNG structure. The browser workflow has been exercised on the synthetic receipt, including actual OCR suggestions, manual covers, PNG and note downloads, and invalidation after a review change. See [Verification](checklist.md) for the checked output and scope.

## Dependencies and licenses
Tesseract.js and its pretrained English model are bundled with their existing licenses and notices. Asset versions, source references and hashes are recorded in [ocr-manifest.json](../dist/assets/ocr-manifest.json). Project-specific code uses the MIT license.
