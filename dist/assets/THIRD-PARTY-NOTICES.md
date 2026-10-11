# Bundled OCR dependencies

Tesseract.js 6.0.1 and Tesseract.js-core 6.1.2 are distributed under their original Apache-2.0 licenses. Browser distribution notices and all installed dependency license/notice files are retained in this directory. See ocr-manifest.json for exact versions, file hashes, declarations, and locations.

The published worker also embeds buffer 6.0.3 (MIT) and ieee754 1.2.1 (BSD-3-Clause), which are not installed production dependencies of this project. Full original license texts are retained in licenses/buffer/LICENSE and licenses/ieee754/LICENSE, alongside the worker's extracted notices. These versions are identified by Tesseract.js v6.0.1's upstream build lockfile; pinned license sources, hashes and the version basis are recorded under embeddedPackages in the manifest.

English trained data comes from @tesseract.js-data/eng 1.0.0, 4.0.0_best_int. Its npm package declares MIT without an included license text, while the upstream naptha/tessdata repository publishes Apache-2.0. The manifest preserves the package declaration and licenses/naptha-tessdata-upstream.LICENSE preserves the actual upstream license.

No third-party code or model file has been modified. The project-specific source is separately licensed by the project.
