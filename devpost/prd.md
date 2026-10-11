---
status: draft
---
# Product requirements

## Primary job
Make a screenshot shareable while allowing its owner to inspect exactly what will be downloaded.

## Screens and behavior
The app is a single workbench with three stages: image, review, export. It opens with an original synthetic receipt fixture with reserved example domains and fictional numbers. A file chooser accepts only PNG/JPEG/WebP under 12 MB and a maximum 12-million-pixel decoded image. Uploaded images remain in memory.

Run OCR is an explicit button. Tesseract is hosted with the app; image pixels are processed in a browser worker. Email and phone patterns produce suggestions with source bounding rectangles. These are review candidates, not an exhaustive privacy check. Each candidate must be masked or deliberately kept. A mask is opaque, never blur. The user can add and remove manual rectangles and undo the last action. A pending candidate blocks verified export.

Build export redraws the original on a fresh opaque canvas, adds accepted masks, serializes a PNG, decodes that PNG, and verifies the exact rectangle pixels and alpha values. PNG chunk inspection removes unnecessary ancillary chunks and reports the actual remaining chunk types. SHA-256 binds the review note to the downloaded bytes. Any image or mask change invalidates the prior export. Failed checks disable the download buttons.

The result has a full-resolution export preview, a concise inspection result, counts, byte length, hash and downloads for the exact PNG and a private-string-free JSON review note. The note contains dimensions and masks, not OCR text, original filenames or user contact details. It does not certify all private information was removed. Manual visual review remains required.

## States
Empty/custom image; loading; OCR progress; suggestions found; no candidates; OCR failure with manual tools usable; pending review; export running; verification passed; verification failed; dirty after change.

## Accessibility and responsive layout
Visible labels, keyboard focus, status live region, button disabled state, adequate contrast, controls at least 40px tall. Desktop: image workbench plus review column. Tablet/phone: stacked panels and canvas scales to available width. Keep the original-image drag coordinates mapped to natural pixel dimensions.

## Acceptance checks
Synthetic sample OCR produces visible candidates. Pending candidates block export. Accepted masks fully cover the suggested boxes. Kept candidates remain explicit in the note. A new manual mask invalidates download. Exported selected regions decode to solid opaque pixels. No text/EXIF ancillary chunks or original image buffers occur in the output. Resizing does not change mask pixel coordinates. Invalid and oversized files show an error. A missing OCR worker does not become a fabricated success.
