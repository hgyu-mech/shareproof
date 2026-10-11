# ShareProof demonstration guide

The [published 2:20 demonstration](https://youtu.be/xkf0LrtodzU) is a silent sequence of actual browser interaction states, with English captions. It follows the synthetic receipt from local OCR through review, export inspection and a subsequent edit.

| Start | Demonstrated step |
| --- | --- |
| 0:00 | The workbench and fictional receipt |
| 0:16 | Local OCR progress and contact suggestions |
| 0:33 | Cover/keep decisions and the export gate for undecided suggestions |
| 0:53 | A manual name cover and complete-image review |
| 1:11 | Final PNG inspection, 27,480 selected pixels, hash and downloads |
| 1:38 | The actual downloaded PNG |
| 1:48 | A review change invalidates the previous inspection |
| 1:58 | Inspection scope and project checks |

## Reproduce the workflow

1. Open the app and use the fictional sample receipt.
2. Run `Find contact details`, review both suggestions and select `Cover`.
3. Add a cover over the sample name. For the bundled receipt, coordinates X 350, Y 343, width 350 and height 42 provide the demonstrated region.
4. Inspect the full image and confirm the visual-review checkbox.
5. Build the PNG and compare the decoded preview, selected-pixel count, chunk list and SHA-256.
6. Download the PNG and JSON note. Edit a cover to see the previous inspection become unavailable.

The video shows captured states rather than processing duration. Its receipt and contact details are synthetic. Verification concerns selected cover pixels and PNG contents; the complete-image review remains necessary.

[Video assembly](video-assembly.md) documents the caption sequence, source captures and reproducible encoding commands.
