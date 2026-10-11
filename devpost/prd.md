# Product requirements

## Primary job
Make a screenshot shareable while allowing its owner to inspect exactly what will be downloaded.

## Screens and behavior
The app is a single workbench with three stages: image, review, export. It opens with an original synthetic receipt fixture with reserved example domains and fictional numbers. A file chooser accepts PNG, JPEG or WebP images under 12 MB and a maximum 12-million-pixel decoded image. Opened images remain in memory.

Run OCR is an explicit button. Tesseract is hosted with the app; image pixels are processed in a browser worker. Email and phone patterns produce suggestions with source bounding rectangles. These are review candidates, not an exhaustive privacy check. Each candidate must be masked or deliberately kept. A mask is opaque, never blur. The user can add and remove manual rectangles and undo the last action. A pending candidate blocks verified export.

Build export redraws the original on a fresh opaque canvas, adds accepted masks, serializes a PNG, decodes that PNG, and verifies the exact rectangle pixels and alpha values. PNG chunk inspection removes unnecessary ancillary chunks and reports the actual remaining chunk types. SHA-256 binds the review note to the downloaded bytes. Any image or mask change invalidates the prior export. Failed checks disable the download buttons.

The result has a full-resolution export preview, inspection result, counts, byte length, hash and downloads for the exact PNG and its JSON review note. The note contains dimensions and masks and excludes OCR text and the source filename. Manual visual review remains required because OCR can miss private details.

## States
Empty/custom image; loading; OCR progress; suggestions found; no candidates; OCR failure with manual tools usable; pending review; export running; verification passed; verification failed; dirty after change.

## Accessibility and responsive layout
Visible labels, keyboard focus, status live region, button disabled state, adequate contrast, controls at least 40px tall. Desktop: image workbench plus review column. Tablet/phone: stacked panels and canvas scales to available width. Keep the original-image drag coordinates mapped to natural pixel dimensions.

## Acceptance checks
Synthetic sample OCR produces visible candidates. Pending candidates block export. Accepted masks fully cover the suggested boxes. The note records the count of intentionally kept candidates. A new manual mask invalidates download. Exported selected regions decode to solid opaque pixels. The PNG contains flattened pixels and decode-essential chunks; source metadata and editable mask layers are excluded. Resizing preserves mask coordinates in source pixels. Invalid and oversized files show an error. OCR failure is shown as an incomplete scan, with manual covers still available.
